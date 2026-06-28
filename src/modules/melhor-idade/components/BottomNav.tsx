import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    CalendarDays,
    Mail,
    Image,
    HeartHandshake,
    LayoutGrid,
    Activity,
    Pill,
    ClipboardList,
    type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
    { label: "Início", path: "/melhor-idade", icon: Home, end: true },
    { label: "Meu dia", path: "/melhor-idade/meu-dia", icon: CalendarDays },
    { label: "Mensagens", path: "/melhor-idade/mensagens", icon: Mail },
    { label: "Momentos", path: "/melhor-idade/momentos", icon: Image },
    { label: "Apoio", path: "/melhor-idade/apoio", icon: HeartHandshake },
];

const EXTRA_NAV_ITEMS: { label: string; path: string; icon: LucideIcon }[] = [
    { label: "Saúde e Bem-estar", path: "/melhor-idade/saude", icon: Activity },
    { label: "Receitas e Consultas", path: "/melhor-idade/receitas", icon: Pill },
    { label: "Hora do Cuidado", path: "/melhor-idade/agenda", icon: ClipboardList },
];

function isExtraPath(pathname: string) {
    return EXTRA_NAV_ITEMS.some(
        (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
    );
}

export function BottomNav() {
    const [maisOpen, setMaisOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const extrasActive = isExtraPath(location.pathname);

    return (
        <>
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#d1e5dc] px-0.5 py-1.5 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end}
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl flex-1 max-w-[72px] transition-colors",
                                isActive ? "text-[#5ba58c]" : "text-[#9db4aa]"
                            )
                        }
                    >
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-center leading-tight">
                            {item.label}
                        </span>
                    </NavLink>
                ))}

                <button
                    type="button"
                    onClick={() => setMaisOpen(true)}
                    className={clsx(
                        "flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-xl flex-1 max-w-[72px] transition-colors",
                        extrasActive || maisOpen ? "text-[#5ba58c]" : "text-[#9db4aa]"
                    )}
                    aria-label="Mais recursos"
                >
                    <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide">
                        Mais
                    </span>
                </button>
            </nav>

            <Sheet open={maisOpen} onOpenChange={setMaisOpen}>
                <SheetContent side="bottom" className="rounded-t-[28px] px-4 pb-8 pt-2">
                    <div className="w-10 h-1 bg-[#d1e5dc] rounded-full mx-auto mb-4" />
                    <SheetHeader className="text-left mb-4">
                        <SheetTitle className="text-[#255f4f]">Mais recursos</SheetTitle>
                    </SheetHeader>
                    <nav className="space-y-1">
                        {EXTRA_NAV_ITEMS.map((item) => {
                            const active = location.pathname === item.path;
                            return (
                                <button
                                    key={item.path}
                                    type="button"
                                    onClick={() => {
                                        navigate(item.path);
                                        setMaisOpen(false);
                                    }}
                                    className={clsx(
                                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium text-sm transition",
                                        active
                                            ? "bg-[#e3f1eb] text-[#255f4f]"
                                            : "text-[#6b8c7d] hover:bg-[#f4fbf8]"
                                    )}
                                >
                                    <item.icon className="h-5 w-5 shrink-0" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        </>
    );
}

export { NAV_ITEMS, EXTRA_NAV_ITEMS, isExtraPath };
