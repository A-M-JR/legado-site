import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pill, Calendar, Sparkles, Users, ChevronRight } from "lucide-react";
import { MoodSelector } from "../components/MoodSelector";
import { MiCard, MiListItem } from "../components/MiCard";
import { useMelhorIdade } from "../context/MelhorIdadeContext";
import { agendaService } from "../services/agendaService";

const ICON_MAP = {
    medicacao: Pill,
    compromisso: Calendar,
    cuidado: Sparkles,
    momento: Sparkles,
};

const ICON_BG: Record<string, string> = {
    medicacao: "text-blue-600",
    compromisso: "text-emerald-600",
    cuidado: "text-amber-600",
    momento: "text-orange-500",
};

export default function HomePage() {
    const navigate = useNavigate();
    const { profile, updateHumor } = useMelhorIdade();
    const tarefas = useMemo(() => agendaService.list().slice(0, 3), []);

    const fotoPerfil =
        profile.fotoUrl ||
        "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=120&q=80";

    return (
        <div className="space-y-6 sm:space-y-8 pb-4">
            <section className="flex items-center gap-4 sm:gap-5">
                <img
                    src={fotoPerfil}
                    alt={profile.nome}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
                />
                <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#255f4f] truncate">
                        Olá, {profile.nome || "você"}! 👋
                    </h1>
                    <p className="text-sm sm:text-base text-[#6b8c7d]">Hoje é um novo dia.</p>
                </div>
            </section>

            <MiCard variant="soft" className="p-4 sm:p-5 space-y-3">
                <div>
                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">
                        Como você está agora?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#6b8c7d]">
                        Escolha como está se sentindo.
                    </p>
                </div>
                <MoodSelector value={profile.humorAtual} onChange={updateHumor} size="sm" />
            </MiCard>

            <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Resumo do seu dia</h2>
                <div className="space-y-2.5">
                    {tarefas.map((t) => {
                        const Icon = ICON_MAP[t.tipo] || Sparkles;
                        return (
                            <MiListItem
                                key={t.id}
                                icon={<Icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                                iconClassName={ICON_BG[t.tipo]}
                                titulo={t.titulo}
                                descricao={t.descricao}
                                horario={t.horario}
                                onClick={() => navigate("/melhor-idade/minha-rotina")}
                            />
                        );
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => navigate("/melhor-idade/minha-rotina")}
                    className="text-sm font-semibold text-[#5ba58c] hover:underline flex items-center gap-1 px-1"
                >
                    Ver minha rotina completa <ChevronRight className="h-4 w-4" />
                </button>
            </section>

            <MiCard
                variant="accent"
                onClick={() => navigate("/melhor-idade/familia")}
                className="p-4 sm:p-5"
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-2xl bg-violet-100 shadow-sm shrink-0">
                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-[#255f4f] text-sm sm:text-base">
                            Minha família
                        </p>
                        <p className="text-xs sm:text-sm text-[#6b8c7d]">
                            Veja mensagens e memórias compartilhadas
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                </div>
            </MiCard>
        </div>
    );
}
