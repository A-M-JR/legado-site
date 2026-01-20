import { useEffect, useState } from "react";
import {
    Users,
    Building2,
    Layers,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card";
import { supabase } from "../lib/supabaseClient";

// Helper simples caso você não esteja usando o cn do shadcn
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ");
}

interface StatsState {
    totalUsuariosAtivos: number;
    totalParceirosAtivos: number;
    totalModulosAtivos: number;
    // por módulo (legado, idoso, paliativo)
    moduloLegado: number;
    moduloIdoso: number;
    moduloPaliativo: number;
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<StatsState | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                setError(null);

                // 1) Total de usuários ativos no sistema (usuarios_app)
                const { count: totalUsuariosAtivos, error: usuariosError } = await supabase
                    .from("usuarios_app")
                    .select("*", { count: "exact", head: true })
                    .in("status", ["ativo", "vitalicio"]);

                if (usuariosError) throw usuariosError;

                // 2) Total de parceiros ativos
                const { count: totalParceirosAtivos, error: parceirosError } = await supabase
                    .from("parceiros")
                    .select("*", { count: "exact", head: true })
                    .eq("ativo", true); // ajuste se o campo for diferente

                if (parceirosError) throw parceirosError;

                // 3) Total de módulos ativos
                const { count: totalModulosAtivos, error: modulosError } = await supabase
                    .from("modulos")
                    .select("*", { count: "exact", head: true })
                    .eq("ativo", true);

                if (modulosError) throw modulosError;

                // 4) Distribuição por módulo em titular_modulos
                // Vamos contar quantos TITULARES têm cada módulo ativo.
                // Assumindo:
                // - tabela: titular_modulos
                // - campos: titular_id, modulo_id, ativo (boolean)
                // - tabela modulos: id, nome (legado, idoso, paliativo)

                // Buscar IDs dos módulos pelo nome
                const { data: modulosData, error: modFetchError } = await supabase
                    .from("modulos")
                    .select("id, nome")
                    .in("nome", ["Legado", "Cuidado ao Idoso", "Cuidados Paliativos"]);

                if (modFetchError) throw modFetchError;
                const moduloLegado = modulosData?.find(m => m.nome === "Legado");
                const moduloIdoso = modulosData?.find(m => m.nome === "Cuidado ao Idoso");
                const moduloPaliativo = modulosData?.find(m => m.nome === "Cuidados Paliativos");

                let qtdLegado = 0;
                let qtdIdoso = 0;
                let qtdPaliativo = 0;

                if (moduloLegado) {
                    const { count, error } = await supabase
                        .from("titular_modulos")
                        .select("*", { count: "exact", head: true })
                        .eq("modulo_id", moduloLegado.id)
                        .eq("habilitado", true);
                    if (error) throw error;
                    qtdLegado = count || 0;
                }

                if (moduloIdoso) {
                    const { count, error } = await supabase
                        .from("titular_modulos")
                        .select("*", { count: "exact", head: true })
                        .eq("modulo_id", moduloIdoso.id)
                        .eq("habilitado", true);
                    if (error) throw error;
                    qtdIdoso = count || 0;
                }

                if (moduloPaliativo) {
                    const { count, error } = await supabase
                        .from("titular_modulos")
                        .select("*", { count: "exact", head: true })
                        .eq("modulo_id", moduloPaliativo.id)
                        .eq("habilitado", true);
                    if (error) throw error;
                    qtdPaliativo = count || 0;
                }

