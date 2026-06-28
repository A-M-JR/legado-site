import { useState } from "react";
import { Play, Mic, Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MiCard, MiFilterPills } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { mensagensService } from "../services/mensagensService";
import type { Mensagem, MensagemTipo } from "../types";

type Filtro = "todas" | MensagemTipo;

const FILTROS = [
    { id: "todas", label: "Todas" },
    { id: "audio", label: "Áudios" },
    { id: "video", label: "Vídeos" },
    { id: "texto", label: "Textos" },
];

export default function MensagensPage() {
    const [filtro, setFiltro] = useState<Filtro>("todas");
    const [mensagens, setMensagens] = useState<Mensagem[]>(() => mensagensService.list());
    const [selecionada, setSelecionada] = useState<Mensagem | null>(null);
    const [modalResposta, setModalResposta] = useState(false);
    const [respostaTexto, setRespostaTexto] = useState("");

    const lista =
        filtro === "todas" ? mensagens : mensagens.filter((m) => m.tipo === filtro);

    function abrir(msg: Mensagem) {
        setSelecionada(msg);
        setMensagens(mensagensService.marcarLida(msg.id));
    }

    function enviarResposta(e: React.FormEvent) {
        e.preventDefault();
        setModalResposta(false);
        setRespostaTexto("");
        toast({
            title: "Resposta enviada (demo)",
            description: "Em produção, sua família receberá esta mensagem.",
        });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                eyebrow="Mensagens"
                title="Mensagens para você"
                subtitle="Receba e responda com carinho."
            />

            <MiFilterPills options={FILTROS} value={filtro} onChange={(id) => setFiltro(id as Filtro)} />

            <div className="space-y-3">
                {lista.map((msg) => (
                    <MiCard
                        key={msg.id}
                        onClick={() => abrir(msg)}
                        variant={msg.lida ? "default" : "accent"}
                        className="p-4 sm:p-5 overflow-hidden"
                    >
                        <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="min-w-0">
                                <p className="font-bold text-[#255f4f] text-sm sm:text-base truncate">
                                    {msg.remetente}{" "}
                                    <span className="font-normal text-[#6b8c7d]">({msg.relacao})</span>
                                </p>
                                <p className="text-xs text-[#9db4aa]">{msg.horaLabel}</p>
                            </div>
                            {!msg.lida && (
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                            )}
                        </div>

                        {msg.tipo === "texto" && (
                            <p className="text-[#4f665a] bg-[#f8fcfb] rounded-xl p-3 sm:p-4 text-sm leading-relaxed line-clamp-3">
                                {msg.conteudo}
                            </p>
                        )}

                        {msg.tipo === "audio" && (
                            <div
                                className="flex items-center gap-3 bg-[#f4fbf8] rounded-2xl p-3 sm:p-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    type="button"
                                    className="p-3 rounded-full bg-[#5ba58c] text-white shrink-0"
                                    aria-label="Reproduzir áudio"
                                >
                                    <Play className="h-4 w-4 fill-white" />
                                </button>
                                <div className="flex-1 h-2 bg-[#d1e5dc] rounded-full overflow-hidden min-w-0">
                                    <div className="h-full w-1/3 bg-[#5ba58c] rounded-full" />
                                </div>
                                <span className="text-xs font-bold text-[#6b8c7d] shrink-0">
                                    {msg.duracao}
                                </span>
                            </div>
                        )}

                        {msg.tipo === "video" && msg.thumbnailUrl && (
                            <div className="relative rounded-2xl overflow-hidden h-36 sm:h-44">
                                <img
                                    src={msg.thumbnailUrl}
                                    alt="Vídeo"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                    <div className="p-3 sm:p-4 rounded-full bg-white/95 shadow">
                                        <Video className="h-5 w-5 sm:h-6 sm:w-6 text-[#255f4f]" />
                                    </div>
                                </div>
                                <span className="absolute bottom-2 right-2 text-xs font-bold text-white bg-black/50 px-2 py-0.5 rounded">
                                    {msg.duracao}
                                </span>
                            </div>
                        )}
                    </MiCard>
                ))}
            </div>

            <div className="fixed left-4 right-4 bottom-24 md:bottom-8 md:left-auto md:right-8 md:max-w-sm z-40 flex flex-col sm:flex-row gap-2">
                <Button
                    onClick={() => setModalResposta(true)}
                    className="w-full py-5 sm:py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white font-bold shadow-xl"
                >
                    <Mic className="mr-2 h-5 w-5" />
                    Responder com áudio
                </Button>
            </div>

            <MiDemoModal
                open={!!selecionada}
                onOpenChange={(open) => !open && setSelecionada(null)}
                title={selecionada ? `${selecionada.remetente} (${selecionada.relacao})` : ""}
                description={selecionada?.horaLabel}
            >
                {selecionada && (
                    <div className="space-y-4">
                        {selecionada.tipo === "texto" && (
                            <p className="text-[#4f665a] text-base leading-relaxed bg-[#f8fcfb] rounded-2xl p-4">
                                {selecionada.conteudo}
                            </p>
                        )}
                        {selecionada.tipo === "audio" && (
                            <div className="bg-[#f4fbf8] rounded-2xl p-6 flex flex-col items-center gap-4">
                                <button
                                    type="button"
                                    className="p-5 rounded-full bg-[#5ba58c] text-white"
                                >
                                    <Play className="h-8 w-8 fill-white" />
                                </button>
                                <p className="text-sm text-[#6b8c7d]">
                                    Áudio de demonstração — {selecionada.duracao}
                                </p>
                            </div>
                        )}
                        {selecionada.tipo === "video" && selecionada.thumbnailUrl && (
                            <img
                                src={selecionada.thumbnailUrl}
                                alt="Vídeo"
                                className="w-full rounded-2xl object-cover max-h-56"
                            />
                        )}
                        <Button
                            className="w-full rounded-xl h-12 bg-[#5ba58c] text-white"
                            onClick={() => {
                                setSelecionada(null);
                                setModalResposta(true);
                            }}
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Responder
                        </Button>
                    </div>
                )}
            </MiDemoModal>

            <MiDemoModal
                open={modalResposta}
                onOpenChange={setModalResposta}
                title="Responder mensagem"
                description="Demonstração — gravação e envio real virão na próxima fase."
            >
                <form onSubmit={enviarResposta} className="space-y-4">
                    <div className="flex flex-col items-center gap-3 py-4 bg-[#f4fbf8] rounded-2xl">
                        <button
                            type="button"
                            className="p-6 rounded-full bg-[#255f4f] text-white shadow-lg"
                            onClick={() =>
                                toast({ title: "Gravação (demo)", description: "Microfone em breve." })
                            }
                        >
                            <Mic className="h-8 w-8" />
                        </button>
                        <p className="text-xs text-[#6b8c7d]">Toque para gravar áudio</p>
                    </div>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-[#6b8c7d]">
                            Ou escreva uma resposta
                        </span>
                        <Textarea
                            value={respostaTexto}
                            onChange={(e) => setRespostaTexto(e.target.value)}
                            placeholder="Estou pensando em você..."
                            rows={4}
                            className="rounded-xl resize-none"
                        />
                    </label>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={() => setModalResposta(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl h-12 bg-[#255f4f] text-white"
                        >
                            Enviar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>
        </div>
    );
}
