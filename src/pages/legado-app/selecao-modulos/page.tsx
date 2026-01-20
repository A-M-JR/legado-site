// src/pages/legado-app/selecao-modulos/page.tsx
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { BookHeart, HeartPulse, UserRoundPlus, ChevronRight, Sparkles, ShieldCheck } from "lucide-react";

// Import da sua logo padrão
import logoPadrao from "@/assets/legado/logo_degrade.png";

export default function SelecaoModulosPage() {
    const navigate = useNavigate();
    const { userProfile } = useOutletContext<any>();
    const [modulos, setModulos] = useState<any[]>([]);
    const [parceiroInfo, setParceiroInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInitialData() {
            if (!userProfile?.titular_id) return;

            try {
                // 1. Busca Módulos Habilitados
                const { data: modData, error: modError } = await supabase
                    .from("titular_modulos")
                    .select(`
                        habilitado,
                        modulos (
                            id,
                            nome
                        )
                    `)
                    .eq("titular_id", userProfile.titular_id)
                    .eq("habilitado", true);

                if (modError) throw modError;

                if (modData) {
                    const formatados = modData
                        .map((item: any) => item.modulos)
                        .filter((m) => m !== null);
                    setModulos(formatados);
                }

                // 2. Busca Informações do Parceiro (Logo e Nome)
                if (userProfile.parceiro_id) {
                    const { data: parcData } = await supabase
                        .from("parceiros")
                        .select("nome, logo_url")
                        .eq("id", userProfile.parceiro_id)
                        .single();

                    if (parcData) setParceiroInfo(parcData);
                }
            } catch (error) {
                console.error("Erro ao carregar dados de seleção:", error);
            } finally {
                setLoading(false);
            }
        }

        loadInitialData();
    }, [userProfile]);

    const direcionarParaModulo = (nome: string) => {
        // Usamos .includes para ser resiliente a nomes no banco (ex: "Cuidado ao Idoso")
        if (nome.includes("Legado")) navigate("/legado-app/menu");
        else if (nome.includes("Idoso")) navigate("/idoso-app/menu");
        else if (nome.includes("Paliativo")) navigate("/paliativo-app/menu");
    };

    // Define a logo: Prioridade para o Parceiro, Fallback para a Padrão
    const logoParaExibir = parceiroInfo?.logo_url || logoPadrao;

    if (loading) {
        return (
            <div className="legado-app-wrapper flex items-center justify-center bg-[#e3f1eb]">
                <div className="flex flex-col items-center gap-4">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5ba58c]"></div>
                    <p className="text-[#5ba58c] font-medium animate-pulse text-sm">Preparando seu ambiente...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center p-6 bg-[#e3f1eb]">
            <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">

                {/* Header Dinâmico */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <img
                            src={logoParaExibir}
                            alt="Logo"
                            className="max-h-28 w-auto mx-auto drop-shadow-md object-contain transition-transform hover:scale-105 duration-300"
                        />
                        {parceiroInfo && (
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm border border-[#e3f1eb] flex items-center gap-1.5 whitespace-nowrap">
                                <ShieldCheck size={12} className="text-[#5ba58c]" />
                                <p className="text-[10px] font-bold text-[#5ba58c] uppercase tracking-tight">
                                    {parceiroInfo.nome}
                                </p>
                            </div>
                        )}
                    </div>

                    <h2 className="text-2xl font-extrabold text-[#255f4f] tracking-tight mt-4">
                        Olá, {userProfile?.nome?.split(' ')[0] || "Bem-vindo"}
                    </h2>
                    <p className="text-[#4f665a] mt-2 font-medium opacity-80">
                        Qual jornada deseja seguir hoje?
                    </p>
                </div>

                {/* Lista de Módulos Estilizada */}
                <div className="grid gap-5">
                    {modulos.length === 0 ? (
                        <div className="bg-white/50 backdrop-blur-sm border-2 border-dashed border-[#5ba58c]/30 p-8 rounded-3xl text-center">
                            <p className="text-[#4f665a] font-semibold">Nenhum módulo disponível.</p>
                            <p className="text-xs text-gray-500 mt-1">Fale com seu administrador para liberar o acesso.</p>
                        </div>
                    ) : (
                        modulos.map((mod) => (
                            <button
                                key={mod.id}
                                onClick={() => direcionarParaModulo(mod.nome)}
                                className="group relative overflow-hidden bg-white p-5 rounded-2xl border-2 border-transparent hover:border-[#5ba58c] shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_30px_rgba(91,165,140,0.15)] transition-all duration-300 text-left active:scale-[0.98]"
                            >
                                {/* Efeito de brilho no fundo ao passar o mouse */}
                                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-[#e3f1eb] rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500" />

                                <div className="flex items-center gap-5 relative z-10">
                                    {/* Ícone com Cores Temáticas */}
                                    <div className={`p-4 rounded-2xl transition-all duration-300 ${mod.nome.includes("Legado") ? "bg-[#fef9c3] text-[#854d0e]" :
                                            mod.nome.includes("Idoso") ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"
                                        } group-hover:bg-[#5ba58c] group-hover:text-white group-hover:rotate-3`}>
                                        {mod.nome.includes("Legado") && <BookHeart size={28} strokeWidth={2.2} />}
                                        {mod.nome.includes("Idoso") && <UserRoundPlus size={28} strokeWidth={2.2} />}
                                        {mod.nome.includes("Paliativo") && <HeartPulse size={28} strokeWidth={2.2} />}
                                    </div>

                                    {/* Textos Informativos */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-[#2d2d2d] group-hover:text-[#255f4f] transition-colors">
                                            {mod.nome}
                                        </h3>
                                        <p className="text-sm text-[#4f665a] leading-tight mt-0.5 opacity-70">
                                            {mod.nome.includes("Legado") ? "Preserve memórias e histórias" :
                                                mod.nome.includes("Idoso") ? "Cuidado e acompanhamento diário" : "Suporte e conforto humanizado"}
                                        </p>
                                    </div>

                                    {/* Indicador de Ação */}
                                    <div className="bg-[#f9f9f9] p-2 rounded-full group-hover:bg-[#5ba58c] group-hover:text-white transition-all shadow-sm">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Rodapé com Brilho */}
                <div className="mt-12 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 opacity-30">
                        <div className="h-[1px] w-8 bg-[#5ba58c]" />
                        <Sparkles size={12} className="text-[#5ba58c]" />
                        <div className="h-[1px] w-8 bg-[#5ba58c]" />
                    </div>
                    <p className="text-[10px] text-[#4f665a] font-bold uppercase tracking-[0.25em] opacity-40">
                        Legado & Conforto • 2026
                    </p>
                </div>
            </div>
        </div>
    );
}