import { useEffect, useState } from "react";
import { Outlet, useNavigate, NavLink, useOutletContext } from "react-router-dom";
import { HeartPulse, ArrowLeft, Menu, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from "@/components/ui/sheet";
import { MpBottomNav, MP_NAV_ITEMS } from "./MpBottomNav";
import { MpNotificacoesBell } from "./MpNotificacoesBell";
import { limparMpScope } from "../services/mpScope";

export default function MpLayout() {
    const navigate = useNavigate();
    const parentContext = useOutletContext<{
        userProfile?: { titular_id: string | null; role: string };
    }>();
    const [multiModulo, setMultiModulo] = useState(true);
    const [saindo, setSaindo] = useState(false);

    useEffect(() => {
        limparMpScope();
    }, []);

    useEffect(() => {
        async function checkModulos() {
            const titularId = parentContext?.userProfile?.titular_id;
            if (!titularId) {
                setMultiModulo(false);
                return;
            }
            const { count } = await supabase
                .from("titular_modulos")
                .select("*", { count: "exact", head: true })
                .eq("titular_id", titularId)
                .eq("habilitado", true);
            setMultiModulo((count ?? 0) > 1);
        }
        checkModulos();
    }, [parentContext?.userProfile?.titular_id]);

    async function sairConta() {
        setSaindo(true);
        limparMpScope();
        await supabase.auth.signOut();
        navigate("/legado-app/login", { replace: true });
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8fcfb]">
            <header className="h-16 bg-white border-b border-[#d1e5dc] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger className="p-2 rounded-xl hover:bg-[#f4fbf8] text-[#6b8c7d] md:hidden">
                            <Menu className="h-5 w-5" />
                        </SheetTrigger>
                        <SheetContent side="left" className="w-72">
                            <SheetHeader>
                                <SheetTitle className="text-[#255f4f]">
                                    Medicina Preventiva
                                </SheetTitle>
                                <SheetDescription className="sr-only">
                                    Menu de navegação do módulo Medicina Preventiva
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="mt-6 space-y-1">
                                {MP_NAV_ITEMS.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.end}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm ${
                                                isActive
                                                    ? "bg-[#e3f1eb] text-[#255f4f]"
                                                    : "text-[#6b8c7d] hover:bg-[#f4fbf8]"
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        {item.label}
                                    </NavLink>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-2">
                        <div className="bg-[#5ba58c] p-2 rounded-xl">
                            <HeartPulse className="text-white h-5 w-5" />
                        </div>
                        <span className="text-[#255f4f] font-bold text-lg hidden sm:inline">
                            Medicina Preventiva
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <MpNotificacoesBell />
                    {multiModulo ? (
                        <button
                            type="button"
                            onClick={() => navigate("/legado-app/selecao-modulos")}
                            className="flex items-center gap-1 text-sm font-bold text-[#5ba58c] hover:bg-[#f4fbf8] px-3 py-2 rounded-xl"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Módulos</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={sairConta}
                            disabled={saindo}
                            className="flex items-center gap-1 text-sm font-bold text-[#5ba58c] hover:bg-[#f4fbf8] px-3 py-2 rounded-xl disabled:opacity-50"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-[#d1e5dc] flex-col p-4 gap-1">
                    {MP_NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm transition-all ${
                                    isActive
                                        ? "bg-[#5ba58c] text-white shadow-md"
                                        : "text-[#4f665a] hover:bg-[#f4fbf8]"
                                }`
                            }
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </aside>

                <main className="flex-1 overflow-y-auto p-4 pb-28 md:pb-8">
                    <div className="max-w-2xl lg:max-w-3xl mx-auto w-full">
                        <Outlet context={parentContext} />
                    </div>
                </main>
            </div>

            <MpBottomNav />
        </div>
    );
}
