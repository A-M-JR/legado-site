import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    ArrowLeft,
    Check,
    Wind,
    Footprints,
    Heart,
    Eye,
    Palette,
    MessageCircle,
    Sparkles,
    Moon,
    Clock,
    NotebookPen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LegadoLayout from "@/components/legado/LegadoLayout";
import "@/styles/legado-app.css";
import { toast } from "@/hooks/use-toast";

type Exercicio = {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    duracao_minutos: number;
    icone: string;
    grupo: string;
    redireciona_diario: boolean;
};

const iconMap: Record<string, LucideIcon> = {
    Wind,
    Footprints,
    Heart,
    Eye,
    Palette,
    MessageCircle,
    Sparkles,
    Moon,
};

const categoriaColors: Record<string, string> = {
    respiracao: "#6EC1E4",
    movimento: "#FF9A56",
    gratidao: "#FF6B9D",
    mindfulness: "#9B59B6",
    criatividade: "#F39C12",
    conexao: "#2ECC71",
};

const grupoEmojis: Record<string, string> = {
    "Conexão emocional e alívio da dor": "🕊️",
    "Cuidado com o corpo e com o hoje": "🌸",
    "Memórias e significado": "💬",
    "Espiritualidade e esperança": "🌻",
    "Rotina de encerramento do dia": "🌙",
};

