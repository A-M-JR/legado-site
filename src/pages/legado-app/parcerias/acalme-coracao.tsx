import { useNavigate } from "react-router-dom";
import { HeartHandshake, ArrowLeft, MessageCircle } from "lucide-react";
import "@/styles/legado-app.css";

export default function AcolhimentoPage() {
    const navigate = useNavigate();

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-2">
            <div className="legado-form-card w-full max-w-md relative pt-2 pb-5">
                {/* Header padrão Legado */}
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

                {/* Mensagem de acolhimento */}
                <h1 className="text-2xl font-bold text-[#007080] text-center mb-2">
                    Você não está sozinho 💙
                </h1>
                <div className="text-base text-[#2d2d2d] text-center mb-6 font-medium" style={{ lineHeight: 1.6 }}>
                    A saudade é a prova do amor que jamais se apaga.<br />
                    Permita-se sentir, honrar as memórias e, aos poucos, encontrar leveza no coração.
                </div>

                {/* Vídeo embutido */}
                <div className="mb-6">
                    <iframe
                        width="100%"
                        height="215"
                        src="https://www.youtube.com/embed/2OjFgFg9MBU"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="rounded-xl shadow-md"
                    ></iframe>
                </div>

                {/* Card de contato */}
                <div className="bg-[#f8fffe] rounded-xl shadow-md p-5 mb-2">
                    <div className="flex items-center gap-2 mb-2 justify-center">
                        <HeartHandshake className="text-[#5ba58c]" size={24} />
                        <span className="font-bold text-lg text-[#5ba58c]">Precisa conversar?</span>
                    </div>
                    <div className="text-[#555] text-sm mb-4 text-center">
                        Nossas psicólogas estão disponíveis para ouvir você:
                    </div>

                    <a
                        href="https://wa.me/5545999785006?text=Ol%C3%A1%2C%20vim%20pelo%20aplicativo%20do%20Legado%20e%20Conforto%20e%20gostaria%20de%20saber%20mais%20sobre%20seu%20trabalho."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mb-2 bg-[#d1f2eb] hover:bg-[#b8ebe0] px-3 py-2 rounded-xl font-semibold text-[#007080] text-sm no-underline transition"
                        style={{ cursor: "pointer" }}
                    >
                        <MessageCircle size={18} className="text-[#5ba58c]" />
                        Dra. Deise Rosa — (45) 99978-5006
                    </a>
                </div>
            </div>
        </div>
    );
}
