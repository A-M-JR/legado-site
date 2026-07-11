import { useEffect, useMemo, useState } from "react";
import { Plus, Heart, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MiFilterPills } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { momentosService } from "../services/momentosService";
import type { Momento } from "../types";
import clsx from "clsx";

type Filtro = "fotos" | "videos" | "favoritos";

const FILTROS = [
    { id: "fotos", label: "Fotos" },
    { id: "videos", label: "Vídeos" },
    { id: "favoritos", label: "Favoritos" },
];

const PREVIEW_PLACEHOLDER =
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80";

export default function MomentosPage() {
    const [filtro, setFiltro] = useState<Filtro>("fotos");
    const [momentos, setMomentos] = useState<Momento[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [lightbox, setLightbox] = useState<Momento | null>(null);
    const [form, setForm] = useState({ legenda: "", tipo: "foto" as "foto" | "video" });

    useEffect(() => {
        momentosService.list().then(setMomentos);
    }, []);

    const lista = useMemo(() => {
        if (filtro === "favoritos") return momentos.filter((m) => m.favorito);
        if (filtro === "videos") return momentos.filter((m) => m.tipo === "video");
        return momentos.filter((m) => m.tipo === "foto");
    }, [momentos, filtro]);

    async function toggleFav(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setMomentos(await momentosService.toggleFavorito(id));
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        setMomentos(
            await momentosService.add({
                tipo: form.tipo,
                url: PREVIEW_PLACEHOLDER,
            })
        );
        setForm({ legenda: "", tipo: "foto" });
        setModalOpen(false);
        setFiltro(form.tipo === "video" ? "videos" : "fotos");
        toast({ title: "Momento adicionado" });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-4">
            <MiPageHeader
                eyebrow="Momentos"
                title="Seus momentos especiais"
                subtitle="Lembrar também é viver. 💛"
            />

            <MiFilterPills options={FILTROS} value={filtro} onChange={(id) => setFiltro(id as Filtro)} />

            {lista.length === 0 ? (
                <div className="text-center py-12 sm:py-16 rounded-3xl border-2 border-dashed border-[#d1e5dc] bg-white/60">
                    <ImageIcon className="h-10 w-10 text-[#9db4aa] mx-auto mb-3" />
                    <p className="text-[#6b8c7d] font-medium">Nenhum momento nesta categoria.</p>
                    <Button
                        variant="link"
                        className="text-[#5ba58c] mt-2"
                        onClick={() => setModalOpen(true)}
                    >
                        Adicionar o primeiro
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                    {lista.map((m) => (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => setLightbox(m)}
                            className="relative aspect-square rounded-2xl sm:rounded-[20px] overflow-hidden shadow-sm ring-1 ring-[#e6efe9] group text-left"
                        >
                            <img src={m.url} alt="Momento" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition" />
                            <button
                                type="button"
                                onClick={(e) => toggleFav(m.id, e)}
                                className="absolute top-2 right-2 p-2 rounded-full bg-white/95 shadow-md"
                            >
                                <Heart
                                    className={clsx(
                                        "h-4 w-4",
                                        m.favorito ? "fill-rose-500 text-rose-500" : "text-[#9db4aa]"
                                    )}
                                />
                            </button>
                        </button>
                    ))}
                </div>
            )}

            <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="w-full py-5 sm:py-6 rounded-2xl border-2 border-[#5ba58c] text-[#5ba58c] font-bold hover:bg-[#f4fbf8] text-sm sm:text-base"
            >
                <Plus className="mr-2 h-5 w-5" />
                Adicionar momento
            </Button>

            <MiDemoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Novo momento"
                description="Registre um momento especial com foto ou vídeo."
            >
                <form onSubmit={salvar} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                        {(["foto", "video"] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setForm({ ...form, tipo: t })}
                                className={clsx(
                                    "py-4 rounded-xl border-2 font-semibold text-sm capitalize transition",
                                    form.tipo === t
                                        ? "border-[#5ba58c] bg-[#f0fbf7] text-[#255f4f]"
                                        : "border-[#e6efe9] text-[#6b8c7d]"
                                )}
                            >
                                {t === "foto" ? "📷 Foto" : "🎬 Vídeo"}
                            </button>
                        ))}
                    </div>

                    <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#c2e1d4] rounded-2xl bg-[#f8fcfb] cursor-pointer hover:bg-[#f4fbf8] transition">
                        <Camera className="h-8 w-8 text-[#5ba58c] mb-2" />
                        <span className="text-sm font-semibold text-[#255f4f]">
                            Escolher {form.tipo === "foto" ? "foto" : "vídeo"}
                        </span>
                        <span className="text-xs text-[#9db4aa] mt-1">Toque para escolher arquivo</span>
                        <input
                            type="file"
                            accept={form.tipo === "foto" ? "image/*" : "video/*"}
                            className="hidden"
                            onChange={() =>
                                toast({ title: "Arquivo selecionado" })
                            }
                        />
                    </label>

                    <label className="space-y-1.5 block">
                        <span className="text-xs font-semibold text-[#6b8c7d]">Legenda (opcional)</span>
                        <Textarea
                            value={form.legenda}
                            onChange={(e) => setForm({ ...form, legenda: e.target.value })}
                            placeholder="Um dia especial com a família..."
                            rows={3}
                            className="rounded-xl resize-none"
                        />
                    </label>

                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                        >
                            Salvar
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={!!lightbox}
                onOpenChange={(open) => !open && setLightbox(null)}
                title="Momento especial"
                description={
                    lightbox?.criadoEm
                        ? new Date(lightbox.criadoEm).toLocaleDateString("pt-BR")
                        : undefined
                }
            >
                {lightbox && (
                    <img
                        src={lightbox.url}
                        alt="Momento ampliado"
                        className="w-full rounded-2xl object-cover max-h-[50vh]"
                    />
                )}
            </MiDemoModal>
        </div>
    );
}
