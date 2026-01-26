// src/pages/legado-app/recordacoes/list.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    ArrowLeft,
    ChevronLeft,
    Filter,
    QrCode,
    Trash2,
    User,
    PlusCircle,
    HeartHandshake,
    Heart,
    NotebookPen,
    Sparkles,
} from "lucide-react";
import QRCode from "react-qr-code";
import "@/styles/legado-app.css";

type Recordacao = {
    id: string;
    dependente_id: string;
    mensagem: string;
    imagem_url?: string;
    created_at: string;
};

export default function RecordacoesListPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [dependenteId, setDependenteId] = useState<string | null>(null);
    const [dependenteNome, setDependenteNome] = useState<string | null>(null);
    const [recordacoes, setRecordacoes] = useState<Recordacao[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "7dias" | "30dias">("todos");
    const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);
    const [qrVisible, setQrVisible] = useState(false);
    const [alerta, setAlerta] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
            const column = isUUID ? "id" : "nome";

            let { data, error } = await supabase
                .from("dependentes")
                .select("id, nome")
                .eq(column, id)
                .maybeSingle();

            if (!data || error) {
                const resultTitulares = await supabase
                    .from("titulares")
                    .select("id, nome")
                    .eq(column, id)
                    .maybeSingle();
                data = resultTitulares.data;
                error = resultTitulares.error;
            }

            if (!data || error) {
                setAlerta("Não foi possível encontrar o dependente ou titular.");
                return;
            }
            setDependenteId(data.id);
            setDependenteNome(data.nome);
        })();
    }, [id]);

    useEffect(() => {
        (async () => {
            if (!dependenteId) return;
            setLoading(true);
            let query = supabase
                .from("recordacoes")
                .select("*")
                .eq("dependente_id", dependenteId)
                .order("created_at", { ascending: false });

            const d = new Date();
            if (filtro === "7dias") {
                d.setDate(d.getDate() - 7);
                query = query.gte("created_at", d.toISOString());
            }
            if (filtro === "30dias") {
                d.setDate(d.getDate() - 30);
                query = query.gte("created_at", d.toISOString());
            }

            const { data, error } = await query;
            if (!error && data) setRecordacoes(data as Recordacao[]);
            setLoading(false);
        })();
    }, [dependenteId, filtro]);

    async function excluirRecordacao(recordacaoId: string) {
        if (!window.confirm("Deseja realmente excluir esta recordação?")) return;
        const { error } = await supabase.from("recordacoes").delete().eq("id", recordacaoId);
        if (error) {
            setAlerta("Não foi possível excluir a recordação.");
            return;
        }
        setRecordacoes((prev) => prev.filter((r) => r.id !== recordacaoId));
    }

    function formatarData(data: string) {
        return new Date(data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    const qrLink = useMemo(
        () => (dependenteId ? `https://legadoeconforto.com.br/recordacoes-publicas/${dependenteId}` : ""),
        [dependenteId]
    );

    function filtroLabel() {
        return filtro === "todos" ? "Exibindo: Todos" : filtro === "7dias" ? "Últimos 7 dias" : "Últimos 30 dias";
    }

    return (
        <div className="legado-app-wrapper min-h-screen pb-32 pt-4 px-4 overflow-x-hidden bg-gradient-to-b from-[#e6f4f1] to-white">

            {/* Top Bar - Botão Voltar ao Menu de Módulos */}
            <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-[#255f4f] font-bold text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                    aria-label="Voltar"
                >
                    <ChevronLeft size={18} />
                    Voltar
                </button>
                <div className="opacity-20">
                    <Heart size={20} className="text-[#255f4f]" />
                </div>
            </div>

            <div className="w-full max-w-md mx-auto space-y-6">

                {/* Saudação */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <div className="flex items-center justify-center gap-2 text-[#255f4f]">
                        <Heart size={22} fill="#255f4f" className="opacity-20" />
                        <h2 className="text-2xl font-bold tracking-tight">Recordações de {dependenteNome ?? ""}</h2>
                    </div>
                    <p className="text-base text-[#4f665a] opacity-80">Um espaço para celebrar memórias, mensagens e imagens que aquecem o coração.</p>
                </div>

                {/* Filtro central */}
                <div className="w-full flex justify-center mb-1">
                    <button
                        className="flex items-center justify-center gap-2 bg-[#eafcf9] border border-[#5BA58C] rounded-full py-2 px-4 font-semibold text-[#007080] shadow-md hover:shadow-lg transition-shadow duration-300"
                        style={{ minWidth: 160 }}
                        onClick={() =>
                            setFiltro((prev) => (prev === "todos" ? "7dias" : prev === "7dias" ? "30dias" : "todos"))
                        }
                        aria-label="Filtrar recordações"
                    >
                        <Filter size={18} />
                        {filtroLabel()}
                    </button>
                </div>

                {/* Lista / Estados */}
                <div className="overflow-y-auto px-2" style={{ maxHeight: "calc(75vh - 120px)", paddingBottom: 0 }}>
                    {loading ? (
                        <div className="space-y-4 px-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="skeleton-card animate-pulse rounded-lg h-24" />
                            ))}
                        </div>
                    ) : recordacoes.length === 0 ? (
                        <div className="text-center my-16 text-[#555] px-4">
                            <p className="font-semibold text-lg">Ainda não há recordações por aqui.</p>
                            <p className="text-sm mt-1">Convide alguém especial para deixar uma lembrança.</p>
                        </div>
                    ) : (
                        recordacoes.map((item) => {
                            const [texto, autor] = item.mensagem?.split("\n\n– ") ?? [item.mensagem ?? "", "Anônimo"];
                            return (
                                <div
                                    key={item.id}
                                    className="bg-white/90 border border-[#e6f4f1] rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all legado-recordacao-card"
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Recordação de ${autor || "Anônimo"}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#f0fbf8] flex items-center justify-center text-[#255f4f]">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[#255f4f]">{autor || "Anônimo"}</div>
                                                <div className="text-sm text-[#6b6b6b] mt-1 whitespace-pre-wrap">{(texto || "").trim()}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    excluirRecordacao(item.id);
                                                }}
                                                className="text-[#c33] bg-white/50 hover:bg-[#fff0f0] p-2 rounded-md"
                                                aria-label="Excluir recordação"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {item.imagem_url && (
                                        <div className="mt-3 flex justify-center">
                                            <img
                                                src={item.imagem_url}
                                                alt="Imagem recordação"
                                                className="rounded-lg max-h-56 w-auto object-contain shadow-md cursor-zoom-in border border-white"
                                                loading="lazy"
                                                onClick={() => setImagemExpandida(item.imagem_url!)}
                                            />
                                        </div>
                                    )}

                                    <div className="text-sm text-[#4f665a] text-right italic select-none mt-3">Enviado em: {formatarData(item.created_at)}</div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Ações */}
                <div className="pt-2 px-2 flex flex-col items-center gap-3 w-full">
                    <button
                        className="bg-[#FFADB2] px-5 py-3 rounded-xl font-extrabold flex items-center justify-center gap-3 w-full max-w-md text-base shadow-lg hover:shadow-xl transition"
                        onClick={() => navigate("/legado-app/parcerias/acalme-coracao")}
                        aria-label="Acalme seu coração"
                    >
                        <HeartHandshake className="text-[#b22222]" size={20} />
                        Acalme seu coração
                    </button>

                    <div className="flex gap-3 w-full max-w-md justify-center px-2">
                        <button
                            className="bg-[#D1F2EB] flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[#007080] font-extrabold shadow-md hover:shadow-lg transition"
                            onClick={() => setQrVisible(true)}
                            aria-label="Mostrar QR Code"
                        >
                            <QrCode size={20} />
                            QR Code
                        </button>
                        <button
                            className="bg-[#5BA58C] flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-extrabold shadow-md hover:shadow-lg transition"
                            onClick={() => navigate(`/legado-app/recordacoes/nova/${dependenteId}`)}
                            aria-label="Adicionar recordação"
                        >
                            <PlusCircle size={20} />
                            Adicionar
                        </button>
                    </div>
                </div>

                {/* Preview imagem expandida */}
                {imagemExpandida && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                        onClick={() => setImagemExpandida(null)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Visualização da imagem ampliada"
                    >
                        <img
                            src={imagemExpandida}
                            alt="Preview"
                            className="max-h-[80vh] max-w-[90vw] rounded-2xl border-4 border-white shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Modal QR Code */}
                {qrVisible && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
                        onClick={() => setQrVisible(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="QR Code para compartilhamento"
                    >
                        <div
                            className="bg-white rounded-xl p-6 flex flex-col items-center relative shadow-lg max-w-xs w-full animate-in zoom-in-95 duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-[#007080] mb-3 text-center">Compartilhe uma recordação 💙</h3>
                            {qrLink && <QRCode value={qrLink} style={{ width: 160, height: 160 }} />}
                            {qrLink && (
                                <a
                                    href={qrLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-[#007080] underline mt-3 break-words text-center text-sm"
                                >
                                    {qrLink}
                                </a>
                            )}
                            <button
                                className="absolute top-2 right-2 text-lg text-[#007080]"
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                                onClick={() => setQrVisible(false)}
                                aria-label="Fechar modal QR Code"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Alerta */}
                {alerta && (
                    <div
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#dc3545] text-white py-2 px-6 rounded-lg shadow-xl z-50 font-bold flex items-center gap-4"
                        role="alert"
                        aria-live="assertive"
                    >
                        {alerta}
                        <button
                            onClick={() => setAlerta(null)}
                            aria-label="Fechar alerta"
                            className="text-white font-bold text-xl leading-none focus:outline-none"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <nav
                className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 backdrop-blur-md border border-[#d8e8e0] rounded-2xl shadow-2xl px-6 py-3.5 flex items-center justify-between z-50 animate-in slide-in-from-bottom duration-500"
            >
                <button onClick={() => navigate("/legado-app/menu")} className="flex flex-col items-center gap-1 text-[#255f4f] group">
                    <Heart size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-tighter">Menu</span>
                </button>
                <button onClick={() => navigate("/legado-app/diario")} className="flex flex-col items-center gap-1 text-[#6c63ff] group">
                    <NotebookPen size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-tighter">Diário</span>
                </button>
                <button onClick={() => navigate("/legado-app/exercicios")} className="flex flex-col items-center gap-1 text-[#ff9a56] group">
                    <Sparkles size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[11px] font-bold uppercase tracking-tighter">Exercícios</span>
                </button>
            </nav>
        </div>
    );
}