import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { BellRing, CalendarClock, Check, Loader2, RefreshCw, Send, Undo2 } from "lucide-react";
import clsx from "clsx";
import { toast } from "@/hooks/use-toast";
import {
    LEMBRETE_CONFIG_PADRAO,
    lembretesService,
    montarMensagem,
    numeroWhatsapp,
    type LembreteConfig,
    type LembretePendente,
} from "../services/lembretesService";
import { isParceiroAdmin } from "../services/parceiroScope";
import { fmtDataHora } from "@/modules/medicina-preventiva/lib/datas";

/** Opções de antecedência oferecidas na tela. */
const DIAS_OPCOES = [
    { valor: 0, label: "No dia" },
    { valor: 1, label: "1 dia antes" },
    { valor: 2, label: "2 dias antes" },
    { valor: 3, label: "3 dias antes" },
    { valor: 7, label: "7 dias antes" },
    { valor: 15, label: "15 dias antes" },
];

function rotuloJanela(dias: number): string {
    if (dias <= 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    return `Em ${dias} dias`;
}

export default function LembretesPage() {
    const { userProfile } = useOutletContext<{ userProfile?: { role?: string | null } }>();
    const podeEditar = isParceiroAdmin(userProfile?.role);

    const [config, setConfig] = useState<LembreteConfig>(LEMBRETE_CONFIG_PADRAO);
    const [pendentes, setPendentes] = useState<LembretePendente[]>([]);
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [gerando, setGerando] = useState(false);
    const [marcandoId, setMarcandoId] = useState<string | null>(null);

    const carregarLista = useCallback(async (cfg: LembreteConfig) => {
        setPendentes(await lembretesService.listPendentes(cfg));
    }, []);

    useEffect(() => {
        let vivo = true;
        (async () => {
            const cfg = await lembretesService.getConfig();
            if (!vivo) return;
            setConfig(cfg);
            await carregarLista(cfg);
            if (vivo) setLoading(false);
        })();
        return () => {
            vivo = false;
        };
    }, [carregarLista]);

    function alternarDia(valor: number) {
        setConfig((c) => {
            const tem = c.dias.includes(valor);
            if (!tem && c.dias.length >= 5) {
                toast({
                    title: "Máximo de 5 avisos",
                    description: "Desmarque uma antecedência antes de somar outra.",
                });
                return c;
            }
            const dias = tem ? c.dias.filter((d) => d !== valor) : [...c.dias, valor];
            return { ...c, dias: dias.sort((a, b) => b - a) };
        });
    }

    async function salvar() {
        if (salvando) return;
        if (config.dias.length === 0) {
            toast({
                title: "Escolha a antecedência",
                description: "Marque pelo menos um aviso, ou desligue o lembrete.",
                variant: "destructive",
            });
            return;
        }

        setSalvando(true);
        try {
            await lembretesService.salvarConfig(config);
            await carregarLista(config);
            toast({
                title: "Configuração salva",
                description: config.ativo
                    ? `Avisos ${config.dias.map(rotuloJanela).join(", ").toLowerCase()} às ${config.hora}.`
                    : "Lembretes automáticos desligados.",
            });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    /** Gera as notificações do app que já venceram, sem esperar o horário do cron. */
    async function gerarAgora() {
        if (gerando) return;
        setGerando(true);
        try {
            const criados = await lembretesService.gerarAgora();
            await carregarLista(config);
            toast({
                title: criados ? `${criados} aviso(s) enviados no app` : "Nada pendente",
                description: criados
                    ? "Os pacientes já veem no sino de notificações."
                    : "Todos os lembretes desta janela já haviam sido enviados.",
            });
        } catch (err) {
            toast({
                title: "Erro ao gerar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setGerando(false);
        }
    }

    function chaveItem(item: LembretePendente): string {
        return `${item.consulta.id}|${item.diasAntes}`;
    }

    async function enviarWhatsapp(item: LembretePendente) {
        const numero = numeroWhatsapp(item.telefone);
        if (!numero) {
            toast({
                title: "Paciente sem telefone",
                description: "Cadastre o telefone do paciente para usar o atalho.",
                variant: "destructive",
            });
            return;
        }

        const texto = montarMensagem(config.mensagem, {
            paciente: item.pacienteNome,
            consulta: item.consulta,
            diasAntes: item.diasAntes,
        });

        window.open(
            `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
            "_blank",
            "noopener"
        );

        setMarcandoId(chaveItem(item));
        try {
            await lembretesService.marcarWhatsapp(item);
            await carregarLista(config);
        } catch (err) {
            toast({
                title: "Aviso não registrado",
                description:
                    err instanceof Error
                        ? err.message
                        : "A mensagem abriu, mas não conseguimos marcar como enviada.",
                variant: "destructive",
            });
        } finally {
            setMarcandoId(null);
        }
    }

    async function desmarcar(item: LembretePendente) {
        setMarcandoId(chaveItem(item));
        try {
            await lembretesService.desmarcarWhatsapp(item);
            await carregarLista(config);
            toast({ title: "Marcação desfeita" });
        } catch (err) {
            toast({
                title: "Erro ao desfazer",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setMarcandoId(null);
        }
    }

    const aFazer = pendentes.filter((p) => !p.avisadoNoWhatsapp);
    const feitos = pendentes.filter((p) => p.avisadoNoWhatsapp);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Lembretes de consulta</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        O app avisa sozinho no sino do paciente. Aqui você reforça por WhatsApp.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={gerarAgora}
                    disabled={gerando || loading}
                    className="shrink-0"
                >
                    {gerando ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Gerar avisos agora
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f] flex items-center gap-2">
                        <BellRing className="h-4 w-4 text-[#5ba58c]" />
                        Quando avisar
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#f4fbf8] px-4 py-3">
                        <div>
                            <p className="text-sm font-semibold text-[#255f4f]">
                                Lembrete automático no app
                            </p>
                            <p className="text-xs text-[#6b8c7d]">
                                Cria a notificação no sino do paciente sem ninguém precisar clicar.
                            </p>
                        </div>
                        <Switch
                            checked={config.ativo}
                            disabled={!podeEditar}
                            onCheckedChange={(v) => setConfig((c) => ({ ...c, ativo: v }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#4f665a]">
                            Antecedência (pode marcar mais de uma, até 5)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {DIAS_OPCOES.map((op) => {
                                const ativo = config.dias.includes(op.valor);
                                return (
                                    <button
                                        key={op.valor}
                                        type="button"
                                        disabled={!podeEditar}
                                        onClick={() => alternarDia(op.valor)}
                                        className={clsx(
                                            "px-3 h-9 rounded-full text-sm font-semibold border transition-colors disabled:opacity-60",
                                            ativo
                                                ? "bg-[#5ba58c] text-white border-[#5ba58c]"
                                                : "bg-white text-[#4f665a] border-[#d7e8e0] hover:border-[#5ba58c]"
                                        )}
                                    >
                                        {op.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Hora do disparo
                            </label>
                            <Input
                                type="time"
                                value={config.hora}
                                disabled={!podeEditar}
                                onChange={(e) =>
                                    setConfig((c) => ({ ...c, hora: e.target.value.slice(0, 5) }))
                                }
                            />
                            <p className="text-[11px] text-[#9db4aa]">
                                Horário de Brasília. O disparo acontece na virada da hora.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-[#4f665a]">
                            Mensagem do WhatsApp
                        </label>
                        <Textarea
                            value={config.mensagem}
                            disabled={!podeEditar}
                            onChange={(e) => setConfig((c) => ({ ...c, mensagem: e.target.value }))}
                            rows={3}
                        />
                        <p className="text-[11px] text-[#9db4aa]">
                            Use <code>{"{paciente}"}</code>, <code>{"{quando}"}</code>,{" "}
                            <code>{"{profissional}"}</code> e <code>{"{local}"}</code> — trocamos
                            pelos dados da consulta.
                        </p>
                    </div>

                    {podeEditar ? (
                        <Button
                            onClick={salvar}
                            disabled={salvando}
                            className="bg-[#5ba58c] text-white"
                        >
                            {salvando ? "Salvando..." : "Salvar configuração"}
                        </Button>
                    ) : (
                        <p className="text-xs text-[#9db4aa]">
                            Só o administrador da clínica altera esta configuração.
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f] flex items-center gap-2">
                        <CalendarClock className="h-4 w-4 text-[#5ba58c]" />
                        A avisar por WhatsApp ({aFazer.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {loading ? (
                        <div className="py-10 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : aFazer.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#6b8c7d]">
                            Nenhuma consulta na janela de aviso.
                        </p>
                    ) : (
                        aFazer.map((item) => (
                            <div
                                key={chaveItem(item)}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-[#e3f1eb] px-4 py-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-[#255f4f] truncate">
                                            {item.pacienteNome || "Paciente"}
                                        </p>
                                        <span className="text-[10px] font-bold text-[#255f4f] bg-[#e3f1eb] px-2 py-0.5 rounded-full">
                                            {rotuloJanela(item.diasAntes)}
                                        </span>
                                        {item.avisadoNoApp && (
                                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Check className="h-3 w-3" /> avisado no app
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-[#4f665a] mt-0.5">
                                        {fmtDataHora(item.consulta.dataHora)}
                                        {item.consulta.profissional
                                            ? ` · ${item.consulta.profissional}`
                                            : ""}
                                        {item.consulta.local ? ` · ${item.consulta.local}` : ""}
                                    </p>
                                    {!item.telefone && (
                                        <p className="text-[11px] text-rose-500 mt-0.5">
                                            Paciente sem telefone cadastrado.
                                        </p>
                                    )}
                                </div>

                                <Button
                                    onClick={() => enviarWhatsapp(item)}
                                    disabled={marcandoId === chaveItem(item) || !item.telefone}
                                    className="bg-[#5ba58c] text-white shrink-0"
                                >
                                    {marcandoId === chaveItem(item) ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="mr-2 h-4 w-4" />
                                    )}
                                    Avisar no WhatsApp
                                </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>

            {feitos.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-[#255f4f]">
                            Já avisados por WhatsApp ({feitos.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {feitos.map((item) => (
                            <div
                                key={chaveItem(item)}
                                className="flex items-center gap-3 rounded-xl bg-[#f9fdfb] px-4 py-2.5"
                            >
                                <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#255f4f] truncate">
                                        {item.pacienteNome || "Paciente"}
                                        <span className="ml-2 text-xs font-normal text-[#6b8c7d]">
                                            {rotuloJanela(item.diasAntes)} ·{" "}
                                            {fmtDataHora(item.consulta.dataHora)}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Desfazer marcação"
                                    onClick={() => desmarcar(item)}
                                    disabled={marcandoId === chaveItem(item)}
                                    className="text-[#9db4aa] shrink-0"
                                >
                                    {marcandoId === chaveItem(item) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Undo2 className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
