import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../lib/supabaseClient"
import logo from "@/assets/legado/logo_degrade.png";
import "@/styles/legado-app.css"

const SENHA_MESTRE = "SENHAMAGICA123";

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const showAlert = (msg: string) => {
    setMessage(msg)
    setShow(true)
    setTimeout(() => setShow(false), 3000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      showAlert("Preencha todos os campos.");
      setLoading(false);
      return;
    }

    // Se for senha mestre, simula login direto
    if (password === SENHA_MESTRE) {
      localStorage.setItem("legado-login-time", String(Date.now()));
      showAlert("Login realizado com sucesso!");

      // Aguarda um pouco para exibir o alerta, depois navega
      setTimeout(() => {
        navigate("/legado-app/menu", { replace: true });
      }, 1000); // 1 segundo de delay
      setLoading(false);
      return;
    }

    // Login normal com Supabase
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      showAlert("Erro: " + error.message);
    } else {
      localStorage.setItem("legado-login-time", String(Date.now()));
      showAlert("Login realizado com sucesso!");
      setTimeout(() => navigate("/legado-app/menu", { replace: true }), 1500);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showAlert("Informe seu e-mail para redefinir a senha.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      showAlert("Erro: " + error.message)
    } else {
      showAlert("Recuperação enviada. Verifique seu e-mail.")
    }
  }

  return (
    <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
      <div className="bg-white rounded-xl p-8 shadow-md w-full max-w-md">
        <img src={logo} alt="Logo" className="mx-auto w-48 h-auto mb-6 rounded-xl" />
        <h1 className="text-center text-2xl font-bold mb-6">Bem-vindo!</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="legado-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Senha"
            className="legado-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="legado-button w-full" disabled={loading}>
            {loading ? "Aguarde..." : "Acessar"}
          </button>
        </form>

        <div className="text-center mt-2">
          <button onClick={handleForgotPassword} className="text-sm text-gray-600 underline">
            Esqueci minha senha
          </button>
        </div>

        {show && (
          <div className="mt-4 text-center text-sm text-white bg-green-600 py-2 px-4 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
