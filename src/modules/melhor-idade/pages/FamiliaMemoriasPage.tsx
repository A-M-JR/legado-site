import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, PlusCircle, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { useMelhorIdade } from "../context/MelhorIdadeContext";
import { familiaMemoriasService } from "../services/familiaMemoriasService";
import type { FamiliaMemoria } from "../types";
import { MiDemoModal } from "../components/MiDemoModal";
import { isVideoMediaUrl } from "@/lib/validation";

function formatarDataHora(data: string) {
    return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function FamiliaMemoriasPage() {
    const { id: pessoaId } = useParams();
    const navigate = useNavigate();
    const { profile } = useMelhorIdade();
    const [memorias, setMemorias] = useState<FamiliaMemoria[]>(() =>
        familiaMemoriasService.list(pessoaId || "")
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ mensagem: "", nome: "", anonimo: false, mediaUrl: "", mediaTipo: "" as "" | "foto" | "video" });

    const pessoa = useMemo(() => {
        if (pessoaId === "eu") {
            return {
                id: "eu",
                nome: profile.nome || "Você",
                fotoUrl: profile.fotoUrl,
                relacao: "Titular",
            };
        }
        const rede = profile.rede.find((p) => p.id === pessoaId);
        return rede
            ? { id: rede.id, nome: rede.nome, fotoUrl: rede.fotoUrl, relacao: rede.relacao }
            : null;
    }, [pessoaId, profile]);

    function handleMedia(file: File | null) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const mediaTipo = file.type.startsWith("video/") ? "video" : "foto";
        setForm((f) => ({ ...f, mediaUrl: url, mediaTipo }));
    }

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!pessoaId || !form.mensagem.trim()) return;
        if (!form.anonimo && !form.nome.trim()) {
            toast({ title: "Informe seu nome ou marque anônimo", variant: "destructive" });
            return;
        }

        setMemorias(
            familiaMemoriasService.add({
                pessoaId,
                mensagem: form.mensagem.trim(),
                remetente: form.anonimo ? "Anônimo" : form.nome.trim(),
                anonimo: form.anonimo,
                mediaUrl: form.mediaUrl || undefined,
                mediaTipo: form.mediaTipo || undefined,
            })
        );
        setForm({ mensagem: "", nome: "", anonimo: false, mediaUrl: "", mediaTipo: "" });
        setModalOpen(false);
        toast({ title: "Recordação enviada 💙" });
    }

    function excluir(memoriaId: string) {
        if (!confirm("Excluir esta recordação?")) return;
        familiaMemoriasService.remove(memoriaId);
        setMemorias(familiaMemoriasService.list(pessoaId || ""));
    }

    if (!pessoa) {
        return (
            <div className="text-center py-12 text-[#6b8c7d]">
                <p>Perfil não encontrado.</p>
                <Button variant="link" onClick={() => navigate("/melhor-idade/familia")} className="text-[#5ba58c]">
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-4">
            <button
                type="button"
                onClick={() => navigate("/melhor-idade/familia")}
                className="flex items-center gap-2 text-[#255f4f] font-bold text-sm bg-white px-3 py-2 rounded-xl border border-[#e6efe9] shadow-sm"
            >
                <ChevronLeft size={18} />
                Voltar
            </button>

            <div className="text-center space-y-3">
                {pessoa.fotoUrl ? (
                    <img
                        src={pessoa.fotoUrl}
                        alt={pessoa.nome}
                        className="w-24 h-24 rounded-full object-cover border-4 border-[#c2e1d4] mx-auto shadow-md"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-[#e3f1eb] flex items-center justify-center mx-auto border-4 border-white shadow-md">
                        <User className="h-10 w-10 text-[#5ba58c]" />
                    </div>
                )}
                <div>
                    <h1 className="text-xl font-bold text-[#255f4f]">Memórias de {pessoa.nome}</h1>
                    <p className="text-sm text-[#6b8c7d]">{pessoa.relacao}</p>
                </div>
                <p className="text-sm text-[#6b8c7d] max-w-md mx-auto">
                    Mensagens e fotos compartilhadas com carinho — só do Melhor Idade.
                </p>
            </div>

            <div className="space-y-3">
                {memorias.length === 0 ? (
                    <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#d1e5dc] bg-white/60">
                        <p className="font-semibold text-[#255f4f]">Ainda não há recordações aqui.</p>
                        <p className="text-sm text-[#6b8c7d] mt-1">Seja o primeiro a deixar uma mensagem.</p>
                    </div>
                ) : (
                    memorias.map((item) => (
                        <article
                            key={item.id}
                            className="bg-white border border-[#e6f4f1] rounded-2xl p-4 shadow-sm"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#e3f1eb] flex items-center justify-center shrink-0">
                                    <User size={18} className="text-[#255f4f]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between gap-2">
                                        <div>
                                            <p className="font-bold text-[#255f4f]">{item.remetente}</p>
                                            <p className="text-[10px] text-[#9db4aa]">{formatarDataHora(item.criadoEm)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => excluir(item.id)}
                                            className="text-[#c33] hover:bg-red-50 p-2 rounded-lg shrink-0"
                                            aria-label="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-[#4f665a] mt-2 whitespace-pre-wrap">{item.mensagem}</p>
                                    {item.mediaUrl && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-[#e6efe9]">
                                            {item.mediaTipo === "video" || isVideoMediaUrl(item.mediaUrl) ? (
                                                <video src={item.mediaUrl} controls className="w-full max-h-56 object-contain bg-black" />
                                            ) : (
                                                <img src={item.mediaUrl} alt="" className="w-full max-h-56 object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    ))
                )}
            </div>

            <Button
                onClick={() => setModalOpen(true)}
                className="w-full py-5 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-lg"
            >
                <PlusCircle className="mr-2 h-5 w-5" />
                Deixar recordação
            </Button>

            <MiDemoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Deixe sua recordação 💙"
                description={`Mensagem carinhosa para ${pessoa.nome}`}
            >
                <form onSubmit={salvar} className="space-y-4">
                    <Textarea
                        value={form.mensagem}
                        onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                        placeholder="Escreva sua mensagem com carinho..."
                        className="min-h-[120px] rounded-xl"
                        required
                    />
                    <div>
                        <label className="text-xs font-semibold text-[#6b8c7d]">Foto ou vídeo (opcional)</label>
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            className="mt-1 block w-full text-sm"
                            onChange={(e) => handleMedia(e.target.files?.[0] || null)}
                        />
                    </div>
                    <Input
                        value={form.nome}
                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                        placeholder="Seu nome (opcional)"
                        disabled={form.anonimo}
                        className="rounded-xl"
                    />
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={form.anonimo}
                            onCheckedChange={(c) => setForm({ ...form, anonimo: !!c })}
                        />
                        <span className="text-sm text-[#4f665a]">Enviar como anônimo</span>
                    </label>
                    <Button type="submit" className="w-full h-12 rounded-xl bg-[#5ba58c] text-white font-bold">
                        Enviar recordação
                    </Button>
                </form>
            </MiDemoModal>
        </div>
    );
}
