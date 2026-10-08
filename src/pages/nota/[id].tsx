import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CalendarPlus, Flower2, Loader2, MessageCircleHeart, Navigation, Share2, User } from "lucide-react";
import logoVerde from "@/assets/Legado - Verde.png";
import { COR, Coroa, Divisor, Raminho } from "@/components/recordacoes/Ornamentos";
import {
    FRASES_SUGERIDAS,
    buscarHomenageado,
    buscarNota,
    dataBR,
    linkAgenda,
    linkCompartilhamento,
    linkCoroaFlores,
    linkMaps,
    mensagemWhatsApp,
    type Homenageado,
    type NotaFalecimento,
} from "@/lib/notaFalecimento";

// Mesmo visual do PDF do memorial (MemorialPdfTemplate): fundo creme, moldura,
// coroa de folhas na foto, divisor e cartões das cerimônias.

const FOTO = 168;
const COROA = FOTO + 64;

export default function NotaFalecimentoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pessoa, setPessoa] = useState<Homenageado | null>(null);
    const [nota, setNota] = useState<NotaFalecimento | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        if (!id) return;
        (async () => {
            setCarregando(true);
            const cleanId = id.trim();
            const [p, n] = await Promise.all([buscarHomenageado(cleanId), buscarNota(cleanId)]);
            setPessoa(p);
            setNota(n);
            setCarregando(false);
        })();
    }, [id]);

    useEffect(() => {
        if (pessoa) document.title = `Nota de Falecimento - ${pessoa.nome}`;
    }, [pessoa]);

    async function compartilhar() {
        if (!pessoa) return;
        const url = linkCompartilhamento(pessoa.id, pessoa.nome);
        if (navigator.share) {
            // Share nativo (celular). Se o usuário cancelar, não fazemos nada.
            await navigator.share({ title: `Nota de Falecimento - ${pessoa.nome}`, url }).catch(() => undefined);
            return;
        }
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemWhatsApp(pessoa))}`, "_blank");
    }

    if (carregando) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f1e8", color: COR.folhaEscura }}>
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!pessoa) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#f6f1e8" }}>
                <p className="font-serif font-semibold" style={{ color: COR.titulo }}>Homenagem não encontrada.</p>
            </div>
        );
    }

    if (!pessoa.falecido) return <Navigate to={`/recordacoes-publicas/${pessoa.id}`} replace />;

    const nascimento = dataBR(pessoa.data_nascimento);
    const falecimento = dataBR(pessoa.data_falecimento);
    const frase = nota?.frase || FRASES_SUGERIDAS[2];
    const cerimonias = nota?.cerimonias ?? [];
    const coroaLink = nota ? linkCoroaFlores(nota, pessoa.nome) : null;

    const pill =
        "inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 border bg-white transition hover:brightness-95";

    return (
        <div className="min-h-screen px-3 py-6 sm:px-4 sm:py-10" style={{ background: "#f6f1e8" }}>
            <article
                className="relative w-full max-w-2xl mx-auto overflow-hidden font-serif rounded-[28px] px-5 pt-6 pb-8 sm:px-10 sm:pt-8 shadow-[0_10px_40px_rgba(140,110,60,0.12)]"
                style={{ background: COR.fundo, border: `1.5px solid ${COR.moldura}`, color: COR.texto }}
            >
                <Raminho style={{ bottom: "6px", left: "2px", transform: "rotate(185deg) scaleX(-1)" }} />
                <Raminho style={{ bottom: "6px", right: "2px", transform: "rotate(185deg)" }} />

                {/* Cabeçalho */}
                <header className="flex items-start justify-between gap-4">
                    <img src={logoVerde} alt="Legado" className="h-9 sm:h-11" />
                    <p className="italic text-xs sm:text-sm text-right leading-snug max-w-[200px]" style={{ color: COR.suave }}>
                        Porque toda vida merece ser lembrada com carinho!
                    </p>
                </header>

                {/* Foto com coroa */}
                <div className="relative mx-auto mt-6" style={{ width: COROA, height: COROA }}>
                    <Coroa size={COROA} />
                    <div
                        className="absolute rounded-full overflow-hidden"
                        style={{
                            top: (COROA - FOTO) / 2,
                            left: (COROA - FOTO) / 2,
                            width: FOTO,
                            height: FOTO,
                            border: "5px solid #ffffff",
                            boxShadow: "0 6px 18px rgba(47,107,92,0.18)",
                            background: "#eef3f1",
                        }}
                    >
                        {pessoa.imagem_url ? (
                            <img src={pessoa.imagem_url} alt={pessoa.nome} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ color: "#c2d3cc" }}>
                                <User className="h-14 w-14" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Nome, datas, frase */}
                <div className="text-center mt-3">
                    <h1 className="text-3xl sm:text-4xl font-bold leading-tight break-words" style={{ color: COR.titulo }}>
                        {pessoa.nome}
                    </h1>
                    {(nascimento || falecimento) && (
                        <p className="mt-2 flex justify-center gap-5 text-base" style={{ color: COR.suave }}>
                            {nascimento && <span aria-label={`Nascimento ${nascimento}`}>★ {nascimento}</span>}
                            {falecimento && <span aria-label={`Falecimento ${falecimento}`}>✝ {falecimento}</span>}
                        </p>
                    )}
                    <p className="mt-4 mx-auto max-w-md text-lg sm:text-xl italic leading-relaxed">“{frase}”</p>
                </div>

                <div className="my-6">
                    <Divisor />
                </div>

                {/* Cerimônias */}
                {cerimonias.length > 0 ? (
                    <section className={`grid gap-3.5 ${cerimonias.length > 1 ? "sm:grid-cols-2" : ""}`}>
                        {cerimonias.map((c, i) => {
                            const agenda = linkAgenda(c, pessoa.nome);
                            const data = dataBR(c.data);
                            return (
                                <div
                                    key={i}
                                    className="bg-white rounded-[18px] px-4 py-4 text-center flex flex-col"
                                    style={{ border: `1px solid ${COR.moldura}` }}
                                >
                                    <p className="text-xs font-bold uppercase tracking-[0.12em]" style={{ color: COR.dourado }}>
                                        {c.tipo}
                                    </p>
                                    <p className="mt-1 text-lg font-bold leading-snug" style={{ color: COR.titulo }}>{c.local}</p>
                                    {(data || c.hora) && (
                                        <p className="mt-1 text-[15px]">{[data, c.hora && `${c.hora}h`].filter(Boolean).join(" · ")}</p>
                                    )}
                                    {c.endereco && (
                                        <p className="mt-1 text-[13px] leading-snug" style={{ color: COR.suave }}>{c.endereco}</p>
                                    )}
                                    <div className="mt-auto pt-3 flex flex-wrap justify-center gap-2 font-sans">
                                        <a
                                            href={linkMaps(c)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={pill}
                                            style={{ borderColor: COR.moldura, color: COR.titulo }}
                                        >
                                            <Navigation className="h-3.5 w-3.5" /> Como chegar
                                        </a>
                                        {agenda && (
                                            <a
                                                href={agenda}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={pill}
                                                style={{ borderColor: COR.moldura, color: COR.titulo }}
                                            >
                                                <CalendarPlus className="h-3.5 w-3.5" /> Agenda
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ) : (
                    <p className="text-center text-sm italic" style={{ color: COR.suave }}>
                        As informações sobre a cerimônia serão divulgadas em breve.
                    </p>
                )}

                {/* Convite de conforto */}
                <section
                    className="mt-6 bg-white rounded-3xl px-5 py-6 sm:px-8 text-center"
                    style={{ border: `1px solid ${COR.moldura}`, boxShadow: "0 4px 14px rgba(201,169,110,0.12)" }}
                >
                    <h2 className="text-xl sm:text-2xl font-bold" style={{ color: COR.titulo }}>Deixe sua recordação 💙</h2>
                    <p className="mt-2 mx-auto max-w-md leading-relaxed">
                        Uma mensagem de carinho certamente levará conforto e alegria aos corações entristecidos da família.
                    </p>
                    <div className={`mt-5 grid gap-3 font-sans ${coroaLink ? "sm:grid-cols-2" : ""}`}>
                        <button
                            type="button"
                            onClick={() => navigate(`/recordacoes-publicas/${pessoa.id}`)}
                            className="flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-2xl shadow-md transition hover:brightness-110 active:scale-[0.99]"
                            style={{ background: COR.titulo }}
                        >
                            <MessageCircleHeart className="h-5 w-5" /> Enviar condolência
                        </button>
                        {coroaLink && (
                            <a
                                href={coroaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 bg-white font-bold py-3.5 rounded-2xl border-2 transition hover:brightness-95 active:scale-[0.99]"
                                style={{ borderColor: COR.titulo, color: COR.titulo }}
                            >
                                <Flower2 className="h-5 w-5" /> Enviar coroa de flores
                            </a>
                        )}
                    </div>
                </section>

                <p className="mt-6 text-center text-xs tracking-wide" style={{ color: COR.suave }}>
                    Instituto Legado e Conforto · legadoeconforto.com.br
                </p>
            </article>

            <button
                type="button"
                onClick={compartilhar}
                className="fixed bottom-5 right-5 w-14 h-14 rounded-full text-white shadow-xl flex items-center justify-center transition hover:brightness-110 active:scale-95"
                style={{ background: COR.titulo }}
                aria-label="Compartilhar nota de falecimento"
            >
                <Share2 className="h-6 w-6" />
            </button>
        </div>
    );
}
