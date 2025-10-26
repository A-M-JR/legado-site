// src/pages/legado-app/acolhimento/index.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Heart, NotebookPen, Sparkles } from "lucide-react";
import "@/styles/legado-app.css";

type Psicologa = {
    nome: string;
    fone: string;
    wa: string; // número no formato internacional sem sinais
    instagram?: string;
    video?: string;
    video2?: string;
    especialidade?: string;
    link_curso?: string;
    avatar_url?: string; // opcional para futuras fotos
};

const PSICOLOGAS: Psicologa[] = [
    {
        nome: "Dra. Deise Rosa",
        fone: "45 99978-5006",
        wa: "5545999785006",
        instagram: "https://www.instagram.com/deiserosa_psicoterapeuta/",
        video: "https://www.youtube.com/embed/2OjFgFg9MBU",
        video2: "",
        especialidade: "Psicóloga especializada no atendimento ao Luto.",
        link_curso: "",
    },
    {
        nome: "Rose Pasa",
        fone: "61 98241-8183",
        wa: "5561982418183",
        instagram: "https://www.instagram.com/psicologa.rosepasa/",
        video: "https://www.youtube.com/embed/txrJuDN3bcY",
        video2: "https://www.youtube.com/embed/PISTGuunCBg",
        especialidade: "Psicóloga especializada no atendimento ao Luto.",
        link_curso: "",
    },
];

export default function AcolhimentoPage() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState<number | null>(null);

    function toggle(idx: number) {
        setExpanded((prev) => (prev === idx ? null : idx));
    }

    function waLink(wa: string) {
        const texto = "Olá, vim pelo aplicativo do Legado e Conforto e gostaria de saber mais sobre seu trabalho.";
        return `https://wa.me/${wa}?text=${encodeURIComponent(texto)}`;
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="legado-form-card w-full max-w-md relative pt-2 pb-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 mt-2">
                    <button type="button" onClick={() => navigate(-1)} className="legado-icon-button" aria-label="Voltar">
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-[#255f4f]">Acolhimento</h2>
                    <div style={{ width: 36 }} />
                </div>

                {/* Microcopy */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold text-[#007080] mb-1">Você não está sozinho 💙</h1>
                    <p className="text-sm text-[#2d2d2d] font-medium" style={{ lineHeight: 1.6 }}>
                        A saudade é a prova do amor que permanece. Sinta, honre e cuide do seu coração no seu tempo.
                    </p>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                    {PSICOLOGAS.map((psic, idx) => {
                        const isOpen = expanded === idx;
                        return (
                            <div
                                key={psic.nome}
                                className={`rounded-2xl border shadow-sm p-4 transition-all bg-white ${isOpen ? "ring-2 ring-[#5ba58c]" : "border-[#e6f2ee]"}`}
                            >
                                {/* Cabeçalho do card (clicável) */}
                                <button
                                    className="w-full flex items-center justify-between"
                                    onClick={() => toggle(idx)}
                                    aria-expanded={isOpen}
                                    aria-controls={`section-${idx}`}
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-9 h-9 rounded-full bg-[#e9f8f4] flex items-center justify-center">
                                            <HeartHandshake className="text-[#5ba58c]" size={18} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-base text-[#255f4f]">{psic.nome}</div>
                                            {psic.especialidade && <div className="text-xs text-[#4b8373]">{psic.especialidade}</div>}
                                        </div>
                                    </div>
                                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>

                                {/* Conteúdo expandido */}
                                {isOpen && (
                                    <div id={`section-${idx}`} className="mt-3 animate-fade-in">
                                        {/* Ações principais */}
                                        <div className="flex flex-col gap-2">
                                            <a
                                                href={waLink(psic.wa)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-[#d1f2eb] hover:bg-[#b8ebe0] px-3 py-2 rounded-xl font-semibold text-[#007080] text-sm no-underline transition"
                                            >
                                                <MessageCircle size={18} className="text-[#007080]" />
                                                Falar com {psic.nome} — ({psic.fone})
                                            </a>

                                            {psic.instagram && (
                                                <a
                                                    href={psic.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 bg-[#fbe8ff] hover:bg-[#f6d6fa] px-3 py-2 rounded-xl font-semibold text-[#9b4d96] text-sm no-underline transition"
                                                >
                                                    {/* Ícone simples do Instagram em SVG */}
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="text-[#9b4d96]" fill="currentColor" aria-hidden="true">
                                                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zm5.25-.75a1 1 0 1 1 0 2a1 1 0 0 1 0-2z" />
                                                    </svg>
                                                    Instagram
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>

                                        {/* Vídeos */}
                                        {(psic.video || psic.video2) && (
                                            <div className="mt-3 space-y-2">
                                                {psic.video && (
                                                    <div className="rounded-xl overflow-hidden">
                                                        <iframe
                                                            width="100%"
                                                            height="215"
                                                            src={psic.video}
                                                            title={`Vídeo de acolhimento de ${psic.nome} - 1`}
                                                            frameBorder={0}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            className="rounded-xl shadow-sm"
                                                        />
                                                    </div>
                                                )}
                                                {psic.video2 && (
                                                    <div className="rounded-xl overflow-hidden">
                                                        <iframe
                                                            width="100%"
                                                            height="215"
                                                            src={psic.video2}
                                                            title={`Vídeo de acolhimento de ${psic.nome} - 2`}
                                                            frameBorder={0}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            className="rounded-xl shadow-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Painel de cursos */}
                                        <div className="mt-3">
                                            <span className="block text-[#337b68] font-medium mb-1">Cursos e conteúdos exclusivos</span>
                                            {psic.link_curso ? (
                                                <a
                                                    href={psic.link_curso}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#5ba58c] text-white rounded-lg font-bold shadow hover:bg-[#337b68] transition"
                                                >
                                                    Ver Painel de Cursos <ExternalLink size={16} />
                                                </a>
                                            ) : (
                                                <span className="inline-block px-4 py-2 bg-[#e7f6f1] text-[#337b68] rounded-lg font-semibold opacity-80">
                                                    Em breve! Painel de vendas disponível aqui.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

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