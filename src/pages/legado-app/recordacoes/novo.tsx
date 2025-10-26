// src/pages/legado-app/recordacoes/nova.tsx
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, CheckCircle, Heart, NotebookPen, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import "@/styles/legado-app.css";

export default function NovaRecordacaoPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [nomeRemetente, setNomeRemetente] = useState("");
    const [mensagem, setMensagem] = useState("");
    const [anonimo, setAnonimo] = useState(false);
    const [loading, setLoading] = useState(false);
    const [successVisible, setSuccessVisible] = useState(false);
    const [homenageado, setHomenageado] = useState<any>(null);
    const [modal, setModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

    function showAlert(message: string) {
        setModal({ visible: true, message });
    }

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("dependentes").select("*").eq("id", id).maybeSingle();
            if (error || !data) {
                showAlert("Não foi possível carregar o homenageado.");
                return;
            }
            setHomenageado(data);
        })();
    }, [id]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                showAlert("Selecione uma imagem com menos de 1MB.");
                return;
            }
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!mensagem.trim() || (!anonimo && !nomeRemetente.trim())) {
            showAlert("Preencha os campos obrigatórios.");
            return;
        }

        setLoading(true);
        let imagemUrl: string | null = null;

        try {
            if (image) {
                const ext = image.name.split(".").pop();
                const fileName = `recordacao_${Date.now()}.${ext}`;
                const path = `recordacoes/${fileName}`;

                const { error: uploadError } = await supabase.storage.from("recordacoes").upload(path, image, {
                    cacheControl: "3600",
                    upsert: false,
                });
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from("recordacoes").getPublicUrl(path);
                imagemUrl = urlData?.publicUrl || null;
            }

            const remetente = anonimo ? "Anônimo" : nomeRemetente.trim();
            const { error } = await supabase.from("recordacoes").insert({
                dependente_id: id,
                mensagem: `${mensagem.trim()}\n\n– ${remetente}`,
                imagem_url: imagemUrl,
            });
            if (error) throw error;

            setSuccessVisible(true);
            setTimeout(() => {
                setSuccessVisible(false);
                navigate(-1);
            }, 1400);
        } catch (err) {
            showAlert("Não foi possível salvar sua recordação.");
        } finally {
            setLoading(false);
        }
    }

    const nomeHomenageado = useMemo(() => homenageado?.nome || "Homenageado", [homenageado]);

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <form className="legado-form-card w-full max-w-md" onSubmit={handleSubmit} autoComplete="off">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <button type="button" onClick={() => navigate(-1)} className="legado-icon-button" aria-label="Voltar">
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-[#255f4f]">Nova Recordação</h2>
                    <div style={{ width: 36 }} />
                </div>

                {/* Microcopy acolhedor */}
                <p className="text-sm text-gray-600 text-center mb-3">
                    Escreva uma mensagem carinhosa para {nomeHomenageado}. Se quiser, anexe uma imagem.
                </p>

                {/* Homenageado */}
                {homenageado && (
                    <div className="flex flex-col items-center mb-4">
                        {homenageado.imagem_url ? (
                            <img src={homenageado.imagem_url} alt={homenageado.nome} className="w-20 h-20 rounded-full object-cover mb-1" />
                        ) : (
                            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-1">
                                <span className="text-gray-400 text-2xl">?</span>
                            </div>
                        )}
                        <div className="font-bold text-base text-[#255f4f]">{homenageado.nome}</div>
                    </div>
                )}

                {/* Mensagem */}
                <label className="legado-form-label text-center">Mensagem</label>
                <textarea
                    className="legado-input mb-3"
                    placeholder="Escreva sua mensagem aqui..."
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={5}
                    required
                />

                {/* Anexar Imagem */}
                <div className="w-full flex justify-center mb-2">
                    <label
                        className="bg-[#d1f2eb] hover:bg-[#b8ebe0] rounded-full shadow cursor-pointer font-semibold px-6 py-2 flex items-center gap-2"
                        style={{ fontSize: 16, color: "#007080", fontWeight: 600, border: "none", width: "fit-content" }}
                    >
                        <ImageIcon size={20} className="text-[#007080]" />
                        <span>Anexar imagem</span>
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </label>
                </div>

                {/* Preview */}
                {previewUrl && (
                    <div className="mb-3 cursor-pointer flex justify-center" onClick={() => window.open(previewUrl!, "_blank")}>
                        <img src={previewUrl!} alt="Preview" className="rounded-xl max-h-48" />
                    </div>
                )}

                {/* Remetente */}
                <label className="legado-form-label text-center">Seu nome</label>
                <input
                    type="text"
                    className="legado-input mb-2"
                    placeholder="Seu nome"
                    value={nomeRemetente}
                    onChange={(e) => setNomeRemetente(e.target.value)}
                    disabled={anonimo}
                    required={!anonimo}
                />

                {/* Anônimo */}
                <div className="flex items-center gap-2 mb-3 justify-center">
                    <input
                        id="anonimo"
                        type="checkbox"
                        checked={anonimo}
                        onChange={(e) => setAnonimo(e.target.checked)}
                        className="accent-[#5BA58C]"
                    />
                    <label htmlFor="anonimo" className="text-[#007080] font-semibold">
                        Enviar como anônimo
                    </label>
                </div>

                {/* Ações */}
                <button type="submit" className="legado-button w-full flex items-center justify-center gap-2" disabled={loading}>
                    {loading ? <span className="animate-spin"><CheckCircle size={20} /></span> : <CheckCircle size={20} />}
                    Enviar
                </button>

                {/* Alerta customizado */}
                {modal.visible && (
                    <div className="legado-alert" style={{ marginTop: 12 }}>
                        {modal.message}
                        <button
                            style={{ marginLeft: 8, background: "none", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer" }}
                            onClick={() => setModal({ visible: false, message: "" })}
                            type="button"
                            aria-label="Fechar alerta"
                        >
                            x
                        </button>
                    </div>
                )}

                {/* Modal de sucesso */}
                {successVisible && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-lg flex flex-col items-center">
                            <CheckCircle size={40} className="text-[#28a745] mb-2" />
                            <div className="text-[#28a745] font-bold">Recordação enviada 💙</div>
                        </div>
                    </div>
                )}
            </form>

            {/* Bottom nav */}
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