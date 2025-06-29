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
                    Você não está sozinho <span role="img" aria-label="coração">💙</span>
                </h1>
                <div className="text-base text-[#2d2d2d] text-center mb-6 font-medium" style={{ lineHeight: 1.6 }}>
                    A saudade é a prova do amor que jamais se apaga.<br />
                    Permita-se sentir, honrar as memórias e, aos poucos, encontrar leveza no coração.
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
                        href="https://wa.me/5581999999999"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 mb-2 bg-[#d1f2eb] hover:bg-[#b8ebe0] px-3 py-2 rounded-xl font-semibold text-[#007080] text-sm no-underline transition"
                        style={{ cursor: "pointer" }}
                    >
                        <MessageCircle size={18} className="text-[#5ba58c]" />
                        Dra. Larissa Carvalho — (81) 99999-9999
                    </a>
                    <a
                        href="https://wa.me/5581988888888"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#d1f2eb] hover:bg-[#b8ebe0] px-3 py-2 rounded-xl font-semibold text-[#007080] text-sm no-underline transition"
                        style={{ cursor: "pointer" }}
                    >
                        <MessageCircle size={18} className="text-[#5ba58c]" />
                        Dra. Patrícia Lima — (81) 98888-8888
                    </a>
                </div>
            </div>
        </div>
    );
}
