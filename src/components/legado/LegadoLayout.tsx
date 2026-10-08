import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart } from "lucide-react";
import LegadoNav, { LEGADO_NAV_ESPACO } from "@/components/legado/LegadoNav";
import { Divisor } from "@/components/recordacoes/Ornamentos";
import { temaMemorial } from "@/lib/legadoTema";

// Larguras do conteúdo: coluna no celular, mais largo em telas maiores.
const LARGURAS = {
    estreita: "max-w-md",
    media: "max-w-md md:max-w-2xl",
    larga: "max-w-md md:max-w-3xl lg:max-w-5xl",
} as const;

type Props = {
    title?: string;
    subtitle?: ReactNode;
    children: ReactNode;
    showBack?: boolean;
    className?: string;
    backPath?: string;
    embedded?: boolean;
    largura?: keyof typeof LARGURAS;
};

export default function LegadoLayout({ title, subtitle, children, showBack = true, className = "", backPath, embedded = false, largura = "media" }: Props) {
    const navigate = useNavigate();

    if (embedded) {
        return (
            <div className={`w-full space-y-4 ${className}`}>
                {title && (
                    <div className="space-y-1">
                        <h2 className="text-xl sm:text-2xl font-bold text-tema-titulo tracking-tight">{title}</h2>
                        {subtitle && <p className="text-sm text-tema-suave">{subtitle}</p>}
                    </div>
                )}
                {children}
            </div>
        );
    }

    return (
        <div className={`legado-app-wrapper min-h-screen flex flex-col px-4 pt-4 bg-gradient-to-b from-tema-fundo-topo to-tema-fundo-base ${LEGADO_NAV_ESPACO} ${className}`}>
            <div className={`w-full ${LARGURAS[largura]} mx-auto flex-1 flex flex-col`}>
                {/* Top bar */}
                <div className="flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top duration-500">
                    {showBack ? (
                        <button
                            onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                            className="flex items-center gap-1.5 text-tema-titulo font-bold text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                            aria-label="Voltar"
                        >
                            <ChevronLeft size={18} />
                            Voltar
                        </button>
                    ) : (
                        <span />
                    )}
                    <Heart size={20} className="text-tema-titulo opacity-20" aria-hidden />
                </div>

                {/* Título */}
                {title && (
                    <div className="text-center space-y-1 mb-6 animate-in fade-in duration-700">
                        <div className="flex items-center justify-center gap-2 text-tema-titulo">
                            <Heart size={22} fill="currentColor" className="opacity-20 shrink-0" />
                            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
                        </div>
                        {subtitle && <p className="text-base text-tema-texto opacity-80">{subtitle}</p>}
                        {temaMemorial && (
                            <div className="pt-3">
                                <Divisor />
                            </div>
                        )}
                    </div>
                )}

                <div className="w-full">{children}</div>
            </div>

            <LegadoNav />
        </div>
    );
}
