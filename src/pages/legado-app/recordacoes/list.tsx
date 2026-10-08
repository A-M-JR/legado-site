import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    ChevronLeft,
    Filter,
    QrCode,
    Trash2,
    User,
    PlusCircle,
    HeartHandshake,
    Heart,
    Sparkles,
    Share2,
    Download,
    X,
    ScrollText,
    Check,
    Link2,
    Printer,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import MemorialPdfTemplate from "@/components/recordacoes/MemorialPdfTemplate";
import { Divisor } from "@/components/recordacoes/Ornamentos";
import LegadoNav, { LEGADO_NAV_ESPACO } from "@/components/legado/LegadoNav";
import { temaMemorial } from "@/lib/legadoTema";
import "@/styles/legado-app.css";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { isVideoMediaUrl } from "@/lib/validation";
import { buscarNota, linkCompartilhamento, mensagemWhatsApp, type NotaFalecimento } from "@/lib/notaFalecimento";

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

type RecordacoesListPageProps = {
    embedded?: boolean;
    backPath?: string;
    novaBasePath?: string;
    apoioPath?: string;
};

export default function RecordacoesListPage({
    embedded = false,
    backPath,
    novaBasePath = "/legado-app/recordacoes/nova",
    apoioPath = "/legado-app/parcerias/acalme-coracao",
}: RecordacoesListPageProps) {
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
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const [nota, setNota] = useState<NotaFalecimento | null>(null);
    const [linkCopiado, setLinkCopiado] = useState(false);

    useEffect(() => {
        if (dependenteId && person?.falecido) buscarNota(dependenteId).then(setNota);
    }, [dependenteId, person?.falecido]);

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
        const ok = await confirmDialog({
            title: "Excluir esta recordação?",
            description: "Essa ação não pode ser desfeita.",
        });
        if (!ok) return;
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
        if (!person) return;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemWhatsApp(person))}`, '_blank');
    }

    async function copiarLink() {
        if (!dependenteId) return;
        try {
            await navigator.clipboard.writeText(linkCompartilhamento(dependenteId));
            setLinkCopiado(true);
            setTimeout(() => setLinkCopiado(false), 2000);
        } catch {
            setAlerta("Não foi possível copiar o link.");
        }
    }

    function baixarQrCode() {
        const canvas = qrCanvasRef.current;
        if (!canvas) return;
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `qrcode-${person?.nome || "legado"}.png`;
        a.click();
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

    const voltar = () => {
        if (backPath) navigate(backPath);
        else navigate(-1);
    };

    return (
        <div className={`legado-app-wrapper min-h-screen ${embedded ? "pb-8" : LEGADO_NAV_ESPACO} pt-4 px-4 overflow-x-hidden bg-gradient-to-b from-tema-fundo-topo to-tema-fundo-base`}>

            <div className="w-full max-w-md md:max-w-5xl mx-auto space-y-6">
                {/* Top bar */}
                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                    <button
                        onClick={voltar}
                        className="flex items-center gap-2 text-tema-titulo font-bold text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                        aria-label="Voltar"
                    >
                        <ChevronLeft size={18} />
                        Voltar
                    </button>
                    <Heart size={20} className="text-tema-titulo opacity-20" aria-hidden />
                </div>

                {/* Título */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <div className="flex items-center justify-center gap-2 text-tema-titulo">
                        <Heart size={22} fill="currentColor" className="opacity-20 shrink-0" />
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Recordações de {person?.nome ?? ""}</h2>
                    </div>
                    <p className="text-base text-tema-texto opacity-80">Um espaço para celebrar memórias, mensagens e imagens que aquecem o coração.</p>
                    {temaMemorial && (
                        <div className="pt-3">
                            <Divisor />
                        </div>
                    )}
                </div>

                {/* Ações — no topo para nunca ficarem atrás da barra de navegação */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3">
                    <button
                        className="bg-tema-primaria hover:bg-tema-primaria-escura flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition active:scale-95"
                        onClick={() => navigate(`${novaBasePath}/${dependenteId}`)}
                    >
                        <PlusCircle size={20} />
                        Adicionar
                    </button>
                    <button
                        className="bg-tema-destaque-claro flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-tema-destaque font-bold shadow-md hover:shadow-lg transition active:scale-95"
                        onClick={() => setQrVisible(true)}
                    >
                        <QrCode size={20} />
                        Compartilhar
                    </button>
                    {person?.falecido && (
                        <button
                            className="bg-white border-2 border-tema-titulo flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-tema-titulo font-bold shadow-sm hover:shadow-md transition active:scale-95"
                            onClick={() => navigate(`/legado-app/nota/editar/${dependenteId}`)}
                        >
                            <ScrollText size={20} />
                            Nota de falecimento
                        </button>
                    )}
                    <button
                        className={`bg-[#FFADB2] flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-[#5a1f22] shadow-md hover:shadow-lg transition active:scale-95 ${person?.falecido ? "" : "col-span-2 md:col-span-1"}`}
                        onClick={() => navigate(apoioPath)}
                    >
                        <HeartHandshake className="text-[#b22222]" size={20} />
                        Acalme seu coração
                    </button>
                </div>

                {/* Filtro */}
                <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-sm font-semibold text-tema-suave">
                        {loading ? "Carregando..." : `${recordacoes.length} recordaç${recordacoes.length === 1 ? "ão" : "ões"}`}
                    </p>
                    <button
                        className="flex items-center justify-center gap-2 bg-white border border-tema-borda-forte rounded-full py-2 px-4 text-sm font-semibold text-tema-titulo shadow-sm hover:shadow-md transition"
                        onClick={() =>
                            setFiltro((prev) => (prev === "todos" ? "7dias" : prev === "7dias" ? "30dias" : "todos"))
                        }
                        aria-label="Filtrar recordações"
                    >
                        <Filter size={16} />
                        {filtroLabel()}
                    </button>
                </div>

                {/* Lista — rola com a página; mural em 2 colunas no tablet/desktop */}
                {loading ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="skeleton-card animate-pulse rounded-2xl h-28" />
                        ))}
                    </div>
                ) : recordacoes.length === 0 ? (
                    <div className="text-center py-16 px-4 bg-white/60 rounded-2xl border border-dashed border-tema-borda-forte">
                        <p className="font-semibold text-lg text-tema-titulo">Ainda não há recordações por aqui.</p>
                        <p className="text-sm mt-1 text-tema-suave">Convide alguém especial para deixar uma lembrança.</p>
                    </div>
                ) : (
                    <div className="md:columns-2 md:gap-4">
                        {recordacoes.map((item) => {
                            const [texto, autor] = item.mensagem?.split("\n\n– ") ?? [item.mensagem ?? "", "Anônimo"];
                            return (
                                <div
                                    key={item.id}
                                    className="break-inside-avoid bg-white border border-tema-borda rounded-2xl p-4 mb-4 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-tema-claro flex items-center justify-center text-tema-titulo shrink-0">
                                            <User size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-tema-titulo truncate">{autor || "Anônimo"}</p>
                                            <p className="text-[11px] text-tema-apagado mt-0.5">{formatarDataHora(item.created_at)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => excluirRecordacao(item.id)}
                                            className="text-[#c33] hover:bg-red-50 p-2 rounded-lg shrink-0"
                                            aria-label="Excluir recordação"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    {(texto || "").trim() && (
                                        <p className="text-[15px] text-tema-texto mt-3 whitespace-pre-wrap break-words leading-relaxed">
                                            {(texto || "").trim()}
                                        </p>
                                    )}

                                    {item.imagem_url && (
                                        <div className="mt-3 flex justify-center">
                                            {isVideoMediaUrl(item.imagem_url) ? (
                                                <video
                                                    src={item.imagem_url}
                                                    controls
                                                    className="max-w-full max-h-80 rounded-xl bg-black shadow-sm"
                                                />
                                            ) : (
                                                <img
                                                    src={item.imagem_url}
                                                    alt="Mídia da recordação"
                                                    className="max-w-full max-h-80 w-auto h-auto rounded-xl border border-tema-borda shadow-sm cursor-zoom-in"
                                                    loading="lazy"
                                                    onClick={() => setImagemExpandida(item.imagem_url!)}
                                                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

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

                {/* Modal QR Code / compartilhamento */}
                {qrVisible && (
                    <div
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] sm:p-4"
                        onClick={() => setQrVisible(false)}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Compartilhar homenagem"
                    >
                        <div
                            className="bg-white rounded-t-[2rem] sm:rounded-[2rem] w-full sm:max-w-sm max-h-[92vh] overflow-y-auto px-6 pt-6 pb-8 relative shadow-2xl animate-in slide-in-from-bottom duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setQrVisible(false)}
                                aria-label="Fechar"
                            >
                                <X size={18} />
                            </button>

                            <div className="text-center px-6">
                                <h3 className="text-lg font-bold text-tema-titulo leading-tight">
                                    {person?.falecido ? "Compartilhar homenagem" : "Compartilhe uma recordação"}
                                </h3>
                                <p className="text-sm text-tema-suave mt-1 leading-snug">
                                    Quem escanear o QR Code poderá deixar uma mensagem para {person?.nome}.
                                </p>
                            </div>

                            <div className="mx-auto my-5 w-fit bg-white p-4 rounded-3xl border border-tema-borda-forte shadow-sm">
                                {qrLink && <QRCodeCanvas ref={qrCanvasRef} value={qrLink} size={168} level="H" marginSize={1} />}
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={shareWhatsApp}
                                    className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3.5 rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95"
                                >
                                    <Share2 size={18} />
                                    Enviar pelo WhatsApp
                                </button>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={copiarLink}
                                        className="flex items-center justify-center gap-2 bg-tema-claro-2 text-tema-titulo font-bold py-3 rounded-2xl hover:bg-tema-claro transition-all active:scale-95"
                                    >
                                        {linkCopiado ? <Check size={18} /> : <Link2 size={18} />}
                                        {linkCopiado ? "Copiado!" : "Copiar link"}
                                    </button>
                                    <button
                                        onClick={baixarQrCode}
                                        className="flex items-center justify-center gap-2 bg-tema-claro-2 text-tema-titulo font-bold py-3 rounded-2xl hover:bg-tema-claro transition-all active:scale-95"
                                    >
                                        <Download size={18} />
                                        Baixar QR
                                    </button>
                                </div>
                                <button
                                    onClick={downloadPDF}
                                    disabled={generatingPDF}
                                    className="flex items-center justify-center gap-2 border-2 border-tema-primaria text-tema-titulo font-bold py-3.5 rounded-2xl hover:bg-tema-claro-2 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {generatingPDF ? <Sparkles className="animate-spin" size={18} /> : <Printer size={18} />}
                                    {generatingPDF ? "Gerando PDF..." : person?.falecido ? "PDF da nota para impressão" : "PDF para impressão"}
                                </button>
                            </div>

                            {person?.falecido && (
                                <div className="mt-5 pt-4 border-t border-tema-borda flex items-center justify-between gap-3 text-sm">
                                    <span className="text-tema-suave">
                                        {nota?.cerimonias.length ? "Velório e homenagens incluídos" : "Velório ainda não informado"}
                                    </span>
                                    <button
                                        onClick={() => navigate(`/legado-app/nota/editar/${dependenteId}`)}
                                        className="font-bold text-tema-destaque shrink-0"
                                    >
                                        Editar nota
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Template oculto para o PDF */}
                <div style={{ position: "fixed", left: "-2000px", top: "0", opacity: 0, pointerEvents: "none" }}>
                    <MemorialPdfTemplate ref={pdfRef} person={person} nota={nota} qrLink={qrLink} />
                </div>

                {/* Alerta */}
                {alerta && (
                    <div
                        className="fixed top-4 md:top-20 left-1/2 -translate-x-1/2 bg-[#dc3545] text-white py-2 px-6 rounded-lg shadow-xl z-50 font-bold flex items-center gap-4"
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

            {!embedded && <LegadoNav />}
        </div>
    );
}