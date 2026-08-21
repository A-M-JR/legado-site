import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Building2, Plus, Loader2, Trash2, MessageCircle, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { maskTelefone } from "@/lib/masks";
import { unidadesService, type ParceiroConfig } from "../services/unidadesService";
import { isParceiroAdmin, listPacientes, type PacienteResumo } from "../services/parceiroScope";
import type { Unidade } from "@/modules/medicina-preventiva/types";

const FORM_INICIAL = {
    nome: "",
    whatsappNumero: "",
    telefone: "",
    endereco: "",
};

export default function UnidadesPage() {
    const { userProfile } = useOutletContext<{
        userProfile?: { role?: string; parceiro_id?: string | null };
    }>();
    const podeEditar = isParceiroAdmin(userProfile?.role);
    const parceiroId = userProfile?.parceiro_id ?? null;

    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [config, setConfig] = useState<ParceiroConfig>({
        mensagemPadrao: "",
        unidadePadraoId: null,
    });
    const [pacientes, setPacientes] = useState<PacienteResumo[]>([]);
    const [vinculos, setVinculos] = useState<Map<string, string | null>>(new Map());
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);
    const [salvandoConfig, setSalvandoConfig] = useState(false);

    async function carregar() {
        setLoading(true);
        const [lista, cfg] = await Promise.all([
            unidadesService.list(),
            unidadesService.getConfig(),
        ]);
        setUnidades(lista);
        setConfig(cfg);
        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    useEffect(() => {
        if (!parceiroId) return;
        listPacientes(parceiroId).then(async (lista) => {
            setPacientes(lista);
            const mapa = new Map<string, string | null>();
            for (const p of lista) {
                mapa.set(p.titularId, await unidadesService.getUnidadeDoPaciente(p.titularId));
            }
            setVinculos(mapa);
        });
    }, [parceiroId]);

    async function salvarUnidade(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nome.trim() || salvando) return;

        setSalvando(true);
        try {
            await unidadesService.create({
                nome: form.nome.trim(),
                whatsappNumero: form.whatsappNumero.replace(/\D/g, ""),
                telefone: form.telefone.replace(/\D/g, ""),
                endereco: form.endereco.trim(),
            });
            setForm(FORM_INICIAL);
            setModalAberto(false);
            toast({ title: "Unidade cadastrada" });
            carregar();
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

    async function atualizarUnidade(u: Unidade, dados: Partial<Unidade>) {
        try {
            await unidadesService.update(u.id, dados);
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function removerUnidade(u: Unidade) {
        try {
            await unidadesService.remove(u.id);
            toast({ title: "Unidade removida" });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao remover",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function salvarConfig() {
        setSalvandoConfig(true);
        try {
            await unidadesService.salvarConfig(config);
            toast({ title: "Configuração salva" });
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvandoConfig(false);
        }
    }

    async function vincular(titularId: string, unidadeId: string) {
        try {
            await unidadesService.vincularPaciente(titularId, unidadeId || null);
            setVinculos((m) => new Map(m).set(titularId, unidadeId || null));
            toast({ title: "Paciente vinculado" });
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Unidades e WhatsApp</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        O número cadastrado aqui é o que o paciente aciona ao registrar sintomas.
                    </p>
                </div>
                {podeEditar && (
                    <Button
                        onClick={() => setModalAberto(true)}
                        className="bg-[#5ba58c] text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Nova unidade
                    </Button>
                )}
            </div>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                </div>
            ) : (
                <>
                    <div className="grid gap-3 md:grid-cols-2">
                        {unidades.length === 0 ? (
                            <Card className="md:col-span-2">
                                <CardContent className="py-12 text-center text-sm text-[#6b8c7d]">
                                    Nenhuma unidade cadastrada. Cadastre ao menos uma para liberar o
                                    botão de WhatsApp no app do paciente.
                                </CardContent>
                            </Card>
                        ) : (
                            unidades.map((u) => (
                                <Card key={u.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <CardTitle className="text-base text-[#255f4f] flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-[#5ba58c]" />
                                                {u.nome}
                                            </CardTitle>
                                            {podeEditar && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removerUnidade(u)}
                                                    className="text-rose-500 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#4f665a] flex items-center gap-1.5">
                                                <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
                                                WhatsApp da unidade
                                            </label>
                                            <Input
                                                defaultValue={maskTelefone(u.whatsappNumero)}
                                                disabled={!podeEditar}
                                                onBlur={(e) =>
                                                    atualizarUnidade(u, {
                                                        whatsappNumero: e.target.value.replace(
                                                            /\D/g,
                                                            ""
                                                        ),
                                                    })
                                                }
                                                placeholder="(00) 00000-0000"
                                            />
                                            {!u.whatsappNumero && (
                                                <p className="text-[11px] text-amber-600">
                                                    Sem número: o botão fica desativado no app.
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-[#4f665a]">
                                                Endereço
                                            </label>
                                            <Input
                                                defaultValue={u.endereco}
                                                disabled={!podeEditar}
                                                onBlur={(e) =>
                                                    atualizarUnidade(u, {
                                                        endereco: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold text-[#4f665a]">
                                                Unidade ativa
                                            </span>
                                            <Switch
                                                checked={u.ativo}
                                                disabled={!podeEditar}
                                                onCheckedChange={(v) =>
                                                    atualizarUnidade(u, { ativo: v })
                                                }
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-[#255f4f]">
                                Mensagem padrão do WhatsApp
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                value={config.mensagemPadrao}
                                disabled={!podeEditar}
                                onChange={(e) =>
                                    setConfig((c) => ({ ...c, mensagemPadrao: e.target.value }))
                                }
                                rows={2}
                                placeholder="Olá! Registrei novos sintomas no app."
                            />

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Unidade padrão (usada quando o paciente não tem vínculo)
                                </label>
                                <select
                                    value={config.unidadePadraoId ?? ""}
                                    disabled={!podeEditar}
                                    onChange={(e) =>
                                        setConfig((c) => ({
                                            ...c,
                                            unidadePadraoId: e.target.value || null,
                                        }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">Nenhuma</option>
                                    {unidades.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {podeEditar && (
                                <Button
                                    onClick={salvarConfig}
                                    disabled={salvandoConfig}
                                    className="bg-[#5ba58c] text-white"
                                >
                                    {salvandoConfig ? "Salvando..." : "Salvar configuração"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-[#255f4f] flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#5ba58c]" />
                                Pacientes por unidade
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {pacientes.length === 0 ? (
                                <p className="text-sm text-[#6b8c7d]">
                                    Nenhum paciente na carteira ainda.
                                </p>
                            ) : (
                                pacientes.map((p) => (
                                    <div
                                        key={p.titularId}
                                        className="flex items-center justify-between gap-3 border-b border-[#f0f6f3] py-2 last:border-0"
                                    >
                                        <span className="text-sm text-[#255f4f]">{p.nome}</span>
                                        <select
                                            value={vinculos.get(p.titularId) ?? ""}
                                            onChange={(e) => vincular(p.titularId, e.target.value)}
                                            className="h-9 rounded-md border border-input bg-background px-2 text-xs"
                                        >
                                            <option value="">Unidade padrão</option>
                                            {unidades.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.nome}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Nova unidade</DialogTitle>
                        <DialogDescription>
                            Cada unidade tem o próprio número de WhatsApp.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvarUnidade} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Nome</label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                                placeholder="Unidade Centro"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    WhatsApp
                                </label>
                                <Input
                                    value={form.whatsappNumero}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            whatsappNumero: maskTelefone(e.target.value),
                                        }))
                                    }
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Telefone fixo
                                </label>
                                <Input
                                    value={form.telefone}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            telefone: maskTelefone(e.target.value),
                                        }))
                                    }
                                    maxLength={15}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Endereço</label>
                            <Input
                                value={form.endereco}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, endereco: e.target.value }))
                                }
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-[#5ba58c] text-white"
                            >
                                {salvando ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
