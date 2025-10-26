// src/pages/legado-app/DiarioListPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, NotebookPen, Edit, Trash2, Lock, Heart, Sparkles, History } from "lucide-react";
import "@/styles/legado-app.css";

type Diario = {
    id: string;
    auth_id: string;
    titular_ou_dependente_id?: string | null;
    tipo_pessoa?: "titular" | "dependente" | null;
    titulo: string;
    conteudo: string;
    humor?: number | null;
    privado: boolean;
    created_at: string;
    updated_at: string;
};

export default function DiarioListPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<Diario[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data, error } = await supabase
                .from("diarios_luto")
                .select("*")
                .eq("auth_id", user.id)
                .order("created_at", { ascending: false });
            if (!error && data) setItems(data as Diario[]);
            setLoading(false);
        })();
    }, []);

    async function remover(id: string) {
        if (!confirm("Deseja excluir esta entrada do diário?")) return;
        const { error } = await supabase.from("diarios_luto").delete().eq("id", id);
        if (!error) setItems(prev => prev.filter(i => i.id !== id));
    }

    function formatDateHuman(dt: string) {
        const d = new Date(dt);
        const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
        const data = new Date(d); data.setHours(0, 0, 0, 0);
        const diff = (hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);
        if (diff === 0) return `Hoje • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        if (diff === 1) return `Ontem • ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
        return d.toLocaleString();
    }

    const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="legado-form-card w-full max-w-md">

                {/* Header acolhedor */}
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 text-[#255f4f]">
                        <NotebookPen size={22} />
                        <h2 className="text-xl font-semibold">Meu Diário do Luto</h2>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Um espaço seguro para acolher seus sentimentos. Escreva no seu tempo.
                    </p>
                </div>

                {/* CTA central */}
                <div className="w-full flex justify-center mb-3">
                    <button
                        className="legado-button"
                        onClick={() => navigate("/legado-app/diario/novo")}
                        style={{ backgroundColor: "#6c63ff", minWidth: 200 }}
                        title="Criar nova entrada"
                    >
                        <Plus size={16} />
                        Nova entrada
                    </button>
                </div>

                {/* Loader / Empty / Lista */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="skeleton-card" />
                        ))}
                    </div>
                ) : empty ? (
                    <div className="text-center text-gray-600 bg-gray-50 border rounded-xl p-5">
                        <div className="flex justify-center mb-2">
                            <Heart size={22} className="text-[#255f4f]" />
                        </div>
                        <p className="font-semibold">Que tal começar com poucas linhas?</p>
                        <p className="text-sm mt-1">
                            Você pode registrar algo simples como “hoje me senti...”.
                        </p>
                        <button
                            className="legado-button mt-3"
                            onClick={() => navigate("/legado-app/diario/novo")}
                            style={{ backgroundColor: "#6c63ff" }}
                        >
                            Começar agora
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map(it => (
                            <div
                                key={it.id}
                                className="diario-card p-3 rounded-lg border bg-white hover:shadow-sm transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0">
                                        <h3 className="font-semibold text-[#255f4f] truncate">
                                            {it.titulo || "(Sem título)"}{" "}
                                            {it.privado && <span title="Privado">
                                                <Lock size={14} className="inline ml-1 text-gray-400" />
                                            </span>}
                                        </h3>
                                        <p className="text-xs text-gray-500">{formatDateHuman(it.created_at)}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button title="Editar" className="legado-icon-button" onClick={() => navigate(`/legado-app/diario/editar/${it.id}`)}>
                                            <Edit size={18} />
                                        </button>
                                        <button title="Excluir" className="legado-icon-button" onClick={() => remover(it.id)}>
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Humor em carinhas (se houver) */}
                                {typeof it.humor === "number" && it.humor >= 1 && it.humor <= 5 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Humor:{" "}
                                        <span aria-label={`humor ${it.humor} de 5`}>
                                            {"😊".repeat(it.humor)}{" "}
                                            <span className="text-gray-400">{"🙂".repeat(5 - it.humor)}</span>
                                        </span>
                                    </div>
                                )}

                                {/* Preview com 'Ler mais' */}
                                <p className="mt-2 text-gray-700 whitespace-pre-wrap line-clamp-3">
                                    {it.conteudo}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <button
                                        className="text-[#2563eb] text-sm font-semibold hover:underline"
                                        onClick={() => navigate(`/legado-app/diario/editar/${it.id}`)}
                                    >
                                        Ler mais
                                    </button>
                                    {it.tipo_pessoa && it.titular_ou_dependente_id && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-[#e4f6f0] text-[#255f4f]">
                                            Vinculado: {it.tipo_pessoa === "titular" ? "Titular" : "Dependente"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Voltar central */}
                <div className="w-full flex justify-center mt-4">
                    {/* <button className="legado-fab" onClick={() => navigate(-1)}>
            Voltar
          </button> */}
                </div>
            </div>

            {/* Bottom nav (igual ao Menu) */}
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