// src/pages/legado-app/exercicios/ExerciciosListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { CheckCircle2, ChevronRight, Clock, FileText } from "lucide-react";
import LegadoLayout from "../../../components/legado/LegadoLayout";
import "@/styles/legado-app.css";

type Exercicio = {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    duracao_minutos: number;
    icone?: string | null;
    ordem: number;
    grupo?: string | null;
};

type ExercicioRealizado = {
    exercicio_id: string;
    realizado_em: string;
};

// Emojis no lugar dos ícones de linha (renderizados com Noto Color Emoji, ver legado-app.css).
const emojiPorIcone: Record<string, string> = {
    Wind: "🌬️",
    Footprints: "👣",
    Heart: "💗",
    Eye: "💭",
    Palette: "🎨",
    MessageCircle: "💌",
    Sparkles: "✨",
    Moon: "🌙",
};

const emojiPorCategoria: Record<string, string> = {
    respiracao: "🌬️",
    movimento: "🚶",
    gratidao: "💗",
    mindfulness: "🧘",
    criatividade: "🎨",
    conexao: "🤝",
};

const nomeCategoria: Record<string, string> = {
    respiracao: "Respiração",
    movimento: "Movimento",
    gratidao: "Gratidão",
    mindfulness: "Mindfulness",
    criatividade: "Criatividade",
    conexao: "Conexão",
};

const grupoEmojis: Record<string, string> = {
    "Conexão emocional e alívio da dor": "🕊️",
    "Cuidado com o corpo e com o hoje": "🌸",
    "Memórias e significado": "💬",
    "Espiritualidade e esperança": "🌻",
    "Rotina de encerramento do dia": "🌙",
};

const categoriaColors: Record<string, string> = {
    respiracao: "#6EC1E4",
    movimento: "#FF9A56",
    gratidao: "#FF6B9D",
    mindfulness: "#9B59B6",
    criatividade: "#F39C12",
    conexao: "#2ECC71",
};

export default function ExerciciosListPage() {
    const navigate = useNavigate();
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [realizados, setRealizados] = useState<ExercicioRealizado[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const { data: exData } = await supabase
                    .from("exercicios_autocuidado")
                    .select("*")
                    .eq("ativo", true)
                    .order("ordem");

                const { data: { user } = {} as any } = await supabase.auth.getUser();
                let realData: ExercicioRealizado[] = [];

                if (user) {
                    const hoje = new Date().toISOString().split("T")[0];
                    const { data: rData } = await supabase
                        .from("exercicios_realizados")
                        .select("exercicio_id, realizado_em")
                        .eq("auth_id", user.id)
                        .gte("realizado_em", hoje);
                    realData = (rData as ExercicioRealizado[]) || [];
                }

                setExercicios((exData as Exercicio[]) || []);
                setRealizados(realData);
            } catch (err) {
                console.error("Erro carregando exercícios:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    function foiRealizado(exId: string) {
        return realizados.some((r) => r.exercicio_id === exId);
    }

    // Agrupar exercícios por grupo (usa "Sem grupo" quando não há valor válido)
    const exerciciosPorGrupo = exercicios.reduce((acc, ex) => {
        const grupoKey = ex.grupo && ex.grupo.toString().trim() ? ex.grupo.toString().trim() : "Sem grupo";
        if (!acc[grupoKey]) acc[grupoKey] = [];
        acc[grupoKey].push(ex);
        return acc;
    }, {} as Record<string, Exercicio[]>);

    const grupos = Object.entries(exerciciosPorGrupo);
    const mostrarGrupos = !(grupos.length === 1 && grupos[0][0] === "Sem grupo");
    const feitosHoje = exercicios.filter((ex) => foiRealizado(ex.id)).length;

    return (
        <LegadoLayout
            title="Exercícios para Melhorar o Dia"
            subtitle="Durante o luto, cuidar de si pode parecer difícil. Aqui estão pequenas práticas diárias para ajudar você a reconectar-se com a vida."
            backPath="/legado-app/menu"
            largura="larga"
        >
            <div className="w-full">
                {/* Resumo do dia + histórico */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white border border-tema-borda px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl" aria-hidden>{feitosHoje > 0 ? "🌱" : "☀️"}</span>
                        <div>
                            <p className="text-sm font-bold text-tema-titulo">
                                {feitosHoje > 0
                                    ? `Você já fez ${feitosHoje} ${feitosHoje === 1 ? "exercício" : "exercícios"} hoje`
                                    : "Escolha um pequeno passo para hoje"}
                            </p>
                            <p className="text-xs text-tema-suave">Sem pressa. Cada cuidado conta.</p>
                        </div>
                    </div>
                    <button
                        className="inline-flex items-center gap-2 rounded-full bg-[#2563eb]/10 hover:bg-[#2563eb]/15 text-[#2563eb] text-sm font-bold px-4 py-2 transition"
                        onClick={() => navigate("/legado-app/exercicios/historico")}
                        title="Ver histórico de exercícios realizados"
                    >
                        <FileText size={16} />
                        Histórico
                    </button>
                </div>

                {loading ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="skeleton-card animate-pulse rounded-2xl h-40" />
                        ))}
                    </div>
                ) : exercicios.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white/70 border border-dashed border-tema-borda-forte text-center">
                        <p className="text-tema-titulo font-semibold mb-1">Ainda não há exercícios disponíveis.</p>
                        <p className="text-sm text-tema-suave">Volte mais tarde ou confira o histórico.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {grupos.map(([grupo, exs]) => (
                            <section key={grupo}>
                                {mostrarGrupos && (
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xl" aria-hidden>{grupoEmojis[grupo] || "✨"}</span>
                                        <h3 className="font-semibold text-tema-titulo">{grupo}</h3>
                                        <span className="text-xs text-tema-suave">({exs.length})</span>
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {exs.map((ex) => {
                                        const realizado = foiRealizado(ex.id);
                                        const cor = categoriaColors[ex.categoria] || "#6c63ff";
                                        const emoji = (ex.icone && emojiPorIcone[ex.icone]) || emojiPorCategoria[ex.categoria] || "✨";

                                        return (
                                            <button
                                                key={ex.id}
                                                onClick={() => navigate(`/legado-app/exercicios/${ex.id}`)}
                                                className="group relative text-left w-full h-full flex flex-col rounded-2xl bg-white border border-tema-borda p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <span
                                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl"
                                                        style={{ backgroundColor: `${cor}1f` }}
                                                        aria-hidden
                                                    >
                                                        {emoji}
                                                    </span>
                                                    {realizado && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded-full">
                                                            <CheckCircle2 size={12} /> Feito hoje
                                                        </span>
                                                    )}
                                                </div>

                                                <h4 className="mt-4 font-serif text-lg font-bold leading-snug text-tema-titulo">{ex.titulo}</h4>
                                                <p className="mt-1.5 text-sm text-tema-texto leading-relaxed line-clamp-3">{ex.descricao}</p>

                                                <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                                                    <div className="flex flex-wrap items-center gap-1.5">
                                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-tema-suave bg-tema-claro-2 px-2.5 py-1 rounded-full">
                                                            <Clock size={12} /> {ex.duracao_minutos} min
                                                        </span>
                                                        {nomeCategoria[ex.categoria] && (
                                                            <span
                                                                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                                                style={{ backgroundColor: `${cor}1a`, color: cor }}
                                                            >
                                                                {nomeCategoria[ex.categoria]}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <ChevronRight size={18} className="text-tema-apagado group-hover:text-tema-titulo group-hover:translate-x-0.5 transition" />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </div>
        </LegadoLayout>
    );
}
