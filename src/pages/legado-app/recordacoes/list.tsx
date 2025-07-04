// src/pages/legado-app/recordacoes/list.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    ArrowLeft,
    Filter,
    QrCode,
    Trash2,
    User,
    PlusCircle,
    HeartHandshake,
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
        const { error } = await supabase
            .from("recordacoes")
            .delete()
            .eq("id", recordacaoId);
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

    const qrLink = `https://legadoeconforto.com.br/recordacoes-publicas/${dependenteId}`;

    function filtroLabel() {
        return filtro === "todos"
            ? "Exibindo: Todos"
            : filtro === "7dias"
                ? "Últimos 7 dias"
                : "Últimos 30 dias";
    }

    // ----------- AQUI COMEÇA O JSX MODERNO ----------- //
    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-2">
            <div className="legado-form-card w-full max-w-md relative">

                {/* Header */}
                <div className="flex items-center gap-2 mb-2 mt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="text-[#5BA58C] hover:bg-[#def0e8] rounded-full p-2 transition"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className="text-lg sm:text-xl font-bold text-[#255f4f] text-center flex-1">
                        Recordações de {dependenteNome ?? ""}
                    </h2>
                </div>

                {/* Filtro */}
                <button
                    className="flex items-center justify-center gap-2 bg-[#eafcf9] border border-[#5BA58C] rounded-full py-2 px-4 font-semibold text-[#007080] mx-auto mb-3"
                    style={{ minWidth: 170 }}
                    onClick={() =>
                        setFiltro((prev) =>
                            prev === "todos" ? "7dias" : prev === "7dias" ? "30dias" : "todos"
                        )
                    }
                >
                    <Filter size={18} />
                    {filtroLabel()}
                </button>

                {/* Lista */}
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "calc(60vh - 90px)", paddingBottom: 0 }}
                >
                    {loading ? (
                        <div className="text-center my-10 text-[#007080]">Carregando...</div>
                    ) : recordacoes.length === 0 ? (
                        <div className="text-center my-10 text-[#555]">
                            Nenhuma recordação encontrada.
                        </div>
                    ) : (
                        recordacoes.map((item) => (
                            <div key={item.id} className="legado-recordacao-card">
                                <div className="top-row">
                                    <span className="autor flex items-center gap-2">
                                        <User size={22} className="text-[#255f4f]" />
                                        {item.mensagem?.split("\n\n– ")?.[1] || "Anônimo"}
                                    </span>
                                    <button className="delete-btn" onClick={() => excluirRecordacao(item.id)}>
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="msg">{item.mensagem?.split("\n\n– ")?.[0].trim()}</div>
                                {item.imagem_url && (
                                    <div className="mb-2 flex justify-center">
                                        <img
                                            src={item.imagem_url}
                                            alt="Imagem recordação"
                                            className="rounded-lg max-h-48 cursor-pointer"
                                            onClick={() => setImagemExpandida(item.imagem_url!)}
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                )}
                                <div className="date">Enviado em: {formatarData(item.created_at)}</div>
                            </div>
                        ))
                    )}
                </div>

                <div className="pt-2 pb-4 flex flex-col items-center gap-2 w-full">
                    <button
                        className="bg-[#FFADB2] px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 mb-1"
                        style={{ fontSize: 16, width: "80%" }}
                        onClick={() => navigate("/legado-app/parcerias/acalme-coracao")}
                    >
                        <HeartHandshake className="text-[#b22222]" size={18} />
                        Acalme seu coração
                    </button>
                    <div className="flex gap-2 w-full justify-center">
                        <button
                            className="bg-[#D1F2EB] flex items-center gap-2 px-4 py-2 rounded-xl text-[#007080] font-bold shadow"
                            style={{ fontSize: 15, width: "40%" }}
                            onClick={() => setQrVisible(true)}
                        >
                            <QrCode size={18} />
                            QR Code
                        </button>
                        <button
                            className="bg-[#5BA58C] flex items-center gap-2 px-4 py-2 rounded-xl text-white font-bold shadow"
                            style={{ fontSize: 15, width: "40%" }}
                            onClick={() => navigate(`/legado-app/recordacoes/nova/${dependenteId}`)}
                        >
                            <PlusCircle size={18} />
                            Adicionar
                        </button>
                    </div>
                </div>
                {/* Preview imagem expandida */}
                {imagemExpandida && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        onClick={() => setImagemExpandida(null)}
                    >
                        <img
                            src={imagemExpandida}
                            alt="Preview"
                            className="max-h-[80vh] max-w-[90vw] rounded-2xl border-4 border-white"
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                )}

                {/* Modal QR Code */}
                {qrVisible && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                        onClick={() => setQrVisible(false)}
                    >
                        <div
                            className="bg-white rounded-xl p-8 flex flex-col items-center relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-lg font-bold text-[#007080] mb-3">
                                Compartilhe uma recordação 💙
                            </div>
                            <QRCode value={qrLink} style={{ width: 180, height: 180 }} />
                            <a
                                href={qrLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-[#007080] underline mt-4"
                            >
                                {qrLink}
                            </a>
                            <button
                                className="absolute top-2 right-2 text-lg text-[#007080] bg-none border-none"
                                style={{ background: "none", border: "none", cursor: "pointer" }}
                                onClick={() => setQrVisible(false)}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* Alerta */}
                {alerta && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#dc3545] text-white py-2 px-6 rounded-lg shadow-xl z-50 font-bold">
                        {alerta}
                        <button
                            style={{
                                marginLeft: 8,
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                            onClick={() => setAlerta(null)}
                        >
                            x
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