export default function ExercicioDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [exercicio, setExercicio] = useState<Exercicio | null>(null);
    const [humor, setHumor] = useState(3);
    const [observacao, setObservacao] = useState("");
    const [concluido, setConcluido] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const { data } = await supabase
                .from("exercicios_autocuidado")
                .select("*")
                .eq("id", id)
                .maybeSingle();

            if (data) {
                setExercicio(data as Exercicio);
            } else {
                setNotFound(true);
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user && id) {
                const start = new Date();
                start.setHours(0, 0, 0, 0);
                const end = new Date();
                end.setHours(23, 59, 59, 999);

                const { data: realData } = await supabase
                    .from("exercicios_realizados")
                    .select("*")
                    .eq("auth_id", user.id)
                    .eq("exercicio_id", id)
                    .gte("realizado_em", start.toISOString())
                    .lte("realizado_em", end.toISOString())
                    .maybeSingle();

                if (realData) {
                    setConcluido(true);
                    toast({ title: "Exercício concluído", description: "Seu progresso foi salvo." });
                }

                const { count, error } = await supabase
                    .from("exercicios_realizados")
                    .select("*", { count: "exact", head: true })
                    .eq("auth_id", user.id)
                    .eq("exercicio_id", id);

                if (!error) setVezesRealizado(count ?? 0);
            }
            setPageLoading(false);
        })();
    }, [id]);

    async function marcarConcluido() {
        if (!exercicio || !id) return;

        setLoading(true);
        const {
            data: { user },
            error: userErr,
        } = await supabase.auth.getUser();
        if (userErr) console.error("auth.getUser error:", userErr);
        if (!user) {
            toast({ variant: "destructive", title: "Erro", description: "Usuário não autenticado." });
            setLoading(false);
            return;
        }

        const payload = {
            auth_id: user.id,
            exercicio_id: id,
            nota_humor: humor,
            observacao: observacao || null,
        };

        const { error: insertErr } = await supabase.from("exercicios_realizados").insert(payload);

        if (insertErr) {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível salvar o exercício." });
            setLoading(false);
            return;
        }

        setConcluido(true);
        toast({ title: "Exercício concluído!", description: "Seu progresso foi salvo." });

        if (exercicio.redireciona_diario) {
            setTimeout(() => {
                navigate("/legado-app/diario/novo", {
                    state: { titulo: exercicio.titulo, sugestao: exercicio.descricao },
                    replace: true,
                });
            }, 900);
        } else {
            setTimeout(() => {
                navigate("/legado-app/exercicios", { replace: true });
            }, 900);
        }

        setLoading(false);
    }

    if (pageLoading) {
        return (
            <LegadoLayout title="Exercício" subtitle="Carregando...">
                <div className="flex justify-center py-12">
                    <div className="h-10 w-10 border-4 border-legado-primary/30 border-t-legado-primary rounded-full animate-spin" />
                </div>
            </LegadoLayout>
        );
    }

    if (notFound || !exercicio) {
        return (
            <LegadoLayout title="Exercício não encontrado" subtitle="">
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">Este exercício não existe ou foi removido.</p>
                    <button className="legado-button" onClick={() => navigate("/legado-app/exercicios")}>Voltar</button>
                </div>
            </LegadoLayout>
        );
    }

    const Icon = iconMap[exercicio.icone] || Sparkles;
    const cor = categoriaColors[exercicio.categoria] || "#6c63ff";
    const emoji = grupoEmojis[exercicio.grupo] || "🌤️";

    return (
        <LegadoLayout
            title={exercicio?.titulo || "Exercício"}
            subtitle={<span className="text-sm text-[#4f665a]">{exercicio.grupo} • {exercicio.duracao_minutos} min</span>}
        >
            <div className="w-full">
                <div className="legado-form-card w-full">
                    <div className="p-4 rounded-lg mb-4 text-center" style={{ backgroundColor: `${cor}20` }}>
                        <div className="text-4xl mb-2">{emoji}</div>
                        <Icon size={44} style={{ color: cor, margin: "0 auto" }} />
                        <h3 className="text-xl font-bold mt-3" style={{ color: cor }}>{exercicio.titulo}</h3>
                        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{exercicio.duracao_minutos} minutos</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{exercicio.grupo}</p>
                        {vezesRealizado > 0 && (
                            <p className="text-xs text-gray-600 mt-2 font-semibold">✨ Você já fez este exercício {vezesRealizado} {vezesRealizado === 1 ? "vez" : "vezes"}</p>
                        )}
                    </div>

                    <div className="mb-4 max-h-[40vh] md:max-h-[55vh] lg:max-h-[60vh] overflow-auto">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {exercicio.descricao}
                        </p>
                    </div>

                    {!concluido ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2 text-center">Como você está se sentindo agora?</label>
                                <div className="flex gap-2 justify-center">
                                    {[1, 2, 3, 4, 5].map((v) => (
                                        <button
                                            key={v}
                                            type="button"
                                            className={`w-12 h-12 rounded-full text-xl font-bold transition-all ${humor === v ? "bg-yellow-300 scale-110" : "bg-gray-200 hover:bg-gray-300"
                                                }`}
                                            onClick={() => setHumor(v)}
                                            aria-pressed={humor === v}
                                        >
                                            {["😢", "🙁", "😐", "🙂", "😊"][v - 1]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-1">Observações (opcional)</label>
                                <textarea
                                    className="legado-input"
                                    rows={3}
                                    placeholder="Como foi fazer este exercício?"
                                    value={observacao}
                                    onChange={(e) => setObservacao(e.target.value)}
                                />
                            </div>

                            <button
                                className="legado-button w-full mb-2"
                                onClick={marcarConcluido}
                                disabled={loading}
                                style={{ backgroundColor: cor }}
                            >
                                <Check size={16} className="inline mr-1" />
                                {exercicio.redireciona_diario ? "Concluir e abrir diário" : "Marcar como concluído"}
                            </button>
                        </>
                    ) : (
                        <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                            <Check size={48} className="text-green-500 mx-auto mb-2" />
                            <p className="text-green-700 font-semibold">Parabéns! Você concluiu este exercício hoje. 🌤️</p>
                            {exercicio.redireciona_diario && (
                                <p className="text-sm text-gray-600 mt-2">Redirecionando para o diário...</p>
                            )}
                        </div>
                    )}

                    <button
                        className="legado-fab w-full"
                        onClick={() => navigate("/legado-app/exercicios", { replace: true })}
                    >
                        <ArrowLeft size={16} className="inline mr-1" /> Voltar
                    </button>
                </div>
            </div>
        </LegadoLayout>
    );
}