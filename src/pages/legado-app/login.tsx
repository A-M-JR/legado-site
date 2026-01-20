import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import logo from "@/assets/Legado - Branco.png";
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SENHA_MESTRE = "SENHAMAGICA123";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha e-mail e senha para continuar.",
      });
      setLoading(false);
      return;
    }

    // Se for senha mestre, simula login direto (mantém comportamento antigo)
    if (password === SENHA_MESTRE) {
      localStorage.setItem("legado-login-time", String(Date.now()));
      toast({
        title: "✅ Login realizado!",
        description: "Redirecionando...",
      });

      setTimeout(() => {
        navigate("/legado-app/selecao-modulos", { replace: true });
      }, 800);
      setLoading(false);
      return;
    }

    // Login normal com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: authError.message,
      });
      setLoading(false);
      return;
    }

    if (authData.user) {
      // Busca o perfil do usuário na nova tabela usuarios_app
      const { data: profile, error: profileError } = await supabase
        .from("usuarios_app")
        .select("role, parceiro_id, titular_id")
        .eq("auth_id", authData.user.id)
        .single();

      if (profileError || !profile) {
        // Se não encontrou perfil, pode ser usuário antigo sem migração
        console.warn("Perfil não encontrado, criando perfil padrão...");

        // Tenta buscar o titular vinculado a esse auth_id
        const { data: titular } = await supabase
          .from("titulares")
          .select("id")
          .eq("auth_id", authData.user.id)
          .single();

        if (titular) {
          // Cria o perfil automaticamente
          await supabase.from("usuarios_app").insert({
            auth_id: authData.user.id,
            role: "titular",
            titular_id: titular.id,
            parceiro_id: null,
          });

          // Redireciona para seleção de módulos
          localStorage.setItem("legado-login-time", String(Date.now()));
          toast({
            title: "✅ Login realizado!",
            description: "Bem-vindo de volta!",
          });
          setTimeout(() => navigate("/legado-app/selecao-modulos", { replace: true }), 800);
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Perfil de usuário não encontrado.",
          });
        }

        setLoading(false);
        return;
      }

      // Redirecionamento inteligente baseado no role
      localStorage.setItem("legado-login-time", String(Date.now()));
      toast({
        title: "✅ Login realizado!",
        description: "Redirecionando para seu painel...",
      });

      setTimeout(() => {
        if (profile.role === "admin_master") {
          navigate("/admin", { replace: true });
        } else if (profile.role === "parceiro_admin") {
          navigate("/parceiro", { replace: true });
        } else {
          // titular ou familiar
          navigate("/legado-app/selecao-modulos", { replace: true });
        }
      }, 800);
    }

    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        variant: "destructive",
        title: "E-mail obrigatório",
        description: "Informe seu e-mail para redefinir a senha.",
      });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/legado-app/redefinir-senha`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar e-mail",
        description: error.message,
      });
    } else {
      toast({
        title: "✅ E-mail enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legado-primary/5 via-white to-legado-primary/10 px-4 py-8">
      {/* Card Principal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header com Logo */}
        <div className="bg-gradient-to-br from-legado-primary to-legado-primary-dark p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <img
            src={logo}
            alt="Logo"
            className="mx-auto w-40 h-auto mb-3 relative z-10 drop-shadow-lg"
          />
          <h1 className="text-white text-2xl font-bold relative z-10">
            {forgotMode ? "Recuperar Senha" : "Bem-vindo de volta!"}
          </h1>
          <p className="text-white/80 text-sm mt-1 relative z-10">
            {forgotMode
              ? "Informe seu e-mail para redefinir"
              : "Acesse sua conta para continuar"}
          </p>
        </div>

        {/* Formulário */}
        <div className="p-8">
          {!forgotMode ? (
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-legado-primary" />
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                </div>
              </div>

              {/* Campo Senha */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Lock size={16} className="text-legado-primary" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Lock
                    size={18}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                </div>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-legado-primary to-legado-primary-dark text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    Acessar
                    <ArrowRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              {/* Campo E-mail */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail size={16} className="text-legado-primary" />
                  E-mail cadastrado
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    className="w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail
                    size={18}
                    className="absolute left-3.5 top-3.5 text-gray-400"
                  />
                </div>
              </div>

              {/* Botão de Recuperar */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-legado-primary to-legado-primary-dark text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Enviar link de recuperação
                <ArrowRight size={20} />
              </button>
            </form>
          )}

          {/* Links de Ação */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setForgotMode(!forgotMode)}
              className="w-full text-center text-sm text-gray-600 hover:text-legado-primary font-medium transition-colors"
            >
              {forgotMode ? "← Voltar para o login" : "Esqueci minha senha"}
            </button>

            {!forgotMode && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600 mb-3">
                  Ainda não possui uma conta?
                </p>
                <a
                  href="/legado-app/titulares/novo"
                  className="block w-full text-center py-3 rounded-xl border-2 border-legado-primary text-legado-primary font-bold hover:bg-legado-primary hover:text-white transition-all"
                >
                  Criar conta gratuita
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}