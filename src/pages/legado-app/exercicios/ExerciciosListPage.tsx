// src/pages/legado-app/exercicios/ExerciciosListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    Sparkles,
    Wind,
    Footprints,
    Heart,
    Eye,
    Palette,
    MessageCircle,
    Moon,
    Clock,
    History,
    FileText,
    NotebookPen,
} from "lucide-react";
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

const iconMap: Record<string, any> = {
    Wind,
    Footprints,
    Heart,
    Eye,
    Palette,
    MessageCircle,
    Sparkles,
    Moon,
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

    return (
        <LegadoLayout title="Exercícios para Melhorar o Dia" backPath="/legado-app/menu">
            <div className="w-full max-w-md mx-auto">
                <div className="mb-3 flex items-start justify-between">
                    <h2 className="text-xl font-semibold text-[#255f4f] flex items-center gap-2">
                        <Sparkles size={20} /> Exercícios para Melhorar o Dia
                    </h2>

                    <div className="flex items-center gap-2">
                        <button
                            className="legado-button !px-3 !py-1.5 text-sm"
                            onClick={() => navigate("/legado-app/exercicios/historico")}
                            title="Ver histórico de exercícios realizados"
                            style={{ backgroundColor: "#2563eb" }}
                        >
                            <FileText size={14} className="inline mr-1" />
                            Histórico
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Durante o luto, cuidar de si pode parecer difícil. Aqui estão pequenas práticas diárias para ajudar você a reconectar-se com a vida.
                </p>

                {loading ? (
                    <p className="text-center text-gray-500">Carregando...</p>
                ) : exercicios.length === 0 ? (
                    <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-white/30 text-center">
                        <p className="text-gray-700 mb-2">Ainda não há exercícios disponíveis.</p>
                        <p className="text-sm text-gray-500">Volte mais tarde ou confira o histórico.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(exerciciosPorGrupo).map(([grupo, exs]) => {
                            const emoji = grupoEmojis[grupo] || "✨";
                            const displayGroup = grupo || "Sem grupo";
                            return (
                                <div key={grupo}>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="text-lg">{emoji}</div>
                                        <h3 className="font-semibold text-[#255f4f]">{displayGroup}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {exs.map((ex) => {
                                            const Icon = (ex.icone && iconMap[ex.icone]) || Sparkles;
                                            const realizado = foiRealizado(ex.id);
                                            const cor = categoriaColors[ex.categoria] || "#6c63ff";

                                            return (
                                                <button
                                                    key={ex.id}
                                                    onClick={() => navigate(`/legado-app/exercicios/${ex.id}`)}
                                                    className="text-left p-4 rounded-xl border bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow flex items-start gap-3 w-full"
                                                    style={{ borderLeft: `4px solid ${cor}` }}
                                                >
                                                    <div
                                                        className="p-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: `${cor}22` }}
                                                    >
                                                        <Icon size={20} style={{ color: cor }} />
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{ex.titulo}</h4>
                                                            {realizado && (
                                                                <span className="text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                    ✓ Feito hoje
                                                                </span>
                                                            )}
                                                        </div>

                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">{ex.descricao}</p>

                                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                                            <Clock size={14} />
                                                            <span>{ex.duracao_minutos} min</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

            </div>
        </LegadoLayout>
    );
}