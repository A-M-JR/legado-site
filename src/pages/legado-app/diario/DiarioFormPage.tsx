import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Save, ArrowLeft, NotebookPen, Heart, Sparkles } from "lucide-react";
import LegadoLayout from "@/components/legado/LegadoLayout";
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
        const {
            data: { user },
        } = await supabase.auth.getUser();
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
        <LegadoLayout
            title={id ? "Editar entrada" : "Nova entrada"}
            subtitle={<span className="text-sm text-[#4f665a]">Um espaço seguro para acolher seus sentimentos.</span>}
        >
            <div className="w-full">
                <div className="legado-form-card w-full">
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
                    <div className="flex gap-3 mb-1 justify-center flex-wrap">
                        {[1, 2, 3, 4, 5].map((v) => (
                            <button
                                key={v}
                                type="button"
                                className={`w-12 h-12 rounded-full text-xl transition-all flex items-center justify-center ${form.humor === v ? "bg-yellow-300 scale-110" : "bg-gray-200"
                                    }`}
                                aria-pressed={form.humor === v}
                                onClick={() => setForm({ ...form, humor: v })}
                            >
                                {['😢', '🙁', '😐', '🙂', '😊'][v - 1]}
                            </button>
                        ))}
                    </div>
                    <p className="text-center text-xs text-gray-500 mb-3">{humorLabels[form.humor - 1]}</p>

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
                    <div className="flex gap-2 mt-4 flex-col sm:flex-row">
                        <button
                            className="legado-button w-full sm:flex-1 flex items-center justify-center gap-2"
                            onClick={salvar}
                            disabled={loading}
                            style={{ backgroundColor: "#6c63ff" }}
                        >
                            <Save size={16} />
                            {id ? "Salvar" : "Salvar"}
                        </button>

                        <button
                            className="legado-fab w-full sm:w-40 flex items-center justify-center gap-2"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </button>
                    </div>
                </div>
            </div>
        </LegadoLayout>
    );
}