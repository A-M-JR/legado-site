import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut, Mail, ShieldAlert, Lock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function BloqueadoPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const status = location.state?.status || "inativo";
    const [emailSuporte, setEmailSuporte] = useState("suporte@legado.com");

    useEffect(() => {
        // Busca o email de suporte configurado no sistema
        async function loadEmailSuporte() {
            const { data } = await supabase
                .from("config_sistema")
                .select("email_suporte")
                .limit(1)
                .maybeSingle();

            if (data?.email_suporte) {
                setEmailSuporte(data.email_suporte);
            }
        }
        loadEmailSuporte();
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/legado-app/login");
    }

    function getMensagem() {
        switch (status) {
            case "inadimplente":
                return {
                    titulo: "Acesso Suspenso",
                    descricao:
                        "Seu acesso está temporariamente bloqueado devido a pendências financeiras.",
                    instrucao:
                        "Entre em contato com o administrador para regularizar sua situação e reativar seu acesso imediatamente.",
                    cor: "from-amber-50 to-orange-50",
                    borda: "border-amber-200",
                    icone: AlertTriangle,
                    iconeCor: "text-amber-600",
                    bgIcone: "bg-amber-100",
                };
            case "inativo":
                return {
                    titulo: "Conta Inativa",
                    descricao: "Sua conta está temporariamente inativa no sistema.",
                    instrucao:
                        "Para reativar seu acesso, entre em contato com o administrador da plataforma.",
                    cor: "from-slate-50 to-gray-100",
                    borda: "border-slate-200",
                    icone: Lock,
                    iconeCor: "text-slate-600",
                    bgIcone: "bg-slate-100",
                };
            case "manutencao":
                return {
                    titulo: "Sistema em Manutenção",
                    descricao: "Estamos realizando melhorias no sistema.",
                    instrucao:
                        "Voltaremos em breve. Agradecemos sua compreensão e paciência.",
                    cor: "from-blue-50 to-indigo-50",
                    borda: "border-blue-200",
                    icone: ShieldAlert,
                    iconeCor: "text-blue-600",
                    bgIcone: "bg-blue-100",
                };
            default:
                return {
                    titulo: "Acesso Bloqueado",
                    descricao: "Você não tem permissão para acessar o sistema no momento.",
                    instrucao: "Entre em contato com o suporte para mais informações sobre seu acesso.",
                    cor: "from-red-50 to-rose-50",
                    borda: "border-red-200",
                    icone: AlertCircle,
                    iconeCor: "text-red-600",
                    bgIcone: "bg-red-100",
                };
        }
    }

    const mensagem = getMensagem();
    const IconeComponente = mensagem.icone;

    return (
        <div className="min-h-screen bg-gradient-to-br from-legado-primary/5 via-white to-legado-primary/10 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Elementos decorativos de fundo */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-legado-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-legado-primary/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-lg w-full relative z-10">
                {/* Card Principal */}
                <div className={`bg-gradient-to-br ${mensagem.cor} border-2 ${mensagem.borda} rounded-3xl p-10 shadow-2xl backdrop-blur-sm`}>

                    {/* Ícone */}
                    <div className="flex justify-center mb-6">
                        <div className={`${mensagem.bgIcone} p-5 rounded-2xl shadow-lg`}>
                            <IconeComponente className={`${mensagem.iconeCor} h-12 w-12`} strokeWidth={2} />
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                            {mensagem.titulo}
                        </h1>
                        <p className="text-gray-600 text-base leading-relaxed">
                            {mensagem.descricao}
                        </p>
                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/40">
                            <p className="text-sm text-gray-700 leading-relaxed">
                                {mensagem.instrucao}
                            </p>
                        </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="space-y-3 mt-8">
                        {status !== "manutencao" && (
                            <Button
                                className="w-full bg-legado-primary hover:bg-legado-primary-dark text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                onClick={() =>
                                    (window.location.href = `mailto:${emailSuporte}`)
                                }
                            >
                                <Mail className="h-5 w-5 mr-2" />
                                Entrar em Contato com Suporte
                            </Button>
                        )}

                        <Button
                            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-6 rounded-xl border-2 border-gray-200 shadow-md transition-all duration-300 hover:scale-[1.02]"
                            variant="outline"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5 mr-2" />
                            Sair da Conta
                        </Button>
                    </div>
                </div>

                {/* Mensagem de Segurança */}
                <div className="mt-8 text-center space-y-2">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-gray-100">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <p className="text-sm font-medium text-gray-700">
                            Seus dados estão seguros e protegidos
                        </p>
                    </div>
                    <p className="text-xs text-gray-500 px-4">
                        Você poderá acessar todas as suas informações novamente após a reativação da conta.
                    </p>
                </div>
            </div>
        </div>
    );
}