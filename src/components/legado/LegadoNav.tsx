import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart, History, Loader2, LogOut, NotebookPen, Sparkles, type LucideIcon } from "lucide-react";
import clsx from "clsx";
import { supabase } from "@/lib/supabaseClient";
import logoVerde from "@/assets/Legado - Verde.png";

// Navegação única do app Legado.
// Celular (< md): barra fixa embaixo, respeitando a área segura do iPhone.
// Tablet/desktop (≥ md): barra fixa no topo com o logo.
// As páginas reservam o espaço com a classe utilitária LEGADO_NAV_ESPACO.

export const LEGADO_NAV_ESPACO = "pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-12 md:pt-20";

type Item = { label: string; to: string; icon: LucideIcon; cor: string; ativo: (path: string) => boolean };

const ITENS: Item[] = [
    {
        label: "Menu",
        to: "/legado-app/menu",
        icon: Heart,
        cor: "text-tema-titulo",
        ativo: (p) => p.startsWith("/legado-app/menu") || p.startsWith("/legado-app/recordacoes") || p.startsWith("/legado-app/nota") || p.includes("/titulares/") || p.includes("/dependentes/"),
    },
    { label: "Diário", to: "/legado-app/diario", icon: NotebookPen, cor: "text-[#6c63ff]", ativo: (p) => p.startsWith("/legado-app/diario") },
    {
        label: "Exercícios",
        to: "/legado-app/exercicios",
        icon: Sparkles,
        cor: "text-[#ff9a56]",
        ativo: (p) => p.startsWith("/legado-app/exercicios") && !p.includes("historico"),
    },
    { label: "Histórico", to: "/legado-app/exercicios/historico", icon: History, cor: "text-[#2563eb]", ativo: (p) => p.includes("/exercicios/historico") },
];

export default function LegadoNav() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [saindo, setSaindo] = useState(false);

    async function sair() {
        setSaindo(true);
        await supabase.auth.signOut();
        navigate("/legado-app/login");
    }

    return (
        <nav
            aria-label="Navegação do Legado"
            className={clsx(
                "fixed z-50 bg-white/95 backdrop-blur-md border-tema-borda",
                // celular: barra flutuante inferior
                "bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-md rounded-2xl border shadow-2xl px-2 py-2",
                // tablet/desktop: barra superior de largura total
                "md:top-0 md:bottom-auto md:left-0 md:translate-x-0 md:w-full md:max-w-none md:rounded-none md:border-0 md:border-b md:shadow-sm md:px-6 md:py-0"
            )}
        >
            <div className="flex items-center justify-between md:max-w-5xl md:mx-auto md:h-16">
                <button
                    type="button"
                    onClick={() => navigate("/legado-app/menu")}
                    className="hidden md:block shrink-0"
                    aria-label="Início do Legado"
                >
                    <img src={logoVerde} alt="Legado" className="h-9" />
                </button>

                <div className="flex flex-1 items-center justify-around md:flex-none md:justify-end md:gap-1">
                    {ITENS.map(({ label, to, icon: Icon, cor, ativo }) => {
                        const atual = ativo(pathname);
                        return (
                            <button
                                key={to}
                                type="button"
                                onClick={() => navigate(to)}
                                aria-current={atual ? "page" : undefined}
                                className={clsx(
                                    "group flex flex-col md:flex-row items-center gap-0.5 md:gap-2 rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 transition",
                                    cor,
                                    atual ? "bg-tema-claro md:bg-tema-claro" : "hover:bg-tema-claro-2"
                                )}
                            >
                                <Icon size={20} className="group-active:scale-125 transition-transform" />
                                <span className="text-[10px] md:text-sm font-bold uppercase md:normal-case tracking-tighter md:tracking-normal">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                    <button
                        type="button"
                        onClick={sair}
                        className="group flex flex-col md:flex-row items-center gap-0.5 md:gap-2 rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 text-red-500 hover:bg-red-50 transition"
                    >
                        {saindo ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                        <span className="text-[10px] md:text-sm font-bold uppercase md:normal-case tracking-tighter md:tracking-normal">Sair</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
