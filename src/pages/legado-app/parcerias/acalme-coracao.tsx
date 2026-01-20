// src/pages/legado-app/acolhimento/index.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft, MessageCircle, ChevronDown, ChevronUp, ExternalLink, Heart, NotebookPen, Sparkles, BookOpen } from "lucide-react";
import "@/styles/legado-app.css";

type Psicologa = {
    nome: string;
    fone: string;
    wa: string;
    instagram?: string;
    video?: string;
    video2?: string;
    video3?: string;
    especialidade?: string;
    link_curso?: string;
    avatar_url?: string;
};

const PSICOLOGAS: Psicologa[] = [
    {
        nome: "Dra. Deise Rosa",
        fone: "45 99978-5006",
        wa: "5545999785006",
        instagram: "https://www.instagram.com/deiserosa_psicoterapeuta/",

        video: "https://www.youtube.com/embed/2OjFgFg9MBU",
        video2: "https://www.youtube.com/embed/KPeOTmn1B5s",
        video3: "https://www.youtube.com/embed/QDej1haLSPo",
        especialidade: "Psicóloga especializada no atendimento ao Luto.",
        link_curso: "https://pay.kiwify.com.br/AGX2aYg",
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

    {
        nome: "Ressignificando Perdas",
        fone: "",
        wa: "",
        instagram: "",
        video: "https://www.youtube.com/embed/AwGS4qtkPX4",
        video2: "https://www.youtube.com/embed/hg1cvibTmz8",
        especialidade: "",
        link_curso: "https://ressignificandoperdas.com.br/",
    },
    {
        nome: "Cartas para o Céu",
        fone: "",
        wa: "",
        instagram: "",
        video: "https://www.youtube.com/embed/7bzYip7puk4",
        video2: "",
        especialidade: "",
        link_curso: "https://essencialmaeditora.com.br/p1/",
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
                    <h2 className="text-xl font-extrabold text-[#255f4f]">Acolhimento</h2>
                    <div style={{ width: 36 }} />
                </div>

                {/* Microcopy - Melhorado para leitura sênior */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-[#007080] mb-2">Você não está sozinho 💙</h1>
                    <p className="text-base text-[#2d2d2d] font-medium leading-relaxed">
                        A saudade é a prova do amor que permanece. Sinta, honre e cuide do seu coração no seu tempo.
                    </p>
                </div>

                {/* Cards */}
                <div className="space-y-4">
                    {PSICOLOGAS.map((psic, idx) => {
                        const isOpen = expanded === idx;
                        return (
                            <div
                                key={psic.nome}
                                className={`rounded-2xl border shadow-md p-5 transition-all bg-white ${isOpen ? "ring-4 ring-[#5ba58c] shadow-lg" : "border-[#e6f2ee]"}`}
                            >
                                <button
                                    className="w-full flex items-center justify-between"
                                    onClick={() => toggle(idx)}
                                    aria-expanded={isOpen}
                                    aria-controls={`section-${idx}`}
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-full bg-[#e9f8f4] flex items-center justify-center flex-shrink-0">
                                            <HeartHandshake className="text-[#5ba58c]" size={20} />
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-lg text-[#255f4f]">{psic.nome}</div>
                                            {psic.especialidade && <div className="text-sm text-[#337b68] mt-0.5">{psic.especialidade}</div>}
                                        </div>
                                    </div>
                                    {isOpen ? <ChevronUp size={20} className="flex-shrink-0" /> : <ChevronDown size={20} className="flex-shrink-0" />}
                                </button>

                                {isOpen && (
                                    <div id={`section-${idx}`} className="mt-4 pt-2 border-t border-[#e6f2ee] animate-fade-in">
                                        <div className="flex flex-col gap-3">
                                            <a
                                                href={waLink(psic.wa)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 bg-[#c4e4df] hover:bg-[#b8ebe0] px-3 py-3 rounded-xl font-bold text-[#007080] text-base no-underline transition shadow-sm" // Botão WhatsApp mais proeminente
                                            >
                                                <MessageCircle size={20} className="text-[#007080]" />
                                                Falar com {psic.nome} — ({psic.fone || "Contato indisponível"})
                                            </a>

                                            {psic.instagram && (
                                                <a
                                                    href={psic.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 bg-[#fbe8ff] hover:bg-[#f6d6fa] px-3 py-3 rounded-xl font-semibold text-[#9b4d96] text-base no-underline transition shadow-sm" // Botão Instagram maior
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" className="text-[#9b4d96]" fill="currentColor" aria-hidden="true">
                                                        <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zM12 7a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zm5.25-.75a1 1 0 1 1 0 2a1 1 0 0 1 0-2z" />
                                                    </svg>
                                                    Instagram
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                        </div>

                                        {(psic.video || psic.video2 || psic.video3) && (
                                            <div className="mt-4 space-y-3">
                                                <span className="block text-[#255f4f] font-extrabold mb-1">▶️ Vídeos e Conteúdos</span>
                                                {psic.video && (
                                                    <div className="rounded-xl overflow-hidden shadow-md">
                                                        <iframe
                                                            width="100%"
                                                            height="225"
                                                            src={psic.video}
                                                            title={`Vídeo de acolhimento de ${psic.nome} - 1`}
                                                            frameBorder={0}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                                {psic.video2 && (
                                                    <div className="rounded-xl overflow-hidden shadow-md">
                                                        <iframe
                                                            width="100%"
                                                            height="225"
                                                            src={psic.video2}
                                                            title={`Vídeo de acolhimento de ${psic.nome} - 2`}
                                                            frameBorder={0}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                )}

                                                {psic.video3 && (
                                                    <div className="rounded-xl overflow-hidden shadow-md">
                                                        <iframe
                                                            width="100%"
                                                            height="225"
                                                            src={psic.video3}
                                                            title={`Vídeo de acolhimento de ${psic.nome} - 3`}
                                                            frameBorder={0}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                                            allowFullScreen
                                                            className="rounded-xl"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-3 border-t border-[#e6f2ee]">
                                            <span className="block text-[#255f4f] font-extrabold mb-2">📚 Cursos e Conteúdos Exclusivos</span>
                                            {psic.link_curso ? (
                                                <a
                                                    href={psic.link_curso}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 px-5 py-3 bg-[#5ba58c] text-white rounded-xl font-extrabold text-base shadow-lg hover:bg-[#337b68] transition" // Botão maior e mais chamativo
                                                >
                                                    Acessar Conteúdo <BookOpen size={18} />
                                                </a>
                                            ) : (
                                                <span className="inline-block px-4 py-3 bg-[#e7f6f1] text-[#337b68] rounded-lg font-semibold text-sm opacity-90">
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
                className="fixed bottom-3 left-0 right-0 mx-auto max-w-md bg-white/90 backdrop-blur border rounded-xl shadow-xl px-3 py-2 flex items-center justify-around"
                style={{ zIndex: 40 }}
            >
                <button className="text-[#255f4f] flex flex-col items-center text-xs font-semibold" onClick={() => navigate("/legado-app/menu")}>
                    <Heart size={20} /> Menu
                </button>
                <button className="text-[#6c63ff] flex flex-col items-center text-xs font-semibold" onClick={() => navigate("/legado-app/diario")}>
                    <NotebookPen size={20} /> Diário
                </button>
                <button className="text-[#ff9a56] flex flex-col items-center text-xs font-semibold" onClick={() => navigate("/legado-app/exercicios")}>
                    <Sparkles size={20} /> Exercícios
                </button>
            </nav>
        </div>
    );
}