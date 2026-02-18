// src/admin-parceiro/ParceiroLayout.tsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarFooter,
} from "@/components/ui/sidebar";
import {
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    ShieldCheck,
    ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import logoPadrao from "@/assets/legado/logo_degrade.png";

const menuItems = [
    { title: "Meus Clientes", icon: Users, path: "/admin-parceiro/dashboard" },
    // { title: "Configurações", icon: Settings, path: "/admin-parceiro/configuracoes" },
];

interface ParceiroProfile {
    nome: string | null;
    email: string | null;
    logo_url: string | null;
    parceiro_id: string | null;
}

export default function ParceiroLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [parceiroProfile, setParceiroProfile] = useState<ParceiroProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadParceiroData() {
            try {
                setLoading(true);

                const { data: authRes, error: authErr } = await supabase.auth.getUser();
                if (authErr) {
                    console.error("supabase.auth.getUser error:", authErr);
                }
                const user = authRes?.user;
                if (!user) {
                    setParceiroProfile({
                        nome: "Acesso Administrativo",
                        email: null,
                        logo_url: null,
                        parceiro_id: null,
                    });
                    setLoading(false);
                    return;
                }

                // 1) buscar vínculo em usuarios_app — selecionar apenas colunas existentes
                const { data: perfilApp, error: perfilErr } = await supabase
                    .from("usuarios_app")
                    .select("parceiro_id, role, titular_id, auth_id")
                    .eq("auth_id", user.id)
                    .maybeSingle();

                if (perfilErr) {
                    console.error("Erro query usuarios_app:", perfilErr);
                    // Mostra fallback administrativo para evitar bloquear a UI
                    setParceiroProfile({
                        nome: "Acesso Administrativo",
                        email: user.email || null,
                        logo_url: null,
                        parceiro_id: null,
                    });
                    setLoading(false);
                    return;
                }

                // Se tem parceiro_id, buscar dados do parceiro (nome + logo_url)
                if (perfilApp?.parceiro_id) {
                    // Selecionar somente colunas que existem na tabela 'parceiros'
                    const { data: dadosParceiro, error: dadosErr } = await supabase
                        .from("parceiros")
                        .select("nome, logo_url")
                        .eq("id", perfilApp.parceiro_id)
                        .maybeSingle();

                    if (dadosErr) {
                        console.error("Erro query parceiros:", dadosErr);
                        setParceiroProfile({
                            nome: perfilApp?.parceiro_id ? "Parceiro" : "Acesso Administrativo",
                            email: user.email || null,
                            logo_url: null,
                            parceiro_id: perfilApp?.parceiro_id || null,
                        });
                    } else {
                        setParceiroProfile({
                            nome: dadosParceiro?.nome || "Parceiro",
                            // email não está na tabela parceiros; usar email do auth como fallback
                            email: user.email || null,
                            logo_url: dadosParceiro?.logo_url || null,
                            parceiro_id: perfilApp.parceiro_id,
                        });
                    }
                } else {
                    // usuário sem vínculo de parceiro (admin)
                    setParceiroProfile({
                        nome: "Acesso Administrativo",
                        email: user.email || null,
                        logo_url: null,
                        parceiro_id: null,
                    });
                }
            } catch (err) {
                console.error("Erro ao carregar dados do ParceiroLayout:", err);
                setParceiroProfile({
                    nome: "Acesso Administrativo",
                    email: null,
                    logo_url: null,
                    parceiro_id: null,
                });
            } finally {
                setLoading(false);
            }
        }

        loadParceiroData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/legado-app/login");
    };

    const currentMenuTitle = menuItems.find((i) => i.path === location.pathname)?.title || "Painel Parceiro";
    const logoParaExibir = parceiroProfile?.logo_url || logoPadrao;
    const nomeExibicao = parceiroProfile?.nome || "Carregando...";
    const iniciais =
        parceiroProfile?.nome
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "PA";

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#e3f1eb]">
                <Sidebar className="border-r border-[#d1e5dc] shadow-xl bg-white/90 backdrop-blur">
                    <SidebarContent className="bg-white">
                        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#e0f0ea]">
                            <div className="h-11 w-11 rounded-2xl bg-[#5ba58c] flex items-center justify-center shadow-md shadow-[#5ba58c33]">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xs font-extrabold text-[#255f4f] leading-tight uppercase tracking-[0.18em]">
                                    {nomeExibicao}
                                </h2>
                                <p className="text-[10px] font-semibold text-[#5ba58c] uppercase tracking-[0.25em] mt-1">
                                    Painel Parceiro
                                </p>
                            </div>
                        </div>

                        <SidebarGroup>
                            <SidebarGroupLabel className="px-6 mt-4 text-[11px] font-semibold text-[#6b8c7d] uppercase tracking-widest mb-2">
                                Menu Principal
                            </SidebarGroupLabel>
                            <SidebarGroupContent className="px-3 pb-4">
                                <SidebarMenu>
                                    {menuItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        return (
                                            <SidebarMenuItem key={item.path} className="mb-1">
                                                <SidebarMenuButton
                                                    onClick={() => navigate(item.path)}
                                                    className={cn(
                                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border border-transparent",
                                                        isActive
                                                            ? "bg-[#e3f1eb] text-[#255f4f] border-[#c2e1d4] shadow-sm"
                                                            : "text-[#4f665a] hover:bg-[#f4fbf8] hover:text-[#255f4f]"
                                                    )}
                                                    tooltip={item.title}
                                                >
                                                    <item.icon
                                                        className={cn(
                                                            "h-5 w-5 transition-colors",
                                                            isActive ? "text-[#5ba58c]" : "text-[#9db4aa] group-hover:text-[#5ba58c]"
                                                        )}
                                                    />
                                                    <span className="font-medium text-sm">{item.title}</span>
                                                    {isActive && <ChevronRight className="ml-auto h-4 w-4 text-[#5ba58c]" />}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="p-4 border-t border-[#e0f0ea] bg-[#f5fbf8]">
                        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-white border border-[#e0f0ea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={logoParaExibir} />
                                <AvatarFallback className="bg-[#d7efe5] text-[#255f4f] font-bold text-xs">{iniciais}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-[#255f4f] truncate">{parceiroProfile?.nome || "Parceiro"}</p>
                                <p className="text-xs text-[#6b8c7d] truncate">{parceiroProfile?.email || ""}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-[#885555] hover:text-[#b91c1c] hover:bg-[#fee2e2] rounded-md transition-all w-full group"
                        >
                            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Sair do Sistema
                        </button>
                    </SidebarFooter>
                </Sidebar>

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#d1e5dc] px-8 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-[#6b8c7d] hover:text-[#255f4f] transition-colors" />
                            <div className="h-4 w-[1px] bg-[#d1e5dc] mx-2 hidden sm:block" />
                            <h1 className="text-sm font-semibold text-[#255f4f] hidden sm:block">{currentMenuTitle}</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#166534] bg-[#bbf7d0] px-3 py-1 rounded-full uppercase tracking-widest">Painel Parceiro</span>
                        </div>
                    </header>

                    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                            <Outlet context={{ userProfile: parceiroProfile }} />
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}