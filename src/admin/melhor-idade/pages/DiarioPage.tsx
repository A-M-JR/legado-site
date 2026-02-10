import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic, MessageSquare, Heart, Image as ImageIcon, Plus, X } from "lucide-react";

type Post = {
    id: number;
    autor: string;
    hora: string;
    texto: string;
    imagem?: string | null;
    reacoes: number;
};

export default function DiarioPage(): JSX.Element {
    const [postagens, setPostagens] = useState<Post[]>([
        {
            id: 1,
            autor: "Cuidadora Maria",
            hora: "15:30",
            texto: "Hoje o passeio no jardim foi maravilhoso! Tomamos um pouco de sol.",
            imagem:
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
            reacoes: 3
        },
        {
            id: 2,
            autor: "Você",
            hora: "09:00",
            texto: "Dormi muito bem hoje. Acordei disposto!",
            imagem: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
            reacoes: 1
        }
    ]);

    // composer
    const [texto, setTexto] = useState("");
    const [preview, setPreview] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    // lightbox
    const [lightbox, setLightbox] = useState<string | null>(null);

    // cleanup blob URLs on unmount / when preview changes
    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    function handleChoosePhoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        const url = URL.createObjectURL(file);
        setPreview(url);
    }

    function handlePublish(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!texto.trim() && !preview) return alert("Escreva algo ou escolha uma foto.");
        const now = new Date();
        const hora = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const novo: Post = {
            id: Date.now(),
            autor: "Você",
            hora,
            texto: texto.trim(),
            imagem: preview,
            reacoes: 0
        };
        setPostagens((p) => [novo, ...p]);
        setTexto("");
        // keep preview in post (no revoke now) — revoke only when replaced/unmounted
        setPreview(null);
        if (fileRef.current) fileRef.current.value = "";
    }

    function handleReact(id: number) {
        setPostagens((prev) => prev.map((p) => (p.id === id ? { ...p, reacoes: p.reacoes + 1 } : p)));
    }

    return (
        <div className="space-y-6 pb-24 px-4 max-w-3xl mx-auto">
            <section className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-[#255f4f]">Meu Diário</h1>
                    <p className="text-lg text-[#6b8c7d]">Compartilhe seus momentos</p>
                </div>
            </section>

            {/* Composer simples */}
            <section className="bg-white border border-[#e8f3ec] rounded-2xl p-4 shadow-sm">
                <form onSubmit={handlePublish} className="space-y-3">
                    <textarea
                        value={texto}
                        onChange={(e) => setTexto(e.target.value)}
                        placeholder="Escreva algo sobre o dia..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-[#eef6f0] focus:ring-2 focus:ring-[#d6efe4] resize-none"
                    />
                    {preview && (
                        <div className="rounded-xl overflow-hidden border border-[#eaf6ee]">
                            <img src={preview} alt="preview" className="w-full h-56 object-cover" />
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <label
                                htmlFor="photo"
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#d1e5dc] cursor-pointer hover:bg-[#f7fbf9]"
                                aria-label="Tirar foto ou escolher imagem"
                            >
                                <Camera className="h-5 w-5 text-[#5ba58c]" />
                                <span className="text-sm text-[#255f4f] font-bold">Foto</span>
                                <input
                                    id="photo"
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleChoosePhoto}
                                    className="hidden"
                                />
                            </label>

                            <button
                                type="button"
                                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#d1e5dc]"
                                aria-label="Gravar voz (placeholder)"
                            >
                                <Mic className="h-5 w-5 text-[#7aa7a0]" />
                                <span className="text-sm text-[#255f4f] font-bold">Gravar</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setTexto("");
                                    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
                                    setPreview(null);
                                    if (fileRef.current) fileRef.current.value = "";
                                }}
                                className="text-sm text-[#9db4aa] hover:underline"
                            >
                                Limpar
                            </button>
                            <Button type="submit" className="bg-[#5ba58c] text-white rounded-xl px-4 py-2">
                                Publicar
                            </Button>
                        </div>
                    </div>
                </form>
            </section>

            {/* Ações de atalho maiores (mantive sua ideia) */}
            <section className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => fileRef.current?.click()}
                    className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#d1e5dc] rounded-[32px] hover:border-[#5ba58c] transition-all shadow-sm"
                >
                    <Camera className="h-10 w-10 text-[#5ba58c] mb-2" />
                    <span className="font-bold text-[#255f4f]">Tirar Foto</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#d1e5dc] rounded-[32px] hover:border-[#5ba58c] transition-all shadow-sm">
                    <Mic className="h-10 w-10 text-blue-500 mb-2" />
                    <span className="font-bold text-[#255f4f]">Gravar Voz</span>
                </button>
            </section>

            {/* Feed */}
            <section className="space-y-6">
                {postagens.map((post) => (
                    <Card key={post.id} className="border-none rounded-[32px] overflow-hidden shadow-md bg-white">
                        {post.imagem && (
                            <div className="w-full h-56 cursor-pointer" onClick={() => setLightbox(post.imagem || null)}>
                                <img src={post.imagem} alt="Momento do dia" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-black text-[#5ba58c] text-sm uppercase tracking-widest">{post.autor}</p>
                                    <p className="text-xs text-[#9db4aa]">{post.hora}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-[#f4fbf8] px-3 py-1 rounded-full">
                                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                                    <span className="text-xs font-bold text-[#255f4f]">{post.reacoes}</span>
                                </div>
                            </div>

                            <p className="text-lg text-[#4f665a] leading-relaxed font-medium">{post.texto}</p>

                            <div className="mt-6 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-xl border-[#d1e5dc] text-[#255f4f] font-bold py-6"
                                    onClick={() => handleReact(post.id)}
                                >
                                    <Heart className="mr-2 h-5 w-5" /> Amei
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl border-[#d1e5dc] text-[#255f4f] font-bold py-6">
                                    <MessageSquare className="mr-2 h-5 w-5" /> Comentar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80"
                    onClick={() => setLightbox(null)}
                >
                    <div className="relative max-w-3xl w-full">
                        <img src={lightbox} alt="ampliada" className="w-full h-auto rounded-xl object-contain" />
                        <button
                            onClick={() => setLightbox(null)}
                            className="absolute top-3 right-3 p-2 bg-white/20 rounded-full text-white hover:bg-white/30"
                            aria-label="Fechar imagem"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Botão Flutuante */}
            <button
                onClick={() => {
                    // scrolla para composer (ou pode abrir modal)
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-[#255f4f] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform z-50"
                aria-label="Novo registro"
            >
                <Plus className="h-8 w-8" />
            </button>
        </div>
    );
}