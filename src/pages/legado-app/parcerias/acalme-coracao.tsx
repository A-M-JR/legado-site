import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import "@/styles/legado-app.css";

// Psicólogas cadastradas
const PSICOLOGAS = [
    {
        nome: "Dra. Deise Rosa",
        fone: "45 99978-5006",
        wa: "5545999785006",
        video: "https://www.youtube.com/embed/2OjFgFg9MBU",
        especialidade: "Psicóloga especializada no atendimento ao Luto.",
        link_curso: "", // Quando tiver o link, só preencher aqui!
    },
    {
        nome: "Mariana Gabriele Ribeiro",
        fone: "45 99976-1826",
        wa: "554599761826",
        video: "https://www.youtube.com/embed/somevideoid", // Coloque o link correto depois
        especialidade: "Psicóloga especializada no atendimento ao Luto.",
        link_curso: "", // Futuro link do curso
    },
];

export default function AcolhimentoPage() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState<number | null>(null);

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-2">
            <div className="legado-form-card w-full max-w-md relative pt-2 pb-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 mt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="legado-icon-button"
                        aria-label="Voltar"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-xl font-bold text-[#255f4f] text-center flex-1">
                        Acolhimento
                    </h2>
                </div>

                {/* Mensagem */}
                <h1 className="text-2xl font-bold text-[#007080] text-center mb-2">
                    Você não está sozinho 💙
                </h1>
                <div className="text-base text-[#2d2d2d] text-center mb-6 font-medium" style={{ lineHeight: 1.6 }}>
                    A saudade é a prova do amor que jamais se apaga.<br />
                    Permita-se sentir, honrar as memórias e, aos poucos, encontrar leveza no coração.
                </div>

                {/* Cards das psicólogas */}
                <div className="space-y-4">
                    {PSICOLOGAS.map((psic, idx) => (
                        <div
                            key={psic.nome}
                            className={`bg-[#f8fffe] rounded-xl shadow-md p-4 transition-all ${expanded === idx ? "ring-2 ring-[#5ba58c]" : ""}`}
                            style={{ cursor: "pointer" }}
                        >
                            <div
                                className="flex items-center gap-2 justify-between"
                                onClick={() => setExpanded(expanded === idx ? null : idx)}
                            >
                                <div className="flex items-center gap-2">
                                    <HeartHandshake className="text-[#5ba58c]" size={22} />
                                    <span className="font-bold text-lg text-[#5ba58c]">{psic.nome}</span>
                                </div>
                                {expanded === idx ? <ChevronUp /> : <ChevronDown />}
                            </div>
                            {/* Detalhes ao expandir */}
                            {expanded === idx && (
                                <div className="mt-3 animate-fade-in">
                                    <div className="mb-2 text-[#255f4f] text-sm font-semibold">
                                        {psic.especialidade}
                                    </div>
                                    <a
                                        href={`https://wa.me/${psic.wa}?text=Olá, vim pelo aplicativo do Legado e Conforto e gostaria de saber mais sobre seu trabalho.`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-[#d1f2eb] hover:bg-[#b8ebe0] px-3 py-2 rounded-xl font-semibold text-[#007080] text-sm no-underline transition mb-2"
                                    >
                                        <MessageCircle size={18} className="text-[#5ba58c]" />
                                        {psic.nome} — ({psic.fone})
                                    </a>
                                    {psic.video && (
                                        <div className="rounded-xl overflow-hidden mt-2">
                                            <iframe
                                                width="100%"
                                                height="215"
                                                src={psic.video}
                                                title={`Vídeo de acolhimento de ${psic.nome}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                allowFullScreen
                                                className="rounded-xl shadow-md"
                                            ></iframe>
                                        </div>
                                    )}

                                    {/* Painel de vendas do curso */}
                                    <div className="mt-3">
                                        <span className="block text-[#337b68] font-medium mb-1">Cursos e Conteúdos Exclusivos:</span>
                                        {psic.link_curso ? (
                                            <a
                                                href={psic.link_curso}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-4 py-2 bg-[#5ba58c] text-white rounded-lg font-bold shadow hover:bg-[#337b68] transition"
                                            >
                                                Ver Painel de Cursos
                                            </a>
                                        ) : (
                                            <span className="inline-block px-4 py-2 bg-[#e7f6f1] text-[#337b68] rounded-lg font-semibold opacity-70 cursor-not-allowed">
                                                Em breve! Painel de vendas disponível aqui.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
