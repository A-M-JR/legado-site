// src/pages/legado-app/selecao-modulos/page.tsx
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { BookHeart, HeartPulse, UserRoundPlus, ChevronRight, Sparkles, ShieldCheck, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import logoPadrao from "@/assets/legado/logo_degrade.png";

export default function SelecaoModulosPage() {
    const navigate = useNavigate();
    const { userProfile } = useOutletContext<any>();
    const [modulos, setModulos] = useState<any[]>([]);
    const [parceiroInfo, setParceiroInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        async function loadInitialData() {
            if (!userProfile?.titular_id) {
                setLoading(false);
                return;
            }

            try {
                const { data: habilitados, error: modError } = await supabase
                    .from("titular_modulos")
                    .select("modulo_id")
                    .eq("titular_id", userProfile.titular_id)
                    .eq("habilitado", true);

                if (modError) throw modError;

                if (habilitados && habilitados.length > 0) {
                    const ids = habilitados.map(h => h.modulo_id);
                    const { data: detalhes, error: detError } = await supabase
                        .from("modulos")
                        .select("id, nome, ativo")
                        .in("id", ids)
                        .eq("ativo", true);

                    if (detError) throw detError;
                    setModulos(detalhes || []);
                } else {
                    setModulos([]);
                }

                if (userProfile.parceiro_id) {
                    const { data: parcData } = await supabase
                        .from("parceiros")
                        .select("nome, logo_url")
                        .eq("id", userProfile.parceiro_id)
                        .single();

                    if (parcData) setParceiroInfo(parcData);
                }
            } catch (error) {
                toast({
                    title: "Erro ao carregar módulos",
                    description: "Não foi possível carregar seus módulos disponíveis.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        }
        loadInitialData();
    }, [userProfile]);

    const direcionarParaModulo = (nome: string) => {
        const n = nome.toLowerCase();
        if (n.includes("legado")) navigate("/legado-app/menu");
        else if (n.includes("idoso")) navigate("/melhor-idade");
        else if (n.includes("paliativo")) navigate("/paliativo-app/menu");
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast({ title: "✅ Até logo!", description: "Você saiu do sistema com sucesso." });
            navigate("/login");
        } catch (error: any) {
            toast({ title: "Erro ao sair", description: error.message || "Tente novamente.", variant: "destructive" });
        } finally {
            setLoggingOut(false);
        }
    };

    const logoParaExibir = parceiroInfo?.logo_url || logoPadrao;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
                <Loader2 className="w-10 h-10 text-legado-primary animate-spin opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f4f2] flex items-center justify-center p-6">
            <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Header Minimalista */}
                <div className="text-center mb-12">
                    <div className="relative inline-block mb-8">
                        <img
                            src={logoParaExibir}
                            alt="Logo"
                            className="max-h-24 w-auto mx-auto drop-shadow-sm grayscale-[0.2] opacity-90"
                        />
                        {parceiroInfo && (
                            <div className="mt-4 flex items-center justify-center gap-1.5 opacity-60">
                                <ShieldCheck size={12} className="text-legado-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-legado-primary">
                                    {parceiroInfo.nome}
                                </span>
                            </div>
                        )}
                    </div>

                    <h2 className="text-3xl font-light text-slate-800 tracking-tight">
                        Olá, <span className="font-semibold text-legado-primary">Bem-vindo</span>
                    </h2>
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Qual jornada deseja seguir hoje?
                    </p>
                </div>

                {/* Lista de Módulos */}
                <div className="space-y-4">
                    {modulos.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center">
                            <p className="text-slate-600 font-semibold">Nenhum módulo disponível</p>
                            <p className="text-xs text-slate-400 mt-1">Entre em contato com seu administrador</p>
                        </div>
                    ) : (
                        modulos.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => direcionarParaModulo(mod.nome)}
                                className="group w-full bg-white/80 backdrop-blur-md p-5 rounded-[2rem] shadow-sm hover:shadow-xl hover:bg-white transition-all duration-500 text-left flex items-center gap-5 border border-white/50 active:scale-[0.98]"
                            >
                                <div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 ${mod.nome.toLowerCase().includes("legado") ? "bg-amber-50 text-amber-700" :
                                        mod.nome.toLowerCase().includes("idoso") ? "bg-emerald-50 text-emerald-700" :
                                            "bg-rose-50 text-rose-700"
                                    }`}>
                                    {mod.nome.toLowerCase().includes("legado") && <BookHeart size={26} strokeWidth={1.5} />}
                                    {mod.nome.toLowerCase().includes("idoso") && <UserRoundPlus size={26} strokeWidth={1.5} />}
                                    {mod.nome.toLowerCase().includes("paliativo") && <HeartPulse size={26} strokeWidth={1.5} />}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-800">{mod.nome}</h3>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        {mod.nome.toLowerCase().includes("legado") ? "Preserve memórias e histórias" :
                                            mod.nome.toLowerCase().includes("idoso") ? "Cuidado e acompanhamento" :
                                                "Suporte e conforto humanizado"}
                                    </p>
                                </div>

                                <div className="text-slate-300 group-hover:text-legado-primary group-hover:translate-x-1 transition-all">
                                    <ChevronRight size={20} />
                                </div>
                            </button>
                        ))
                    )}

                    {/* Botão de Sair Integrado na Lista */}
                    <div className="pt-4">
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="group w-full bg-slate-100/50 hover:bg-red-50 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 border border-transparent hover:border-red-100 active:scale-[0.98]"
                        >
                            {loggingOut ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            ) : (
                                <>
                                    <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors" />
                                    <span className="text-sm font-bold text-slate-500 group-hover:text-red-600 transition-colors">
                                        Sair do Sistema
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Discreto */}
                <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-3 opacity-10 mb-4">
                        <div className="h-[1px] w-12 bg-slate-900" />
                        <Sparkles size={14} />
                        <div className="h-[1px] w-12 bg-slate-900" />
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em]">
                        Legado & Conforto • 2026
                    </p>
                </div>
            </div>
        </div>
    );
}