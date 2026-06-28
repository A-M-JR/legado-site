import { useEffect, useState, useMemo, useRef } from "react";
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
    Share2,
    Download,
    X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import "@/styles/legado-app.css";
import logoVerde from "@/assets/Legado - Verde.png";
import { formatBR } from "../../../utils/formatDateToBR";

type Recordacao = {
    id: string;
    dependente_id: string;
    mensagem: string;
    imagem_url?: string;
    created_at: string;
};

type PersonData = {
    id: string;
    nome: string;
    data_nascimento: string;
    data_falecimento?: string;
    falecido: boolean;
    imagem_url?: string;
};

export default function RecordacoesListPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [dependenteId, setDependenteId] = useState<string | null>(null);
    const [person, setPerson] = useState<PersonData | null>(null);
    const [recordacoes, setRecordacoes] = useState<Recordacao[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "7dias" | "30dias">("todos");
    const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);
    const [qrVisible, setQrVisible] = useState(false);
    const [alerta, setAlerta] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPDF, setGeneratingPDF] = useState(false);
    const pdfRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            if (!id) return;
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id);
            const column = isUUID ? "id" : "nome";

            let { data, error } = await supabase
                .from("dependentes")
                .select("id, nome, data_nascimento, data_falecimento, falecido, imagem_url")
                .eq(column, id)
                .maybeSingle();

            if (!data || error) {
                const resultTitulares = await supabase
                    .from("titulares")
                    .select("id, nome, data_nascimento, data_falecimento, falecido, imagem_url")
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
            setPerson(data as PersonData);
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


    function formatarDataHora(data: string) {
        if (!data) return "";
        return new Date(data).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    }

    const qrLink = useMemo(
        () => (dependenteId ? `https://legadoeconforto.com.br/recordacoes-publicas/${dependenteId}` : ""),
        [dependenteId]
    );

    function shareWhatsApp() {
        if (!qrLink || !person) return;
        const text = `💙 Olá! Gostaria de convidar você para deixar uma recordação especial para ${person.nome} no Instituto Legado.\n\nAcesse pelo link: ${qrLink}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }

    async function downloadPDF() {
        if (!pdfRef.current || generatingPDF) return;
        setGeneratingPDF(true);
        try {
            // Pequeno delay para garantir renderização do QR
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const [{ toPng }, { jsPDF }] = await Promise.all([
                import('html-to-image'),
                import('jspdf'),
            ]);

            const dataUrl = await toPng(pdfRef.current, { 
                quality: 1,
                pixelRatio: 2, // Aumenta qualidade
                cacheBust: true,
                backgroundColor: '#ffffff'
            });
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`memorial-${person?.nome || 'legado'}.pdf`);
        } catch (error) {
            console.error('Erro ao gerar PDF', error);
            setAlerta("Erro ao gerar o PDF. Tente novamente.");
        } finally {
            setGeneratingPDF(false);
        }
    }

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
                        <h2 className="text-2xl font-bold tracking-tight">Recordações de {person?.nome ?? ""}</h2>
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

                                    <div className="text-sm text-[#4f665a] text-right italic select-none mt-3">Enviado em: {formatarDataHora(item.created_at)}</div>
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
                        className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4"
                        onClick={() => setQrVisible(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="QR Code para compartilhamento"
                    >
                        <div
                            className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center relative shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200 border-4 border-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setQrVisible(false)}
                            >
                                <X size={20} />
                            </button>

                            <h3 className="text-xl font-bold text-[#255f4f] mb-6 text-center pr-8 leading-tight">Compartilhe uma recordação 💙</h3>
                            
                            <div className="bg-[#f0f9f6] p-6 rounded-3xl mb-6 shadow-inner border border-emerald-100">
                                {qrLink && <QRCodeCanvas value={qrLink} size={180} level="H" />}
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <button
                                    onClick={shareWhatsApp}
                                    className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                                >
                                    <Share2 size={20} />
                                    WhatsApp
                                </button>

                                <button
                                    onClick={downloadPDF}
                                    disabled={generatingPDF}
                                    className="flex items-center justify-center gap-3 bg-[#5BA58C] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {generatingPDF ? (
                                        <Sparkles className="animate-spin" size={20} />
                                    ) : (
                                        <Download size={20} />
                                    )}
                                    {generatingPDF ? "Gerando PDF..." : "Gerar PDF para Impressão"}
                                </button>
                            </div>

                            <p className="mt-6 text-[11px] text-gray-400 text-center leading-relaxed font-medium uppercase tracking-wider">
                                Escolha uma das opções para convidar familiares e amigos.
                            </p>
                        </div>
                    </div>
                )}

                {/* Template Oculto para o PDF (Cópia da imagem enviada) */}
                <div style={{ position: 'fixed', left: '-2000px', top: '0', opacity: 0, pointerEvents: 'none' }}>
                    <div 
                        ref={pdfRef}
                        className="bg-white"
                        style={{ 
                            width: '794px', 
                            height: '1123px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            fontFamily: "serif", 
                            padding: '40px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Header Logos */}
                        <div className="w-full flex justify-between items-start mb-8">
                            <img src={logoVerde} alt="Logo" style={{ height: '55px' }} />
                            <div className="text-right italic text-gray-400 text-base max-w-[250px] leading-snug">
                                Porque toda vida merece ser lembrada com carinho!
                            </div>
                        </div>

                        {/* Foto de Perfil */}
                        <div className="mb-6">
                            <div className="w-44 h-44 rounded-full overflow-hidden border-8 border-[#f0f9f6] shadow-xl">
                                {person?.imagem_url ? (
                                    <img src={person.imagem_url} alt="Perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-200">
                                        <User size={60} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nome e Datas */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-[#007080] mb-2">{person?.nome}</h1>
                            <div className="text-lg text-gray-500 font-medium">
                                <p>Nascimento: {formatBR(person?.data_nascimento)}</p>
                                {person?.falecido && person?.data_falecimento && (
                                    <p>Falecimento: {formatBR(person.data_falecimento)}</p>
                                )}
                            </div>
                        </div>

                        {/* Convite */}
                        <div className="text-center mb-6 max-w-2xl">
                            <h2 className="text-2xl font-bold text-[#007080] mb-4 flex items-center justify-center gap-4">
                                Deixe sua recordação <span className="text-blue-500">💙</span>
                            </h2>
                            <p className="text-xl font-bold text-gray-800 leading-snug mb-6">
                                Caso queira deixar uma mensagem de carinho e conforto para a família, certamente levará alegria aos corações entristecidos.
                            </p>
                            <p className="text-base text-gray-600 font-medium mb-4">
                                Deixe mensagem escrita e fotos. ✍️📸🤳
                            </p>
                            <p className="text-lg font-bold text-gray-900 border-b-2 border-red-100 inline-block pb-1">
                                Acesse o <span className="text-red-600 underline">QRCode</span> e deixe quantas mensagens desejar.
                            </p>
                        </div>

                        {/* QR Code central */}
                        <div className="p-6 bg-white border-2 border-gray-100 rounded-[2rem] shadow-sm mb-6 flex flex-col items-center">
                            <p className="text-[#007080] font-bold text-lg mb-4 text-center">
                                Compartilhe uma recordação <span className="text-blue-500">💙</span>
                            </p>
                            <div className="bg-white p-3">
                                {qrLink && <QRCodeCanvas value={qrLink} size={220} level="H" />}
                            </div>
                        </div>

                        {/* Footer Logo */}
                        <div className="mt-auto w-full flex flex-col items-start pt-6 border-t border-gray-50 opacity-50">
                            <img src={logoVerde} alt="Logo Footer" style={{ height: '45px', marginBottom: '6px' }} />
                            <p className="italic text-gray-400 text-sm">
                                Porque toda vida merece ser lembrada com carinho!
                            </p>
                        </div>
                    </div>
                </div>

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