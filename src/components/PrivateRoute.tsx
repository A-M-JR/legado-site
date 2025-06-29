// src/components/PrivateRoute.tsx
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function PrivateRoute() {
    const [loading, setLoading] = useState(true);
    const [isAuth, setIsAuth] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Checa usuário autenticado
        supabase.auth.getUser().then(({ data: { user } }) => {
            setIsAuth(!!user);
            setLoading(false);
        });
        // Também pode adicionar listener para detectar logout automático, se quiser
    }, []);

    if (loading) {
        // Opcional: pode exibir um loading spinner
        return <div className="text-center py-10">Carregando...</div>;
    }

    // Se não autenticado, manda pro login (guarda path para redirect depois do login)
    if (!isAuth) {
        return <Navigate to="/legado-app/login" state={{ from: location }} replace />;
    }

    // Senão, renderiza a rota interna normalmente
    return <Outlet />;
}
