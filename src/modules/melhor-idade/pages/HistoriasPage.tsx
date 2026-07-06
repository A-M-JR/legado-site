import { useMemo, useState } from "react";
import { Edit, Heart, Lock, NotebookPen, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { historiasService } from "../services/historiasService";
import type { HistoriaEntrada } from "../types";
import { isVideoMediaUrl } from "@/lib/validation";

function formatDateHuman(dt: string) {
    const d = new Date(dt);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(d);
    data.setHours(0, 0, 0, 0);
    const diff = (hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);
    const hora = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff === 0) return `Hoje • ${hora}`;
    if (diff === 1) return `Ontem • ${hora}`;
    return d.toLocaleString("pt-BR");
}

const FORM_VAZIO = { titulo: "", conteudo: "", privado: false, mediaUrl: "", mediaTipo: "" as "" | "foto" | "video" };

export default function HistoriasPage() {
    const [items, setItems] = useState<HistoriaEntrada[]>(() => historiasService.list());
    const [modalOpen, setModalOpen] = useState(false);
    const [editando, setEditando] = useState<HistoriaEntrada | null>(null);
    const [form, setForm] = useState(FORM_VAZIO);

    const empty = useMemo(() => items.length === 0, [items]);

    function abrirNova() {
        setEditando(null);
        setForm(FORM_VAZIO);
        setModalOpen(true);
    }

    function abrirEditar(item: HistoriaEntrada) {
        setEditando(item);
        setForm({
            titulo: item.titulo,
            conteudo: item.conteudo,
            privado: item.privado,
            mediaUrl: item.mediaUrl || "",
            mediaTipo: item.mediaTipo || "",
        });
        setModalOpen(true);
    }

    function handleMedia(file: File | null) {
        if (!file) return;
        const url = URL.createObjectURL(file);
        const mediaTipo = file.type.startsWith("video/") ? "video" : "foto";
        setForm((f) => ({ ...f, mediaUrl: url, mediaTipo }));
    }

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.conteudo.trim()) return;

        const payload = {
            titulo: form.titulo.trim() || "Sem título",
            conteudo: form.conteudo.trim(),
            privado: form.privado,
            mediaUrl: form.mediaUrl || undefined,
            mediaTipo: form.mediaTipo || undefined,
        };

        if (editando) {
            setItems(historiasService.update(editando.id, payload));
            toast({ title: "História atualizada" });
        } else {
            setItems(historiasService.add(payload));
            toast({ title: "História publicada" });
        }
        setModalOpen(false);
    }

    function remover(id: string) {
        if (!confirm("Excluir esta história?")) return;
        setItems(historiasService.remove(id));
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-4">
            <MiPageHeader
                eyebrow="Memórias"
                title="Histórias e memórias"
                subtitle="Um espaço seu para registrar textos, fotos e vídeos curtos."
            />

            <Button
                onClick={abrirNova}
                className="w-full sm:w-auto bg-[#6c63ff] hover:bg-[#5a52d5] text-white rounded-xl font-bold py-6 shadow-lg"
            >
                <Plus className="mr-2 h-5 w-5" />
                Nova entrada
            </Button>

            {empty ? (
                <div className="text-center text-[#6b8c7d] bg-white border border-[#e6f2ee] rounded-2xl p-8">
                    <Heart className="h-10 w-10 mx-auto mb-3 text-[#5ba58c] opacity-40" />
                    <p className="font-bold text-[#255f4f]">Que tal começar com poucas linhas?</p>
                    <p className="text-sm mt-2">Registre um momento, uma lembrança ou um pensamento do dia.</p>
                    <button type="button" onClick={abrirNova} className="mt-4 text-[#6c63ff] font-bold hover:underline">
                        Começar agora
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((it) => (
                        <article
                            key={it.id}
                            className="bg-white border border-[#e6f2ee] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <NotebookPen className="h-4 w-4 text-[#6c63ff] shrink-0" />
                                        <h3 className="font-bold text-lg text-[#255f4f] truncate">
                                            {it.titulo}
                                        </h3>
                                        {it.privado && <Lock size={14} className="text-[#94a3b8] shrink-0" />}
                                    </div>
                                    <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
                                        {formatDateHuman(it.criadoEm)}
                                    </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => abrirEditar(it)}
                                        className="p-2 text-[#64748b] hover:text-[#255f4f] hover:bg-[#f1f5f9] rounded-lg"
                                        aria-label="Editar"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => remover(it.id)}
                                        className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg"
                                        aria-label="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <p className="mt-3 text-[#475569] text-sm leading-relaxed whitespace-pre-wrap">
                                {it.conteudo}
                            </p>

                            {it.mediaUrl && (
                                <div className="mt-3 rounded-xl overflow-hidden border border-[#e6efe9]">
                                    {it.mediaTipo === "video" || isVideoMediaUrl(it.mediaUrl) ? (
                                        <video src={it.mediaUrl} controls className="w-full max-h-56 object-contain bg-black" />
                                    ) : (
                                        <img src={it.mediaUrl} alt="" className="w-full max-h-56 object-cover" />
                                    )}
                                </div>
                            )}
                        </article>
                    ))}
                </div>
            )}

            <MiDemoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editando ? "Editar entrada" : "Nova entrada"}
                description="Escreva no seu tempo. Dados salvos neste dispositivo."
            >
                <form onSubmit={salvar} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-[#6b8c7d] ml-1">Título</label>
                        <Input
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            placeholder="Ex: Um dia especial"
                            className="rounded-xl mt-1"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[#6b8c7d] ml-1">Conteúdo *</label>
                        <Textarea
                            value={form.conteudo}
                            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                            placeholder="O que você quer registrar hoje?"
                            className="min-h-[120px] rounded-xl mt-1"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-[#6b8c7d] ml-1">Foto ou vídeo</label>
                        <input
                            type="file"
                            accept="image/*,video/mp4,video/webm"
                            className="mt-1 block w-full text-sm text-[#6b8c7d]"
                            onChange={(e) => handleMedia(e.target.files?.[0] || null)}
                        />
                    </div>
                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={form.privado}
                            onCheckedChange={(c) => setForm({ ...form, privado: !!c })}
                        />
                        <span className="text-sm text-[#4f665a]">Apenas para mim (privado)</span>
                    </label>
                    <Button type="submit" className="w-full rounded-xl bg-[#5ba58c] text-white h-12 font-bold">
                        {editando ? "Salvar" : "Publicar"}
                    </Button>
                </form>
            </MiDemoModal>
        </div>
    );
}
