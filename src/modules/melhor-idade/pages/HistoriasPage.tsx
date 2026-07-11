import { useEffect, useId, useMemo, useState } from "react";

import { Edit, Heart, ImagePlus, Lock, Loader2, NotebookPen, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Textarea } from "@/components/ui/textarea";

import { Checkbox } from "@/components/ui/checkbox";

import { toast } from "@/hooks/use-toast";

import { MiPageHeader } from "../components/MiPageHeader";

import { MiDemoModal } from "../components/MiDemoModal";

import { MiFullscreenMedia } from "../components/MiFullscreenMedia";

import { historiasService } from "../services/historiasService";

import { isMiFotoUrl } from "../lib/storage";

import type { HistoriaEntrada } from "../types";

import { isVideoMediaUrl } from "@/lib/validation";

import { confirmDialog } from "@/components/ui/confirm-dialog";



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



const FORM_VAZIO = { titulo: "", conteudo: "", privado: false };



export default function HistoriasPage() {

    const [items, setItems] = useState<HistoriaEntrada[]>([]);

    const [modalOpen, setModalOpen] = useState(false);

    const [editando, setEditando] = useState<HistoriaEntrada | null>(null);

    const [form, setForm] = useState(FORM_VAZIO);

    const fileInputId = useId();

    const [mediaFile, setMediaFile] = useState<File | null>(null);

    const [mediaPreview, setMediaPreview] = useState<string | null>(null);

    const [salvando, setSalvando] = useState(false);

    const [mediaTelaCheia, setMediaTelaCheia] = useState<{

        url: string;

        tipo?: "foto" | "video";

        alt?: string;

    } | null>(null);



    useEffect(() => {

        historiasService.list().then(setItems);

    }, []);



    const empty = useMemo(() => items.length === 0, [items]);



    function limparMidia() {

        if (mediaPreview?.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);

        setMediaFile(null);

        setMediaPreview(null);

    }



    function fecharModal() {

        limparMidia();

        setModalOpen(false);

    }



    function abrirNova() {

        setEditando(null);

        setForm(FORM_VAZIO);

        limparMidia();

        setModalOpen(true);

    }



    function abrirEditar(item: HistoriaEntrada) {

        setEditando(item);

        setForm({

            titulo: item.titulo,

            conteudo: item.conteudo,

            privado: item.privado,

        });

        limparMidia();

        if (item.mediaUrl && isMiFotoUrl(item.mediaUrl)) {

            setMediaPreview(item.mediaUrl);

        }

        setModalOpen(true);

    }



    function handleMedia(file: File | null) {

        if (!file) return;

        if (mediaPreview?.startsWith("blob:")) URL.revokeObjectURL(mediaPreview);

        setMediaFile(file);

        setMediaPreview(URL.createObjectURL(file));

    }



    async function salvar(e: React.FormEvent) {

        e.preventDefault();

        if (!form.conteudo.trim() || salvando) return;



        setSalvando(true);

        try {

            const payload = {

                titulo: form.titulo.trim() || "Sem título",

                conteudo: form.conteudo.trim(),

                privado: form.privado,

            };



            if (editando) {

                setItems(

                    await historiasService.update(

                        editando.id,

                        {

                            ...payload,

                            mediaUrl: editando.mediaUrl,

                            mediaTipo: editando.mediaTipo,

                        },

                        mediaFile

                    )

                );

                toast({ title: "História atualizada" });

            } else {

                setItems(await historiasService.add(payload, mediaFile));

                toast({ title: "História publicada" });

            }

            fecharModal();

        } catch {

            toast({ title: "Erro ao salvar", variant: "destructive" });

        } finally {

            setSalvando(false);

        }

    }



    async function remover(id: string) {

        const ok = await confirmDialog({
            title: "Excluir esta história?",
            description: "Essa ação não pode ser desfeita.",
        });
        if (!ok) return;

        setItems(await historiasService.remove(id));

    }



    function midiaValida(url?: string) {

        return Boolean(url && isMiFotoUrl(url));

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



                            {it.mediaUrl && !midiaValida(it.mediaUrl) && (

                                <p className="mt-3 text-xs text-[#9db4aa] bg-[#f8fcfb] rounded-xl px-3 py-2 border border-dashed border-[#d1e5dc]">

                                    Mídia indisponível — edite e envie a foto novamente.

                                </p>

                            )}



                            {midiaValida(it.mediaUrl) && (

                                <button

                                    type="button"

                                    onClick={() =>

                                        setMediaTelaCheia({

                                            url: it.mediaUrl!,

                                            tipo: it.mediaTipo,

                                            alt: it.titulo,

                                        })

                                    }

                                    className="mt-3 w-full rounded-xl overflow-hidden border border-[#e6efe9] text-left focus:outline-none focus:ring-2 focus:ring-[#5ba58c]"

                                    aria-label="Abrir mídia em tela cheia"

                                >

                                    {it.mediaTipo === "video" || isVideoMediaUrl(it.mediaUrl!) ? (

                                        <video

                                            src={it.mediaUrl}

                                            controls

                                            className="w-full max-h-56 object-contain bg-black pointer-events-none"

                                        />

                                    ) : (

                                        <img

                                            src={it.mediaUrl}

                                            alt={it.titulo}

                                            className="w-full max-h-56 object-cover"

                                        />

                                    )}

                                </button>

                            )}

                        </article>

                    ))}

                </div>

            )}



            <MiDemoModal

                open={modalOpen}

                onOpenChange={(o) => !o && fecharModal()}

                title={editando ? "Editar entrada" : "Nova entrada"}

                description="Escreva no seu tempo."

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

                            id={fileInputId}

                            type="file"

                            accept="image/*,video/mp4,video/webm"

                            className="sr-only"

                            onChange={(e) => handleMedia(e.target.files?.[0] || null)}

                        />

                        <label

                            htmlFor={fileInputId}

                            className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-[#c2e1d4] bg-[#f8fcfb] text-[#5ba58c] font-semibold text-sm cursor-pointer hover:bg-[#f0f9f6] hover:border-[#5ba58c] transition"

                        >

                            <ImagePlus className="h-5 w-5" />

                            {mediaPreview ? "Trocar foto ou vídeo" : "Escolher foto ou vídeo"}

                        </label>

                        {mediaPreview && (

                            <div className="mt-2 rounded-xl overflow-hidden border border-[#e6efe9] max-h-40">

                                {mediaFile?.type.startsWith("video/") ||

                                isVideoMediaUrl(mediaPreview) ? (

                                    <video src={mediaPreview} controls className="w-full max-h-40 object-contain bg-black" />

                                ) : (

                                    <img src={mediaPreview} alt="Pré-visualização" className="w-full max-h-40 object-cover" />

                                )}

                            </div>

                        )}

                    </div>

                    <label className="flex items-center gap-2">

                        <Checkbox

                            checked={form.privado}

                            onCheckedChange={(c) => setForm({ ...form, privado: !!c })}

                        />

                        <span className="text-sm text-[#4f665a]">Apenas para mim (privado)</span>

                    </label>

                    <Button

                        type="submit"

                        disabled={salvando}

                        className="w-full rounded-xl bg-[#5ba58c] text-white h-12 font-bold"

                    >

                        {salvando ? (

                            <>

                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />

                                Salvando...

                            </>

                        ) : editando ? (

                            "Salvar"

                        ) : (

                            "Publicar"

                        )}

                    </Button>

                </form>

            </MiDemoModal>



            <MiFullscreenMedia

                open={!!mediaTelaCheia}

                url={mediaTelaCheia?.url ?? null}

                tipo={mediaTelaCheia?.tipo}

                alt={mediaTelaCheia?.alt}

                onClose={() => setMediaTelaCheia(null)}

            />

        </div>

    );

}

