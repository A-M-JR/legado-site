import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/Legado - Branco.png";

export default function RedefinirSenhaPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "Digite a mesma senha nos dois campos.",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao redefinir senha",
        description: error.message,
      });
      return;
    }

    toast({
      title: "Senha atualizada!",
      description: "Faça login com sua nova senha.",
    });
    navigate("/legado-app/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-legado-primary/5 via-white to-legado-primary/10 px-4 py-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-br from-legado-primary to-legado-primary-dark p-8 text-center">
          <img src={logo} alt="Logo" className="mx-auto w-32 h-auto mb-3" />
          <h1 className="text-white text-xl font-bold">Nova Senha</h1>
          <p className="text-white/80 text-sm mt-1">Defina sua nova senha de acesso</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} className="text-legado-primary" />
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Lock size={14} className="text-legado-primary" />
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-legado-primary to-legado-primary-dark text-white py-3.5 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                Salvar nova senha
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
