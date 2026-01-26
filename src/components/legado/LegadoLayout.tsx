import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Heart, NotebookPen, Sparkles } from "lucide-react";

type Props = {
    title?: string;
    subtitle?: ReactNode;
    children: ReactNode;
    showBack?: boolean;
    className?: string;
    backPath?: string;
};

export default function LegadoLayout({ title, subtitle, children, showBack = true, className = "", backPath }: Props) {
    const navigate = useNavigate();

    return (
        <div className={`legado-app-wrapper min-h-screen flex flex-col pb-24 px-4 bg-gradient-to-b from-[#e6f4f1] to-white ${className}`}>
            {/* Top Bar */}
            <div className="pt-6 sm:pt-4 md:pt-3">
                <div className="w-full max-w-md mx-auto mb-2 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                    {showBack ? (
                        <button
                            onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                            className="flex items-center gap-1.5 text-[#255f4f] font-bold text-sm bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                            aria-label="Voltar"
                        >
                            <ChevronLeft size={18} />
                            Voltar
                        </button>
                    ) : (
                        <div style={{ width: 96 }} />
                    )}

                    <div className="opacity-20">
                        <Heart size={20} className="text-[#255f4f]" />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center py-6 space-y-6 overflow-hidden">
                {/* Title area */}
                {title && (
                    <div className="text-center space-y-1 animate-in fade-in duration-700">
                        <div className="flex items-center justify-center gap-2 text-[#255f4f]">
                            <Heart size={22} fill="#255f4f" className="opacity-20" />
                            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                        </div>
                        {subtitle && <p className="text-base text-[#4f665a] opacity-80">{subtitle}</p>}
                    </div>
                )}

                {/* Centered card area */}
                <div className="w-full ">
                    {children}
                </div>

                {/* Spacer to keep center when content small */}
            </div>

            {/* Bottom navbar (altura reduzida) */}
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 backdrop-blur-md border border-[#d8e8e0] rounded-xl shadow-lg px-4 py-2 flex items-center justify-between z-50 animate-in slide-in-from-bottom duration-500">
                <button onClick={() => navigate("/legado-app/menu")} className="flex flex-col items-center gap-0.5 text-[#255f4f] group">
                    <Heart size={18} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
                </button>

                <button onClick={() => navigate("/legado-app/diario")} className="flex flex-col items-center gap-0.5 text-[#6c63ff] group">
                    <NotebookPen size={18} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Diário</span>
                </button>

                <button onClick={() => navigate("/legado-app/exercicios")} className="flex flex-col items-center gap-0.5 text-[#ff9a56] group">
                    <Sparkles size={18} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Exercícios</span>
                </button>
            </nav>
        </div>
    );
}