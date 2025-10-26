// src/pages/legado-app/diario/DiarioFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Save, ArrowLeft, NotebookPen, Heart, Sparkles } from "lucide-react";
import "@/styles/legado-app.css";

type FormState = {
    titulo: string;
    conteudo: string;
    humor: number;
    privado: boolean;
    titular_ou_dependente_id?: string | null;
    tipo_pessoa?: "titular" | "dependente" | null;
};

export default function DiarioFormPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);

    const sugestao = (location.state as any)?.sugestao || "";
    const tituloSugerido = (location.state as any)?.titulo || "";

    const [form, setForm] = useState<FormState>({
        titulo: tituloSugerido,
        conteudo: "",
        humor: 3,
        privado: true,
        titular_ou_dependente_id: null,
        tipo_pessoa: null,
    });

    useEffect(() => {
        (async () => {
            if (!id) return;
            setLoading(true);
            const { data } = await supabase
                .from("diarios_luto")
                .select("*")
                .eq("id", id)
                .maybeSingle();
            if (data) {
                setForm({
                    titulo: data.titulo || "",
                    conteudo: data.conteudo || "",
                    humor: data.humor ?? 3,
                    privado: data.privado ?? true,
                    titular_ou_dependente_id: data.titular_ou_dependente_id ?? null,
                    tipo_pessoa: data.tipo_pessoa ?? null,
                });
            }
            setLoading(false);
        })();
    }, [id]);

    async function salvar() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        if (id) {
            const { error } = await supabase
                .from("diarios_luto")
                .update({
                    titulo: form.titulo,
                    conteudo: form.conteudo,
                    humor: form.humor,
                    privado: form.privado,
                    titular_ou_dependente_id: form.titular_ou_dependente_id,
                    tipo_pessoa: form.tipo_pessoa,
                })
                .eq("id", id);
            if (!error) navigate("/legado-app/diario");
        } else {
            const { error } = await supabase.from("diarios_luto").insert({
                auth_id: user.id,
                titulo: form.titulo,
                conteudo: form.conteudo,
                humor: form.humor,
                privado: form.privado,
                titular_ou_dependente_id: form.titular_ou_dependente_id,
                tipo_pessoa: form.tipo_pessoa,
            });
            if (!error) navigate("/legado-app/diario");
        }
        setLoading(false);
    }

    const humorLabels = ["Muito difícil", "Difícil", "Neutro", "Melhor", "Leve"];

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="legado-form-card w-full max-w-md">

                {/* Header com back + título centralizado */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        className="legado-icon-button"
                        onClick={() => navigate(-1)}
                        aria-label="Voltar"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-2 text-[#255f4f]">
                        <NotebookPen size={20} />
                        <h2 className="text-lg font-semibold">
                            {id ? "Editar entrada" : "Nova entrada"}
                        </h2>
                    </div>
                    <button
                        className="legado-button"
                        onClick={salvar}
                        disabled={loading}
                        style={{ minWidth: 92 }}
                    >
                        <Save size={16} />
                        Salvar
                    </button>
                </div>

                {/* Sugestão do exercício (se veio do fluxo) */}
                {sugestao && !id && (
                    <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                        <p className="text-sm text-blue-800">
                            <strong>Sugestão do exercício:</strong> {sugestao}
                        </p>
                    </div>
                )}

                {/* Título */}
                <label className="legado-form-label text-center">Título</label>
                <input
                    className="legado-input mb-3"
                    placeholder="Ex.: Hoje senti saudade..."
                    value={form.titulo}
                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />

                {/* Humor acolhedor, centralizado */}
                <label className="legado-form-label text-center">Como você está se sentindo?</label>
                <div className="flex gap-3 mb-1 justify-center">
                    {[1, 2, 3, 4, 5].map((v) => (
                        <button
                            key={v}
                            type="button"
                            className={`w-12 h-12 rounded-full text-xl transition-all ${form.humor === v ? "bg-yellow-300 scale-110" : "bg-gray-200"
                                }`}
                            aria-pressed={form.humor === v}
                            onClick={() => setForm({ ...form, humor: v })}
                        >
                            {["😢", "🙁", "😐", "🙂", "😊"][v - 1]}
                        </button>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-500 mb-3">
                    {humorLabels[form.humor - 1]}
                </p>

                {/* Conteúdo */}
                <label className="legado-form-label text-center">Escreva aqui</label>
                <textarea
                    className="legado-input"
                    rows={8}
                    placeholder="Use este espaço para registrar seus sentimentos, pensamentos e memórias. Este é um espaço seguro e sem julgamentos."
                    value={form.conteudo}
                    onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                />

                {/* Privacidade */}
                <div className="flex items-center gap-2 mt-3 justify-center">
                    <input
                        id="privado"
                        type="checkbox"
                        checked={form.privado}
                        onChange={(e) => setForm({ ...form, privado: e.target.checked })}
                    />
                    <label htmlFor="privado" className="text-sm">
                        Manter esta entrada privada
                    </label>
                </div>

                {/* Ações inferiores centralizadas */}
                <div className="flex gap-2 mt-4">
                    <button
                        className="legado-button flex-1"
                        onClick={salvar}
                        disabled={loading}
                        style={{ backgroundColor: "#6c63ff" }}
                    >
                        <Save size={16} />
                        Salvar
                    </button>
                    <button
                        className="legado-fab flex-1 "
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        
                    >
                        <ArrowLeft size={16}  />
                        Voltar
                    </button>
                </div>
            </div>

            {/* Bottom nav (igual ao Menu/Diário) */}
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
            </nav>
        </div>
    );
}