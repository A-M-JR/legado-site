// src/components/PrivateRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

interface UserProfile {
    role: "admin_master" | "parceiro_admin" | "titular" | "familiar";
    parceiro_id: string | null;
    titular_id: string | null;
    status: "ativo" | "inativo" | "inadimplente" | "vitalicio";
}

let isLoggingIn = false;

interface PrivateRouteProps {
    allowedRoles?: string[];
}

export default function PrivateRoute({ allowedRoles }: PrivateRouteProps) {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [systemInMaintenance, setSystemInMaintenance] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        async function checkAuth() {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    setIsAuth(false);
                    setLoading(false);
                    return;
                }

                setIsAuth(true);

                // buscar perfil do usuário
                const { data: profile, error } = await supabase
                    .from("usuarios_app")
                    .select("role, parceiro_id, titular_id, status")
                    .eq("auth_id", user.id)
                    .single();

                if (error || !profile) {
                    console.error("Erro ao buscar perfil:", error);
                    setIsAuth(false);
                    setLoading(false);
                    return;
                }

                setUserProfile(profile);

                // Se allowedRoles foi passado, checar permissão imediatamente
                if (allowedRoles && Array.isArray(allowedRoles) && !allowedRoles.includes(profile.role)) {
                    setLoading(false);
                    return navigate("/bloqueado", { replace: true, state: { status: "bloqueado" } });
                }

                // buscar configuração do sistema (manutenção)
                const { data: configData } = await supabase
                    .from("config_sistema")
                    .select("manutencao_ativa")
                    .limit(1)
                    .maybeSingle();

                if (configData?.manutencao_ativa) {
                    setSystemInMaintenance(true);
                }

                // log de acesso (uma vez por sessão)
                const logKey = `log_${user.id}`;
                const logRegistrado = sessionStorage.getItem(logKey);

                if (!logRegistrado && !isLoggingIn) {
                    isLoggingIn = true;
                    await supabase.from("login_logs").insert({
                        auth_id: user.id,
                        parceiro_id: profile.parceiro_id,
                        user_agent: navigator.userAgent,
                        sucesso: true,
                    });
                    sessionStorage.setItem(logKey, "true");
                    isLoggingIn = false;
                }

                // verificar status da conta
                if (profile.status !== "ativo" && profile.status !== "vitalicio") {
                    setLoading(false);
                    return;
                }

                const path = location.pathname;

                // DEBUG (remove se quiser)
                // console.log("allowedRoles:", allowedRoles);
                // console.log("profile.role:", profile.role);
                // console.log("path:", path);

                // -------------------------------------
                // 🔐 BLOQUEIOS DE SEGURANÇA (corrigidos)
                // - primeiro tratamos o caso do painel do parceiro (/admin-parceiro ou /parceiro)
                // - NÃO deixar a checagem genérica de "/admin" bloquear o "/admin-parceiro"
                // -------------------------------------

                // Se o caminho for de painel parceiro, só parceiro_admin pode acessar
                if ((path.startsWith("/parceiro") || path.startsWith("/admin-parceiro")) && profile.role !== "parceiro_admin") {
                    return navigate("/bloqueado", { replace: true, state: { status: "bloqueado" } });
                }

                // Se o caminho for admin "master" (rota /admin ou /admin/...), apenas admin_master
                // IMPORTANTE: impedir que /admin-parceiro entre aqui, por isso checamos NOT startsWith /admin-parceiro
                if (path.startsWith("/admin") && !path.startsWith("/admin-parceiro") && profile.role !== "admin_master") {
                    return navigate("/bloqueado", { replace: true, state: { status: "bloqueado" } });
                }

                // Titular/familiar não podem acessar rotas administrativas
                if (
                    (profile.role === "titular" || profile.role === "familiar") &&
                    (path.startsWith("/admin") || path.startsWith("/parceiro") || path.startsWith("/admin-parceiro"))
                ) {
                    return navigate("/bloqueado", { replace: true, state: { status: "bloqueado" } });
                }

                // -------------------------------------
                // 🎯 REDIRECIONAMENTO INTELIGENTE
                // -------------------------------------

                // admin master -> /admin
                if (profile.role === "admin_master" && !path.startsWith("/admin")) {
                    return navigate("/admin", { replace: true });
                }

                // parceiro -> /admin-parceiro (padronizado)
                if (profile.role === "parceiro_admin" && !path.startsWith("/admin-parceiro") && !path.startsWith("/parceiro")) {
                    return navigate("/admin-parceiro", { replace: true });
                }

                // titular/familiar -> lógica de seleção de módulos
                if (
                    (profile.role === "titular" || profile.role === "familiar") &&
                    (path === "/" || path === "/legado-app")
                ) {
                    const { data: modulosData } = await supabase
                        .from("titular_modulos")
                        .select("modulos(nome)")
                        .eq("titular_id", profile.titular_id)
                        .eq("habilitado", true);

                    const modulos = modulosData?.map((item: any) => item.modulos.nome) || [];
                    const qtdModulos = modulos.length;

                    if (qtdModulos === 0) {
                        return navigate("/bloqueado", { replace: true, state: { status: "inativo" } });
                    } else if (qtdModulos === 1) {
                        const nomeModulo = modulos[0];
                        if (nomeModulo === "Legado") return navigate("/legado-app/menu", { replace: true });
                        if (nomeModulo === "Cuidado ao Idoso") return navigate("/idoso-app/menu", { replace: true });
                        if (nomeModulo === "Cuidados Paliativos") return navigate("/paliativo-app/menu", { replace: true });
                    } else {
                        return navigate("/legado-app/selecao-modulos", { replace: true });
                    }
                }

                setLoading(false);
            } catch (err) {
                console.error("Erro na autenticação:", err);
                setIsAuth(false);
                setLoading(false);
            }
        }

        checkAuth();

        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === "SIGNED_OUT") {
                setIsAuth(false);
                setUserProfile(null);
                sessionStorage.clear();
                isLoggingIn = false;
                navigate("/legado-app/login", { replace: true });
            }
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [navigate, location.pathname, allowedRoles]);

    // loading UI
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-legado-primary/5 via-white to-legado-primary/10">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-legado-primary/30 border-t-legado-primary mb-4"></div>
                    <p className="text-gray-600 font-medium">Carregando seu ambiente...</p>
                </div>
            </div>
        );
    }

    // não autenticado
    if (!isAuth) {
        return <Navigate to="/legado-app/login" replace />;
    }

    // manutenção
    if (systemInMaintenance && userProfile?.role !== "admin_master") {
        return <Navigate to="/bloqueado" replace state={{ status: "manutencao" }} />;
    }

    // status da conta
    if (userProfile && userProfile.status !== "ativo" && userProfile.status !== "vitalicio") {
        return <Navigate to="/bloqueado" replace state={{ status: userProfile.status }} />;
    }

    return <Outlet context={{ userProfile }} />;
}