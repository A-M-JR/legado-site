// src/pages/legado-app/exercicios/ExerciciosListPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    Sparkles, Wind, Footprints, Heart, Eye,
    Palette, MessageCircle, Moon, Clock, ArrowLeft, History,
    FileText,
    NotebookPen
} from "lucide-react";
import "@/styles/legado-app.css";

type Exercicio = {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    duracao_minutos: number;
    icone: string;
    ordem: number;
    grupo: string;
};

type ExercicioRealizado = {
    exercicio_id: string;
    realizado_em: string;
};

const iconMap: Record<string, any> = {
    Wind, Footprints, Heart, Eye, Palette, MessageCircle, Sparkles, Moon
};

const grupoEmojis: Record<string, string> = {
    "Conexão emocional e alívio da dor": "🕊️",
    "Cuidado com o corpo e com o hoje": "🌸",
    "Memórias e significado": "💬",
    "Espiritualidade e esperança": "🌻",
    "Rotina de encerramento do dia": "🌙"
};

const categoriaColors: Record<string, string> = {
    respiracao: "#6EC1E4",
    movimento: "#FF9A56",
    gratidao: "#FF6B9D",
    mindfulness: "#9B59B6",
    criatividade: "#F39C12",
    conexao: "#2ECC71"
};

export default function ExerciciosListPage() {
    const navigate = useNavigate();
    const [exercicios, setExercicios] = useState<Exercicio[]>([]);
    const [realizados, setRealizados] = useState<ExercicioRealizado[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: exData } = await supabase
                .from("exercicios_autocuidado")
                .select("*")
                .eq("ativo", true)
                .order("ordem");

            const { data: { user } } = await supabase.auth.getUser();
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
            setLoading(false);
        })();
    }, []);

    function foiRealizado(exId: string) {
        return realizados.some(r => r.exercicio_id === exId);
    }

    // Agrupar exercícios por grupo
    const exerciciosPorGrupo = exercicios.reduce((acc, ex) => {
        if (!acc[ex.grupo]) acc[ex.grupo] = [];
        acc[ex.grupo].push(ex);
        return acc;
    }, {} as Record<string, Exercicio[]>);

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 py-6">
            <div className="legado-form-card w-full max-w-md">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-[#255f4f] flex items-center gap-2">
                        <Sparkles size={22} /> Exercícios para Melhorar o Dia
                    </h2>

                    <div className="flex items-center gap-2">
                        <button
                            className="legado-button"
                            onClick={() => navigate("/legado-app/exercicios/historico")}
                            title="Ver histórico de exercícios realizados"
                            style={{ backgroundColor: "#2563eb" }}
                        >
                            {/* Use History se disponível; senão, FileText */}
                            {/* <History size={16} className="inline mr-1" /> */}
                            <FileText size={16} className="inline mr-1" />
                            Histórico
                        </button>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                    Durante o luto, cuidar de si pode parecer difícil. Aqui estão pequenas práticas diárias para ajudar você a reconectar-se com a vida.
                </p>

                {loading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(exerciciosPorGrupo).map(([grupo, exs]) => (
                            <div key={grupo}>
                                <div className="space-y-3">
                                    {exs.map(ex => {
                                        const Icon = iconMap[ex.icone] || Sparkles;
                                        const realizado = foiRealizado(ex.id);
                                        const cor = categoriaColors[ex.categoria] || "#6c63ff";

                                        return (
                                            <div
                                                key={ex.id}
                                                className="p-4 rounded-lg border bg-white cursor-pointer hover:shadow-md transition-shadow"
                                                onClick={() => navigate(`/legado-app/exercicios/${ex.id}`)}
                                                style={{ borderLeft: `4px solid ${cor}` }}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className="p-2 rounded-full flex-shrink-0"
                                                        style={{ backgroundColor: `${cor}20` }}
                                                    >
                                                        <Icon size={24} style={{ color: cor }} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                                            {ex.titulo}
                                                            {realizado && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                                    ✓ Feito hoje
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                            {ex.descricao}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                                            <Clock size={14} />
                                                            {ex.duracao_minutos} min
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="w-full flex justify-center mt-6 gap-2">

                </div>
            </div>
            <nav
                className="fixed bottom-3 left-0 right-0 mx-auto max-w-md bg-white/90 backdrop-blur border rounded-xl shadow-sm px-3 py-2 flex items-center justify-around"
                style={{ zIndex: 40 }}
            >
                <button className="text-[#255f4f] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/menu")}>
                    <Heart size={18} /> Menu
                </button>
                <button className="text-[#6c63ff] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/diario")}>
                    <NotebookPen size={18} /> Diário
                </button>
                <button className="text-[#ff9a56] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/exercicios")}>
                    <Sparkles size={18} /> Exercícios
                </button>
                <button className="text-[#2563eb] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/exercicios/historico")}>
                    <History size={18} /> Histórico
                </button>
            </nav>
        </div>
    );
}