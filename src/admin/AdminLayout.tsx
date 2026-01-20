// src/admin/AdminLayout.tsx
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
    Building2,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    ShieldCheck,
    ChevronRight,
    History as HistoryIcon,
    Puzzle,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// Logo padrão do Legado
import logoPadrao from "@/assets/legado/logo_degrade.png";

const menuItems = [
    {
        title: "Visão Geral",
        icon: LayoutDashboard,
        path: "/admin/dashboard",
    },
    {
        title: "Parceiros",
        icon: Building2,
        path: "/admin/parceiros",
    },
    {
        title: "Gestão de Usuários",
        icon: Users,
        path: "/admin/titulares",
    },
    // {
    //     title: "Módulos & Planos",
    //     icon: Puzzle,
    //     path: "/admin/modulos",
    // },
    // {
    //     title: "Logs do Sistema",
    //     icon: HistoryIcon,
    //     path: "/admin/logs",
    // },
    {
        title: "Configurações",
        icon: Settings,
        path: "/admin/configuracoes",
    },
];

interface ConfigSistema {
    nome_sistema: string | null;
    logo_url: string | null;
}

interface AdminProfile {
    nome: string | null;
    email: string | null;
}

export default function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    const [config, setConfig] = useState<ConfigSistema | null>(null);
    const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);

    useEffect(() => {
        async function loadAdminData() {
            try {
                // 1) Usuário autenticado
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // Busca nome/email da tabela usuarios_app
                    const { data: perfilApp, error: perfilError } = await supabase
                        .from("usuarios_app")
                        .select("nome, email, role")
                        .eq("auth_id", user.id)
                        .maybeSingle(); // maybeSingle não gera erro se não encontrar nada

                    setAdminProfile({
                        nome: perfilApp?.nome || user.user_metadata?.full_name || "Administrador",
                        email: perfilApp?.email || user.email || "master@legado.com",
                    });
                }

                // 2) Configuração global do sistema
                const { data: configData } = await supabase
                    .from("config_sistema")
                    .select("nome_sistema, logo_url")
                    .limit(1)
                    .maybeSingle();

                if (configData) setConfig(configData);
            } catch (err) {
                console.error("Erro ao carregar dados do AdminLayout:", err);
            }
        }

        loadAdminData();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/legado-app/login");
    };

    const currentMenuTitle =
        menuItems.find((i) => i.path === location.pathname)?.title || "Painel";

    const logoParaExibir = config?.logo_url || logoPadrao;
    const nomeSistema = config?.nome_sistema || "Legado & Conforto";

    const iniciaisAdmin =
        adminProfile?.nome
            ?.split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase() || "AM";

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#e3f1eb]">
                <Sidebar className="border-r border-[#d1e5dc] shadow-xl bg-white/90 backdrop-blur">
                    <SidebarContent className="bg-white">
                        {/* Header da Sidebar com Logo/Nome */}
                        <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-[#e0f0ea]">
                            <div className="h-11 w-11 rounded-2xl bg-[#5ba58c] flex items-center justify-center shadow-md shadow-[#5ba58c33]">
                                <ShieldCheck className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xs font-extrabold text-[#255f4f] leading-tight uppercase tracking-[0.18em]">
                                    {nomeSistema}
                                </h2>
                                <p className="text-[10px] font-semibold text-[#5ba58c] uppercase tracking-[0.25em] mt-1">
                                    Admin Master
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
                                                            isActive
                                                                ? "text-[#5ba58c]"
                                                                : "text-[#9db4aa] group-hover:text-[#5ba58c]"
                                                        )}
                                                    />
                                                    <span className="font-medium text-sm">
                                                        {item.title}
                                                    </span>
                                                    {isActive && (
                                                        <ChevronRight className="ml-auto h-4 w-4 text-[#5ba58c]" />
                                                    )}
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        );
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    {/* Footer da Sidebar com Perfil e Logout */}
                    <SidebarFooter className="p-4 border-t border-[#e0f0ea] bg-[#f5fbf8]">
                        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-white border border-[#e0f0ea] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                                <AvatarImage src={logoParaExibir} />
                                <AvatarFallback className="bg-[#d7efe5] text-[#255f4f] font-bold text-xs">
                                    {iniciaisAdmin}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-semibold text-[#255f4f] truncate">
                                    {adminProfile?.nome || "Administrador"}
                                </p>
                                <p className="text-xs text-[#6b8c7d] truncate">
                                    {adminProfile?.email || "master@legado.com"}
                                </p>
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
                    {/* Header Superior Refinado */}
                    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-[#d1e5dc] px-8 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <SidebarTrigger className="text-[#6b8c7d] hover:text-[#255f4f] transition-colors" />
                            <div className="h-4 w-[1px] bg-[#d1e5dc] mx-2 hidden sm:block" />
                            <h1 className="text-sm font-semibold text-[#255f4f] hidden sm:block">
                                {currentMenuTitle}
                            </h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-[#166534] bg-[#bbf7d0] px-3 py-1 rounded-full uppercase tracking-widest">
                                Sistema Online
                            </span>
                        </div>
                    </header>

                    {/* Área de Conteúdo */}
                    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                        <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                            <Outlet />
                        </div>
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
}