                setStats({
                    totalUsuariosAtivos: totalUsuariosAtivos || 0,
                    totalParceirosAtivos: totalParceirosAtivos || 0,
                    totalModulosAtivos: totalModulosAtivos || 0,
                    moduloLegado: qtdLegado,
                    moduloIdoso: qtdIdoso,
                    moduloPaliativo: qtdPaliativo,
                });
            } catch (err: any) {
                console.error("Erro ao carregar estatísticas:", err);
                setError("Não foi possível carregar as estatísticas agora.");
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, []);

    // Derivar percentuais por módulo
    const totalModulosUsuarios = (stats?.moduloLegado || 0) + (stats?.moduloIdoso || 0) + (stats?.moduloPaliativo || 0);
    const perc = (qtd: number) => {
        if (!totalModulosUsuarios) return 0;
        return Math.round((qtd / totalModulosUsuarios) * 100);
    };

    const cards = [
        {
            title: "Usuários Ativos",
            value: stats?.totalUsuariosAtivos?.toLocaleString("pt-BR") ?? "—",
            icon: Users,
            description: "Usuarios com status ativo ou vitalício",
            trend: "+0%",         // placeholder por enquanto
            trendUp: true,
        },
        {
            title: "Parceiros Ativos",
            value: stats?.totalParceirosAtivos?.toString() ?? "—",
            icon: Building2,
            description: "Clínicas, funerárias e outros parceiros",
            trend: "+0%",
            trendUp: true,
        },
        {
            title: "Módulos Ativos",
            value: stats?.totalModulosAtivos?.toString() ?? "—",
            icon: Layers,
            description: "Módulos disponíveis na plataforma",
            trend: "+0%",
            trendUp: true,
        },
        {
            title: "Uso de Módulos",
            value: totalModulosUsuarios ? totalModulosUsuarios.toString() : "—",
            icon: TrendingUp,
            description: "Total de vínculos titular x módulo",
            trend: "+0%",
            trendUp: true,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-500 text-sm">Carregando dados do painel...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Painel Administrativo</h2>
                <p className="text-red-500 text-sm">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header de Boas-vindas */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                    Visão Geral da Plataforma
                </h2>
                <p className="text-slate-500 text-sm">
                    Dados atualizados diretamente do seu banco (Supabase).
                </p>
            </div>

            {/* Grid de Estatísticas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                <stat.icon className="h-4 w-4 text-indigo-600" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <div className="flex items-center mt-1">
                                {stat.trendUp ? (
                                    <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                                )}
                                <span
                                    className={cn(
                                        "text-xs font-bold mr-2",
                                        stat.trendUp ? "text-green-600" : "text-red-600"
                                    )}
                                >
                                    {stat.trend}
                                </span>
                                <span className="text-xs text-slate-400">{stat.description}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Distribuição por módulo */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800">Atividade Recente</CardTitle>
                        <CardDescription>Você pode ligar isso depois aos seus logs reais</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-500">
                            Em breve podemos conectar esta seção à tabela de <code className="text-xs bg-slate-100 px-1 rounded">login_logs</code>
                            {" "}e a outros eventos (criação de titular, ativação de módulo, etc.).
                        </p>
                    </CardContent>
                </Card>

                <Card className="col-span-3 border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-slate-800">Uso por Módulo</CardTitle>
                        <CardDescription>Distribuição real de titulares por módulo</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-[250px]">
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">Legado</span>
                                    <span className="font-bold text-slate-900">
                                        {perc(stats?.moduloLegado || 0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-full"
                                        style={{ width: `${perc(stats?.moduloLegado || 0)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">Cuidados ao Idoso</span>
                                    <span className="font-bold text-slate-900">
                                        {perc(stats?.moduloIdoso || 0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-emerald-500 h-full"
                                        style={{ width: `${perc(stats?.moduloIdoso || 0)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium text-slate-600">Cuidados Paliativos</span>
                                    <span className="font-bold text-slate-900">
                                        {perc(stats?.moduloPaliativo || 0)}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className="bg-amber-500 h-full"
                                        style={{ width: `${perc(stats?.moduloPaliativo || 0)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        {totalModulosUsuarios === 0 && (
                            <p className="mt-4 text-xs text-slate-400">
                                Ainda não há titulares vinculados a módulos. Assim que começar a ativar,
                                essa distribuição será preenchida automaticamente.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}