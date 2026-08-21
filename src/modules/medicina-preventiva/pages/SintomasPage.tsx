import { useEffect, useState } from "react";
import {
    Activity,
    Camera,
    Loader2,
    MessageCircle,
    CheckCircle2,
    ImageIcon,
    AlertCircle,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { assinarArquivo, uploadArquivo } from "@/lib/uploadArquivo";
import { MiCard } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { sintomasService } from "../services/sintomasService";
import { getMpScope } from "../services/mpScope";
import { MP_SINTOMAS_PASTA } from "../lib/storage";
import { fmtDataHora } from "../lib/datas";
import type {
    RegistroSintoma,
    SintomaCatalogo,
    SintomaIntensidade,
    Unidade,
} from "../types";

const INTENSIDADES: { id: SintomaIntensidade; label: string; cor: string }[] = [
    { id: "leve", label: "Leve", cor: "bg-emerald-100 text-emerald-700 border-emerald-300" },
    { id: "media", label: "Moderada", cor: "bg-amber-100 text-amber-700 border-amber-300" },
    { id: "forte", label: "Forte", cor: "bg-rose-100 text-rose-700 border-rose-300" },
];

const STATUS_LABEL: Record<RegistroSintoma["status"], string> = {
    novo: "Enviado",
    em_analise: "Em análise",
    respondido: "Respondido",
    arquivado: "Arquivado",
};

export default function SintomasPage() {
    const [catalogo, setCatalogo] = useState<SintomaCatalogo[]>([]);
    const [historico, setHistorico] = useState<RegistroSintoma[]>([]);
    const [unidade, setUnidade] = useState<Unidade | null>(null);

    const [selecionados, setSelecionados] = useState<string[]>([]);
    const [intensidade, setIntensidade] = useState<SintomaIntensidade>("media");
    const [observacao, setObservacao] = useState("");
    const [fotoPath, setFotoPath] = useState<string>("");
    const [fotoNome, setFotoNome] = useState<string>("");
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [ultimo, setUltimo] = useState<RegistroSintoma | null>(null);
    const [linkWhatsapp, setLinkWhatsapp] = useState<string | null>(null);

    useEffect(() => {
        sintomasService.listCatalogo().then(setCatalogo);
        sintomasService.listRegistros().then(setHistorico);
        sintomasService.unidadeAtual().then(setUnidade);
    }, []);

    const numeroConfigurado = Boolean(unidade?.whatsappNumero?.replace(/\D/g, ""));

    function alternarSintoma(id: string) {
        setSelecionados((atual) =>
            atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id]
        );
    }

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setEnviandoFoto(true);
        try {
            const scope = await getMpScope();
            if (!scope?.titularId) throw new Error("Conta sem paciente vinculado.");

            const anexo = await uploadArquivo({
                file,
                titularId: scope.titularId,
                pasta: MP_SINTOMAS_PASTA,
            });
            setFotoPath(anexo.path);
            setFotoNome(anexo.nome);
        } catch (err) {
            toast({
                title: "Erro no upload",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setEnviandoFoto(false);
        }
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (salvando || enviandoFoto) return;

        if (selecionados.length === 0 && !observacao.trim()) {
            toast({
                title: "Conte o que está sentindo",
                description: "Escolha ao menos um sintoma ou escreva uma observação.",
                variant: "destructive",
            });
            return;
        }

        setSalvando(true);
        try {
            const sintomas = selecionados.map((id) => ({
                id,
                nome: catalogo.find((c) => c.id === id)?.nome ?? "",
            }));

            const registro = await sintomasService.registrar({
                sintomas,
                intensidade,
                observacao: observacao.trim(),
                fotoPath: fotoPath || undefined,
            });

            setUltimo(registro);
            setLinkWhatsapp(await sintomasService.montarLinkWhatsapp(registro));
            setHistorico(await sintomasService.listRegistros());

            setSelecionados([]);
            setObservacao("");
            setFotoPath("");
            setFotoNome("");
            setIntensidade("media");

            toast({ title: "Registro enviado para a clínica" });
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

    async function enviarWhatsapp() {
        if (!ultimo || !linkWhatsapp) return;
        window.open(linkWhatsapp, "_blank", "noopener");
        await sintomasService.marcarWhatsappEnviado(ultimo.id);
        setHistorico(await sintomasService.listRegistros());
    }

    async function reenviarWhatsapp(registro: RegistroSintoma) {
        const link = await sintomasService.montarLinkWhatsapp(registro);
        if (!link) {
            toast({
                title: "WhatsApp não configurado",
                description: "A clínica ainda não cadastrou o número da unidade.",
                variant: "destructive",
            });
            return;
        }
        window.open(link, "_blank", "noopener");
        await sintomasService.marcarWhatsappEnviado(registro.id);
        setHistorico(await sintomasService.listRegistros());
    }

    async function verFoto(path: string) {
        const url = await assinarArquivo(path);
        if (url) window.open(url, "_blank", "noopener");
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                eyebrow="Sintomas"
                title="Registro de sintomas"
                subtitle="Conte o que está sentindo. A clínica recebe na hora."
            />

            {ultimo && (
                <MiCard variant="accent" className="p-5">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-[#5ba58c] shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-[#255f4f]">Registro salvo</p>
                            <p className="text-sm text-[#6b8c7d] mt-0.5">
                                A clínica já foi avisada pelo painel. Se quiser, mande também no
                                WhatsApp
                                {unidade?.nome ? ` da unidade ${unidade.nome}` : ""}.
                            </p>

                            <Button
                                type="button"
                                onClick={enviarWhatsapp}
                                disabled={!linkWhatsapp}
                                className="mt-3 w-full sm:w-auto bg-[#25D366] hover:bg-[#1fb855] text-white rounded-xl"
                            >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Enviar no WhatsApp da clínica
                            </Button>

                            {!linkWhatsapp && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    A clínica ainda não cadastrou o WhatsApp desta unidade.
                                </p>
                            )}
                        </div>
                    </div>
                </MiCard>
            )}

            <form onSubmit={salvar} className="space-y-4">
                <MiCard className="p-4 sm:p-5 space-y-4">
                    <div>
                        <p className="text-sm font-bold text-[#255f4f] mb-2">
                            O que você está sentindo?
                        </p>
                        {catalogo.length === 0 ? (
                            <p className="text-xs text-[#9db4aa]">
                                A clínica ainda não cadastrou a lista de sintomas. Você pode
                                descrever no campo de observação abaixo.
                            </p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {catalogo.map((s) => {
                                    const ativo = selecionados.includes(s.id);
                                    return (
                                        <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => alternarSintoma(s.id)}
                                            className={clsx(
                                                "px-3 py-2 rounded-full text-xs font-semibold border transition",
                                                ativo
                                                    ? "bg-[#255f4f] text-white border-[#255f4f]"
                                                    : "bg-white text-[#6b8c7d] border-[#e6efe9] hover:bg-[#f8fcfb]"
                                            )}
                                        >
                                            {s.nome}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-sm font-bold text-[#255f4f] mb-2">Intensidade</p>
                        <div className="grid grid-cols-3 gap-2">
                            {INTENSIDADES.map((i) => {
                                const ativo = intensidade === i.id;
                                return (
                                    <button
                                        key={i.id}
                                        type="button"
                                        onClick={() => setIntensidade(i.id)}
                                        className={clsx(
                                            "py-2.5 rounded-xl text-xs font-bold border transition",
                                            ativo
                                                ? i.cor
                                                : "bg-white text-[#6b8c7d] border-[#e6efe9]"
                                        )}
                                    >
                                        {i.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-[#255f4f]">Observação</label>
                        <Textarea
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                            rows={3}
                            placeholder="Desde quando sente, o que melhora ou piora..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#255f4f]">Foto (opcional)</label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#c2e1d4] text-sm text-[#5ba58c] font-semibold">
                                {enviandoFoto ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Camera className="h-4 w-4" />
                                )}
                                {enviandoFoto ? "Enviando..." : "Adicionar foto"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFoto}
                                />
                            </label>
                            {fotoNome && (
                                <span className="text-xs text-[#6b8c7d] truncate max-w-[160px]">
                                    {fotoNome}
                                </span>
                            )}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={salvando || enviandoFoto}
                        className="w-full bg-[#5ba58c] text-white rounded-xl h-12 text-base font-bold"
                    >
                        {salvando ? "Enviando..." : "Salvar e avisar a clínica"}
                    </Button>

                    {!numeroConfigurado && (
                        <p className="text-[11px] text-[#9db4aa] text-center">
                            O envio pelo WhatsApp fica disponível quando a clínica cadastrar o
                            número da unidade.
                        </p>
                    )}
                </MiCard>
            </form>

            {historico.length > 0 && (
                <section className="space-y-2">
                    <h2 className="text-base font-bold text-[#255f4f]">Meus registros</h2>
                    <div className="space-y-2">
                        {historico.map((r) => (
                            <MiCard key={r.id} className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="shrink-0 p-2.5 rounded-xl bg-rose-50 text-rose-500">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-bold text-[#255f4f]">
                                                {r.sintomas.map((s) => s.nome).join(", ") ||
                                                    "Registro"}
                                            </p>
                                            <span className="text-[10px] font-bold text-[#5ba58c] bg-[#e3f1eb] px-2 py-0.5 rounded-full">
                                                {STATUS_LABEL[r.status]}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-[#9db4aa] mt-0.5">
                                            {fmtDataHora(r.criadoEm)}
                                        </p>
                                        {r.observacao && (
                                            <p className="text-xs text-[#6b8c7d] mt-1">
                                                {r.observacao}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 mt-2">
                                            {r.fotoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => verFoto(r.fotoUrl!)}
                                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#5ba58c] hover:underline"
                                                >
                                                    <ImageIcon className="h-3.5 w-3.5" />
                                                    Ver foto
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => reenviarWhatsapp(r)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
                                            >
                                                <MessageCircle className="h-3.5 w-3.5" />
                                                {r.whatsappEnviado
                                                    ? "Enviar de novo"
                                                    : "Enviar no WhatsApp"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </MiCard>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
