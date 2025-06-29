// src/pages/legado-app/recordacoes/nova.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, CheckCircle } from "lucide-react";
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
    const [modal, setModal] = useState<{ visible: boolean; message: string }>({
        visible: false,
        message: "",
    });

    function showAlert(message: string) {
        setModal({ visible: true, message });
    }

    useEffect(() => {
        (async () => {
            const { data, error } = await supabase
                .from("dependentes")
                .select("*")
                .eq("id", id)
                .maybeSingle();

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
        if (!mensagem || (!anonimo && !nomeRemetente)) {
            showAlert("Preencha os campos obrigatórios.");
            return;
        }

        setLoading(true);
        let imagemUrl = null;

        if (image) {
            const ext = image.name.split(".").pop();
            const fileName = `recordacao_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from("recordacoes")
                .upload(`recordacoes/${fileName}`, image, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) {
                setLoading(false);
                showAlert("Falha ao enviar imagem.");
                return;
            }

            const { data: urlData } = supabase.storage
                .from("recordacoes")
                .getPublicUrl(`recordacoes/${fileName}`);
            imagemUrl = urlData?.publicUrl;
        }

        const remetente = anonimo ? "Anônimo" : nomeRemetente;
        const { error } = await supabase.from("recordacoes").insert({
            dependente_id: id,
            mensagem: `${mensagem}\n\n– ${remetente}`,
            imagem_url: imagemUrl,
        });

        setLoading(false);
        if (error) {
            showAlert("Não foi possível salvar sua recordação.");
            return;
        }

        setSuccessVisible(true);
        setTimeout(() => {
            setSuccessVisible(false);
            navigate(-1);
        }, 1800);
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
            <form
                className="legado-form-card w-full max-w-md"
                onSubmit={handleSubmit}
                autoComplete="off"
            >
                {/* Header igual ao Editar Dependente */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                    <button onClick={() => navigate(-1)} className="legado-icon-button">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: "#356c6f", margin: 0 }}>
                        Nova Recordação
                    </h2>
                </div>

                {/* Homenageado */}
                {homenageado && (
                    <div className="flex flex-col items-center mb-6">
                        {homenageado.imagem_url ? (
                            <img
                                src={homenageado.imagem_url}
                                alt={homenageado.nome}
                                className="w-20 h-20 rounded-full object-cover mb-1"
                            />
                        ) : (
                            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mb-1">
                                <svg width={60} height={60} fill="#888">
                                    <circle cx={30} cy={30} r={30} fill="#eee" />
                                    <text
                                        x="50%"
                                        y="54%"
                                        fontSize="28"
                                        textAnchor="middle"
                                        fill="#aaa"
                                        fontFamily="Arial"
                                    >
                                        ?
                                    </text>
                                </svg>
                            </div>
                        )}
                        <div className="font-bold text-base text-[#255f4f]">{homenageado.nome}</div>
                    </div>
                )}

                <div className="text-lg font-bold text-center mb-2">Deixe sua recordação</div>
                <textarea
                    className="legado-input mb-3"
                    placeholder="Escreva sua mensagem aqui..."
                    value={mensagem}
                    onChange={e => setMensagem(e.target.value)}
                    rows={5}
                />

                {/* Botão de Anexar Imagem */}
                <div className="w-full flex justify-center mb-2">
                    <label
                        className="bg-[#d1f2eb] hover:bg-[#b8ebe0] rounded-full shadow cursor-pointer font-semibold px-6 py-2"
                        style={{ fontSize: 16, color: "#007080", fontWeight: 600, border: "none", width: "fit-content" }}
                    >
                        <ImageIcon size={20} className="text-[#007080]" />
                        <span>Anexar imagem</span>
                        <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                    </label>
                </div>
                {previewUrl && (
                    <div
                        className="mb-3 cursor-pointer flex justify-center"
                        onClick={() => window.open(previewUrl, "_blank")}
                        title="Visualizar imagem"
                    >
                        <img src={previewUrl} alt="Preview" className="rounded-xl max-h-48" />
                    </div>
                )}

                <input
                    type="text"
                    className="legado-input mb-2"
                    placeholder="Seu nome"
                    value={nomeRemetente}
                    onChange={e => setNomeRemetente(e.target.value)}
                    disabled={anonimo}
                />

                <div
                    className="flex items-center gap-2 mb-3 cursor-pointer"
                    onClick={() => setAnonimo(a => !a)}
                >
                    <input
                        type="checkbox"
                        checked={anonimo}
                        onChange={e => setAnonimo(e.target.checked)}
                        className="accent-[#5BA58C]"
                    />
                    <span className="text-[#007080] font-semibold">
                        Enviar como anônimo
                    </span>
                </div>

                <button
                    type="submit"
                    className="legado-button w-full flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="animate-spin"><CheckCircle size={20} /></span>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Enviar
                        </>
                    )}
                </button>

                {/* Alerta customizado */}
                {modal.visible && (
                    <div className="legado-alert" style={{ marginTop: 12 }}>
                        {modal.message}
                        <button
                            style={{
                                marginLeft: 8,
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                            onClick={() => setModal({ visible: false, message: "" })}
                            type="button"
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
        </div>
    );
}
