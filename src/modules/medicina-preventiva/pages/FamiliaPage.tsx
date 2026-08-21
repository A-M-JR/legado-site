import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Users,
    User,
    ChevronRight,
    Plus,
    Camera,
    Loader2,
    Trash2,
    MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { uploadImagem } from "@/lib/uploadImage";
import { MiCard } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { redeService } from "../services/redeService";
import { familiaMensagensService } from "../services/familiaMensagensService";
import { getPacienteCard, type PacienteCard } from "../services/mpScope";
import { MP_REDE_FOLDER, MP_STORAGE_BUCKET } from "../lib/storage";
import type { PessoaRede } from "../types";

const RELACOES = [
    "Filho(a)",
    "Cônjuge",
    "Neto(a)",
    "Irmão(ã)",
    "Cuidador(a)",
    "Amigo(a)",
    "Outro",
];

const FORM_INICIAL = { nome: "", relacao: "", fotoUrl: "" };

export default function FamiliaPage() {
    const navigate = useNavigate();
    const [rede, setRede] = useState<PessoaRede[]>([]);
    const [paciente, setPaciente] = useState<PacienteCard | null>(null);
    const [contagem, setContagem] = useState<Record<string, number>>({});
    const [carregando, setCarregando] = useState(true);

    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const carregar = useCallback(async () => {
        const [lista, card, contagens] = await Promise.all([
            redeService.list(),
            getPacienteCard(),
            familiaMensagensService.contarPorPessoa(),
        ]);
        setRede(lista);
        setPaciente(card);
        setContagem(contagens);
        setCarregando(false);
    }, []);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const pessoas = useMemo(
        () => [
            {
                id: "eu",
                nome: paciente?.nome || "Você",
                relacao: "Paciente",
                fotoUrl: paciente?.fotoUrl,
            },
            ...rede.map((p) => ({
                id: p.id,
                nome: p.nome,
                relacao: p.relacao,
                fotoUrl: p.fotoUrl,
            })),
        ],
        [paciente, rede]
    );

    function abrirNova() {
        setEditandoId(null);
        setForm(FORM_INICIAL);
        setModalAberto(true);
    }

    function abrirEdicao(pessoa: PessoaRede) {
        setEditandoId(pessoa.id);
        setForm({
            nome: pessoa.nome,
            relacao: pessoa.relacao,
            fotoUrl: pessoa.fotoUrl ?? "",
        });
        setModalAberto(true);
    }

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setEnviandoFoto(true);
        const url = await uploadImagem({
            file,
            folder: MP_REDE_FOLDER,
            bucket: MP_STORAGE_BUCKET,
        });
        setEnviandoFoto(false);

        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto.",
                variant: "destructive",
            });
            return;
        }
        setForm((f) => ({ ...f, fotoUrl: url }));
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nome.trim() || salvando || enviandoFoto) return;

        setSalvando(true);
        try {
            const dados = {
                nome: form.nome.trim(),
                relacao: form.relacao.trim(),
                fotoUrl: form.fotoUrl || undefined,
            };

            setRede(
                editandoId
                    ? await redeService.update(editandoId, dados)
                    : await redeService.add(dados)
            );

            setModalAberto(false);
            setForm(FORM_INICIAL);
            setEditandoId(null);
            toast({ title: editandoId ? "Pessoa atualizada" : "Pessoa adicionada" });
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

    async function remover(pessoa: PessoaRede) {
        const ok = await confirmDialog({
            title: `Remover ${pessoa.nome}?`,
            description: "As mensagens dessa pessoa também serão apagadas.",
            confirmLabel: "Remover",
            variant: "destructive",
        });
        if (!ok) return;

        try {
            setRede(await redeService.remove(pessoa.id));
            setContagem(await familiaMensagensService.contarPorPessoa());
            toast({ title: "Pessoa removida" });
        } catch (err) {
            toast({
                title: "Erro ao remover",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <MiPageHeader
                    eyebrow="Família"
                    title="Minha família"
                    subtitle="Escolha um perfil para ver e registrar mensagens. Só você e sua família enxergam."
                />
                <Button
                    onClick={abrirNova}
                    className="hidden sm:flex bg-[#5ba58c] text-white rounded-xl shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar pessoa
                </Button>
            </div>

            {carregando ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                </div>
            ) : (
                <div className="space-y-3">
                    {pessoas.map((pessoa) => {
                        const total = contagem[pessoa.id] ?? 0;
                        const daRede = rede.find((r) => r.id === pessoa.id);
                        return (
                            <MiCard key={pessoa.id} className="p-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(`/medicina-preventiva/familia/${pessoa.id}`)
                                        }
                                        className="flex items-center gap-4 flex-1 min-w-0 text-left"
                                    >
                                        {pessoa.fotoUrl ? (
                                            <img
                                                src={pessoa.fotoUrl}
                                                alt={pessoa.nome}
                                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 rounded-full bg-[#e3f1eb] flex items-center justify-center border-2 border-white shadow shrink-0">
                                                <User className="h-6 w-6 text-[#5ba58c]" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#255f4f] truncate">
                                                {pessoa.nome}
                                            </p>
                                            <p className="text-xs text-[#6b8c7d]">
                                                {pessoa.relacao || "Sem parentesco informado"}
                                            </p>
                                            <p className="text-[11px] text-[#9db4aa] mt-0.5 flex items-center gap-1">
                                                <MessageSquare className="h-3 w-3" />
                                                {total === 0
                                                    ? "Nenhuma mensagem"
                                                    : `${total} mensagem${total > 1 ? "s" : ""}`}
                                            </p>
                                        </div>
                                    </button>

                                    {daRede && (
                                        <div className="flex flex-col gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => abrirEdicao(daRede)}
                                                className="text-[11px] font-semibold text-[#5ba58c] hover:underline"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remover(daRede)}
                                                className="p-1 rounded-lg text-[#c2e1d4] hover:text-rose-500"
                                                aria-label={`Remover ${daRede.nome}`}
                                            >
                                                <Trash2 className="h-4 w-4 mx-auto" />
                                            </button>
                                        </div>
                                    )}

                                    <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                                </div>
                            </MiCard>
                        );
                    })}

                    {rede.length === 0 && (
                        <MiCard variant="soft" className="p-6 text-center space-y-2">
                            <Users className="h-8 w-8 mx-auto text-[#9db4aa]" />
                            <p className="text-sm text-[#6b8c7d]">
                                Adicione filhos, cuidadores ou quem acompanha seu tratamento.
                            </p>
                        </MiCard>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={abrirNova}
                className="sm:hidden fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-[#5ba58c] text-white shadow-lg flex items-center justify-center"
                aria-label="Adicionar pessoa"
            >
                <Plus className="h-6 w-6" />
            </button>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">
                            {editandoId ? "Editar pessoa" : "Adicionar pessoa"}
                        </DialogTitle>
                        <DialogDescription>
                            Quem faz parte do seu acompanhamento.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="flex justify-center">
                            <label className="cursor-pointer relative">
                                {form.fotoUrl ? (
                                    <img
                                        src={form.fotoUrl}
                                        alt="Foto da pessoa"
                                        className="w-24 h-24 rounded-full object-cover border-2 border-[#d1e5dc]"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#c2e1d4] flex items-center justify-center bg-[#f8fcfb]">
                                        {enviandoFoto ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-[#9db4aa]" />
                                        )}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFoto}
                                />
                            </label>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Nome</label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Parentesco
                            </label>
                            <select
                                value={form.relacao}
                                onChange={(e) => setForm((f) => ({ ...f, relacao: e.target.value }))}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="">Selecione</option>
                                {RELACOES.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
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
                                disabled={salvando || enviandoFoto}
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
