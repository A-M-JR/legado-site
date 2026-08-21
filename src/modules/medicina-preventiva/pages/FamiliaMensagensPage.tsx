import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, PlusCircle, QrCode, Trash2, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { isVideoMediaUrl } from "@/lib/validation";
import { MiRecordacaoModal } from "@/modules/melhor-idade/components/MiRecordacaoModal";
import { MiFullscreenMedia } from "@/modules/melhor-idade/components/MiFullscreenMedia";
import { MiCard } from "@/modules/melhor-idade/components/MiCard";
import { MpConviteFamilia } from "../components/MpConviteFamilia";
import { familiaMensagensService } from "../services/familiaMensagensService";
import { redeService } from "../services/redeService";
import { getPacienteCard } from "../services/mpScope";
import type { FamiliaMensagem } from "../types";

function formatarDataHora(data: string) {
    return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function FamiliaMensagensPage() {
    const { id: pessoaId } = useParams();
    const navigate = useNavigate();

    const [mensagens, setMensagens] = useState<FamiliaMensagem[]>([]);
    const [pessoa, setPessoa] = useState<{ nome: string; fotoUrl?: string; relacao: string } | null>(
        null
    );
    const [titularId, setTitularId] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [conviteAberto, setConviteAberto] = useState(false);
    const [mediaTelaCheia, setMediaTelaCheia] = useState<{
        url: string;
        tipo?: "foto" | "video";
    } | null>(null);

    const carregar = useCallback(async () => {
        if (!pessoaId) return;

        const card = await getPacienteCard();
        setTitularId(card.titularId);

        if (pessoaId === "eu") {
            setPessoa({ nome: card.nome || "Você", fotoUrl: card.fotoUrl, relacao: "Paciente" });
        } else {
            const rede = await redeService.list();
            const encontrada = rede.find((p) => p.id === pessoaId);
            setPessoa(
                encontrada
                    ? {
                          nome: encontrada.nome,
                          fotoUrl: encontrada.fotoUrl,
                          relacao: encontrada.relacao,
                      }
                    : null
            );
        }

        setMensagens(await familiaMensagensService.list(pessoaId));
        setCarregando(false);
    }, [pessoaId]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function enviar({
        mensagem,
        nome,
        anonimo,
        file,
    }: {
        mensagem: string;
        nome: string;
        anonimo: boolean;
        file: File | null;
    }) {
        if (!pessoaId) return;
        try {
            setMensagens(
                await familiaMensagensService.add(
                    {
                        pessoaId,
                        mensagem,
                        remetente: anonimo ? "Anônimo" : nome || "Anônimo",
                        anonimo,
                    },
                    file
                )
            );
            toast({ title: "Mensagem registrada" });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function remover(id: string) {
        const ok = await confirmDialog({
            title: "Excluir esta mensagem?",
            description: "Essa ação não pode ser desfeita.",
            confirmLabel: "Excluir",
            variant: "destructive",
        });
        if (!ok) return;

        try {
            setMensagens(await familiaMensagensService.remove(id, pessoaId));
        } catch (err) {
            toast({
                title: "Erro ao excluir",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    if (carregando) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
            </div>
        );
    }

    if (!pessoa) {
        return (
            <div className="space-y-4 py-10 text-center">
                <p className="text-sm text-[#6b8c7d]">Pessoa não encontrada.</p>
                <Button variant="outline" onClick={() => navigate("/medicina-preventiva/familia")}>
                    Voltar para Minha família
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-28">
            <button
                type="button"
                onClick={() => navigate("/medicina-preventiva/familia")}
                className="flex items-center gap-1 text-sm font-semibold text-[#5ba58c]"
            >
                <ChevronLeft className="h-4 w-4" />
                Minha família
            </button>

            <MiCard variant="accent" className="p-5">
                <div className="flex items-center gap-4">
                    {pessoa.fotoUrl ? (
                        <img
                            src={pessoa.fotoUrl}
                            alt={pessoa.nome}
                            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border-2 border-white shadow">
                            <User className="h-7 w-7 text-[#5ba58c]" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-xl font-bold text-[#255f4f] truncate">{pessoa.nome}</h1>
                        <p className="text-sm text-[#6b8c7d]">{pessoa.relacao}</p>
                        <p className="text-[11px] text-[#9db4aa] mt-0.5">
                            {mensagens.length} mensagem{mensagens.length === 1 ? "" : "s"}
                        </p>
                    </div>
                </div>
            </MiCard>

            <div className="grid grid-cols-2 gap-2">
                <Button
                    onClick={() => setModalAberto(true)}
                    className="bg-[#5ba58c] text-white rounded-xl"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Nova mensagem
                </Button>
                <Button
                    variant="outline"
                    onClick={() => setConviteAberto(true)}
                    disabled={!titularId}
                    className="rounded-xl border-[#c2e1d4] text-[#255f4f]"
                >
                    <QrCode className="mr-2 h-4 w-4" /> Convidar
                </Button>
            </div>

            {mensagens.length === 0 ? (
                <MiCard variant="soft" className="p-8 text-center">
                    <p className="text-sm text-[#6b8c7d]">
                        Nenhuma mensagem ainda. Escreva a primeira ou convide alguém pelo link.
                    </p>
                </MiCard>
            ) : (
                <div className="space-y-3">
                    {mensagens.map((m) => {
                        const ehVideo =
                            m.mediaTipo === "video" || isVideoMediaUrl(m.mediaUrl ?? "");
                        return (
                            <MiCard key={m.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-[#255f4f]">
                                            {m.anonimo ? "Anônimo" : m.remetente}
                                        </p>
                                        <p className="text-[11px] text-[#9db4aa]">
                                            {formatarDataHora(m.criadoEm)}
                                        </p>
                                        <p className="text-sm text-[#4f665a] mt-2 whitespace-pre-line">
                                            {m.mensagem}
                                        </p>

                                        {m.mediaUrl && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMediaTelaCheia({
                                                        url: m.mediaUrl!,
                                                        tipo: ehVideo ? "video" : "foto",
                                                    })
                                                }
                                                className="mt-3 block"
                                            >
                                                {ehVideo ? (
                                                    <video
                                                        src={m.mediaUrl}
                                                        className="rounded-xl max-h-48 border border-[#e6efe9]"
                                                    />
                                                ) : (
                                                    <img
                                                        src={m.mediaUrl}
                                                        alt="Mídia da mensagem"
                                                        className="rounded-xl max-h-48 object-cover border border-[#e6efe9]"
                                                    />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => remover(m.id)}
                                        className="shrink-0 p-1.5 rounded-lg text-[#c2e1d4] hover:text-rose-500"
                                        aria-label="Excluir mensagem"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </MiCard>
                        );
                    })}
                </div>
            )}

            <MiRecordacaoModal
                open={modalAberto}
                onOpenChange={setModalAberto}
                person={{ nome: pessoa.nome, imagem_url: pessoa.fotoUrl }}
                onSubmit={enviar}
            />

            {titularId && pessoaId && (
                <MpConviteFamilia
                    open={conviteAberto}
                    onClose={() => setConviteAberto(false)}
                    titularId={titularId}
                    pessoaId={pessoaId}
                    pessoaNome={pessoa.nome}
                />
            )}

            <MiFullscreenMedia
                open={!!mediaTelaCheia}
                url={mediaTelaCheia?.url ?? null}
                tipo={mediaTelaCheia?.tipo}
                alt={`Mídia enviada para ${pessoa.nome}`}
                onClose={() => setMediaTelaCheia(null)}
            />
        </div>
    );
}
