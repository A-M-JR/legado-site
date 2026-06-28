import { useState } from "react";
import { Phone, Headphones, Leaf, Heart, Star, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MiCard } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { apoioService } from "../services/apoioService";

const ICONE_MAP = {
    familia: Phone,
    equipe: Headphones,
    exercicio: Leaf,
};

export default function ApoioPage() {
    const opcoes = apoioService.listOpcoes();
    const contatos = apoioService.listContatos();
    const [modalOpcao, setModalOpcao] = useState<(typeof opcoes)[0] | null>(null);
    const [modalEmergencia, setModalEmergencia] = useState(false);
    const [mensagemApoio, setMensagemApoio] = useState("");

    function confirmarApoio(e: React.FormEvent) {
        e.preventDefault();
        setModalOpcao(null);
        setMensagemApoio("");
        toast({
            title: "Solicitação registrada (demo)",
            description: "Nossa equipe entraria em contato em produção.",
        });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-4">
            <MiPageHeader
                eyebrow="Apoio"
                title="Estou aqui com você"
                subtitle="Escolha como podemos te apoiar neste momento."
            />

            <div className="space-y-3">
                {opcoes.map((op) => {
                    const Icon = ICONE_MAP[op.icone];
                    return (
                        <MiCard
                            key={op.id}
                            variant="soft"
                            onClick={() => setModalOpcao(op)}
                            className="p-4 sm:p-5"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="p-3 sm:p-3.5 rounded-2xl bg-[#e3f1eb] shrink-0">
                                    <Icon className="h-6 w-6 text-[#5ba58c]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-[#255f4f] text-sm sm:text-base">
                                        {op.titulo}
                                    </p>
                                    <p className="text-xs sm:text-sm text-[#6b8c7d] leading-snug">
                                        {op.descricao}
                                    </p>
                                </div>
                            </div>
                        </MiCard>
                    );
                })}
            </div>

            <MiCard
                variant="alert"
                onClick={() => setModalEmergencia(true)}
                className="p-4 sm:p-5 cursor-pointer"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-2xl bg-orange-100 shrink-0">
                        <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-rose-500 fill-rose-500" />
                    </div>
                    <div>
                        <p className="font-bold text-[#255f4f] text-base sm:text-lg">
                            Preciso de ajuda agora
                        </p>
                        <p className="text-xs sm:text-sm text-[#6b8c7d]">
                            Toque aqui se precisar de apoio imediato.
                        </p>
                    </div>
                </div>
            </MiCard>

            <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Pessoas que cuidam</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contatos.map((c) => (
                        <MiCard key={c.id} className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                    <img
                                        src={c.fotoUrl}
                                        alt={c.nome}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-[#f4fbf8]"
                                    />
                                    {c.emergencia && (
                                        <span className="absolute -top-1 -right-1 bg-amber-400 p-1 rounded-full border-2 border-white">
                                            <Star className="h-2.5 w-2.5 text-white fill-white" />
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#255f4f] text-sm truncate">{c.nome}</p>
                                    <p className="text-[10px] sm:text-xs text-[#5ba58c] font-semibold uppercase">
                                        {c.relacao}
                                    </p>
                                </div>
                                {c.telefone && (
                                    <a
                                        href={`tel:${c.telefone}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-[#255f4f] hover:bg-emerald-100 shrink-0"
                                        aria-label={`Ligar para ${c.nome}`}
                                    >
                                        <Phone className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                        </MiCard>
                    ))}
                </div>
            </section>

            <MiDemoModal
                open={!!modalOpcao}
                onOpenChange={(open) => !open && setModalOpcao(null)}
                title={modalOpcao?.titulo || ""}
                description={modalOpcao?.descricao}
            >
                {modalOpcao?.icone === "exercicio" ? (
                    <div className="space-y-4">
                        <div className="bg-[#f4fbf8] rounded-2xl p-6 text-center space-y-3">
                            <Wind className="h-10 w-10 text-[#5ba58c] mx-auto" />
                            <p className="text-[#255f4f] font-semibold">Respire com calma</p>
                            <p className="text-sm text-[#6b8c7d]">
                                Inspire por 4 segundos, segure 4, expire por 6. Repita 3 vezes.
                            </p>
                        </div>
                        <Button
                            className="w-full rounded-xl h-12 bg-[#5ba58c] text-white"
                            onClick={() => {
                                setModalOpcao(null);
                                toast({ title: "Exercício concluído (demo)" });
                            }}
                        >
                            Concluí o exercício
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={confirmarApoio} className="space-y-4">
                        <label className="space-y-1.5 block">
                            <span className="text-xs font-semibold text-[#6b8c7d]">
                                Como podemos ajudar?
                            </span>
                            <Textarea
                                value={mensagemApoio}
                                onChange={(e) => setMensagemApoio(e.target.value)}
                                placeholder="Descreva o que você precisa..."
                                rows={4}
                                className="rounded-xl resize-none"
                            />
                        </label>
                        <div className="flex flex-col-reverse sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-xl h-12"
                                onClick={() => setModalOpcao(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                            >
                                Solicitar apoio (demo)
                            </Button>
                        </div>
                    </form>
                )}
            </MiDemoModal>

            <MiDemoModal
                open={modalEmergencia}
                onOpenChange={setModalEmergencia}
                title="Preciso de ajuda agora"
                description="Em emergência real, ligue 192 (SAMU) ou 190."
            >
                <div className="space-y-3">
                    <a
                        href="tel:192"
                        className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-rose-500 text-white font-bold text-lg"
                    >
                        <Phone className="h-5 w-5" />
                        Ligar SAMU — 192
                    </a>
                    {contatos
                        .filter((c) => c.emergencia && c.telefone)
                        .map((c) => (
                            <a
                                key={c.id}
                                href={`tel:${c.telefone}`}
                                className="flex items-center justify-between w-full py-4 px-4 rounded-2xl bg-[#f4fbf8] border border-[#e6efe9] font-semibold text-[#255f4f]"
                            >
                                <span>{c.nome}</span>
                                <Phone className="h-5 w-5 text-[#5ba58c]" />
                            </a>
                        ))}
                    <Button
                        variant="outline"
                        className="w-full rounded-xl h-12"
                        onClick={() => setModalEmergencia(false)}
                    >
                        Fechar
                    </Button>
                </div>
            </MiDemoModal>
        </div>
    );
}
