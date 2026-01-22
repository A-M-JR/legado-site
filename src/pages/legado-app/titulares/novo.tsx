// src/pages/legado-app/titulares/CadastroTitular.tsx
import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import {
    CheckCircle,
    ArrowLeft,
    User,
    Phone,
    CreditCard,
    Calendar,
    Mail,
    Lock,
    Camera,
    Loader2,
    Eye,
    EyeOff
} from "lucide-react";
import { validarCPF } from "../../../utils/validarCPF";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/Legado - Branco.png";

export default function CadastroTitular() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    variant: "destructive",
                    title: "Imagem muito grande",
                    description: "Selecione uma imagem com até 2MB.",
                });
                return;
            }
            setImagem(file);
            setImagemPreview(URL.createObjectURL(file));
        }
    }

    function senhaForca(s: string) {
        let score = 0;
        if (s.length >= 8) score++;
        if (/[A-Z]/.test(s)) score++;
        if (/[a-z]/.test(s)) score++;
        if (/\d/.test(s)) score++;
        if (/[^A-Za-z0-9]/.test(s)) score++;
        return Math.min(score, 4);
    }

    const forca = useMemo(() => senhaForca(senha), [senha]);

    const forcaConfig = [
        { label: "Fraca", color: "#ef4444" },
        { label: "Razoável", color: "#f97316" },
        { label: "Boa", color: "#eab308" },
        { label: "Forte", color: "#22c55e" },
    ];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        if (!nome || !telefone || !dataNascimento || !email || !senha) {
            toast({
                variant: "destructive",
                title: "Campos obrigatórios",
                description: "Preencha todos os campos para continuar.",
            });
            setLoading(false);
            return;
        }

        if (!validarCPF(cpf)) {
            toast({
                variant: "destructive",
                title: "CPF inválido",
                description: "Verifique o CPF informado.",
            });
            setLoading(false);
            return;
        }

        const parts = dataNascimento.split("/");
        if (parts.length !== 3) {
            toast({
                variant: "destructive",
                title: "Data inválida",
                description: "Use o formato DD/MM/AAAA.",
            });
            setLoading(false);
            return;
        }
        const [d, m, y] = parts;
        const dataNascISO = `${y}-${m}-${d}`;

        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error || !data.user) {
            toast({
                variant: "destructive",
                title: "Erro ao cadastrar",
                description: error?.message || "Tente novamente.",
            });
            setLoading(false);
            return;
        }

        let imagem_url: string | null = null;
        if (imagem) {
            const { data: upload, error: uploadErr } = await supabase.storage
                .from("titulares")
                .upload(`${data.user.id}/perfil.jpg`, imagem, { upsert: true });

            if (!uploadErr) {
                imagem_url = supabase.storage.from("titulares").getPublicUrl(upload.path).data.publicUrl;
            }
        }

        const { error: insertError } = await supabase.from("titulares").insert({
            nome,
            telefone,
            cpf,
            data_nascimento: dataNascISO,
            email,
            imagem_url,
            auth_id: data.user.id,
            falecido: false,
        });

        setLoading(false);

        if (insertError) {
            toast({
                variant: "destructive",
                title: "Erro ao cadastrar",
                description: insertError.message,
            });
            return;
        }

        toast({
            title: "✅ Cadastro realizado!",
            description: "Redirecionando para o login...",
        });
        setTimeout(() => navigate("/legado-app/login", { replace: true }), 1200);
    }

    function sugerirNomeSeVazio() {
        if (!nome && email.includes("@")) {
            const sugest = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            if (sugest) setNome(sugest);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 sm:bg-gradient-to-br sm:from-legado-primary/5 sm:via-white sm:to-legado-primary/10 flex items-center justify-center px-4 py-6 sm:py-10">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] shadow-xl sm:shadow-2xl w-full max-w-[500px] border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-br from-legado-primary to-legado-primary-dark p-6 sm:p-8 pb-24 sm:pb-28 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/5"></div>
                    {/* Botão de Voltar - Área de clique maior e funcional */}
                    <button
                        type="button"
                        onClick={() => navigate("/legado-app/login")}
                        className="absolute top-4 left-4 z-30 p-3 sm:p-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white transition-all active:scale-90 active:bg-white/40 shadow-lg"
                        aria-label="Voltar"
                    >
                        <ArrowLeft size={20} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                    </button>
                    <div className="relative z-10">
                        {/* Aumentei de w-24/28 para w-36/44 */}
                        <img
                            src={logo}
                            alt="Logo"
                            className="mx-auto w-36 sm:w-44 h-auto mb-4 drop-shadow-lg"
                        />
                        <h1 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
                            Criar Conta
                        </h1>
                        <p className="text-white/80 text-sm sm:text-base mt-1 font-medium">
                            Preencha seus dados para começar
                        </p>
                    </div>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-0 space-y-4 sm:space-y-5">
                    <div className="flex flex-col items-center mb-4 sm:mb-6">
                        <div className="relative -mt-14 sm:-mt-16 z-20">
                            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                                {imagemPreview ? (
                                    <img src={imagemPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <User size={36} className="text-legado-primary/30 sm:w-14 sm:h-14" />
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 p-2.5 bg-legado-primary hover:bg-legado-primary-dark text-white rounded-full shadow-lg transition-all active:scale-95 border-2 border-white"
                            >
                                <Camera size={18} />
                            </button>
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-3 uppercase tracking-widest">
                            Foto de perfil
                        </p>
                    </div>
                    {/* Campos de Input */}
                    {[
                        { label: "Nome completo", icon: User, value: nome, setter: setNome, placeholder: "Seu nome completo", type: "text" },
                        { label: "Telefone", icon: Phone, value: telefone, setter: setTelefone, placeholder: "(99) 99999-9999", mask: "(99) 99999-9999" },
                        { label: "CPF", icon: CreditCard, value: cpf, setter: setCpf, placeholder: "000.000.000-00", mask: "999.999.999-99" },
                        { label: "Data de nascimento", icon: Calendar, value: dataNascimento, setter: setDataNascimento, placeholder: "DD/MM/AAAA", mask: "99/99/9999" },
                        { label: "E-mail", icon: Mail, value: email, setter: setEmail, placeholder: "seu@email.com", type: "email", onBlur: sugerirNomeSeVazio }
                    ].map((field, idx) => (
                        <div key={idx} className="space-y-1.5">
                            <label className="text-xs sm:text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                                <field.icon size={14} className="text-legado-primary sm:w-4 sm:h-4" />
                                {field.label} *
                            </label>
                            {field.mask ? (
                                <InputMask mask={field.mask} value={field.value} onChange={(e) => field.setter(e.target.value)}>
                                    {(inputProps: any) => (
                                        <input {...inputProps} className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all text-base" placeholder={field.placeholder} />
                                    )}
                                </InputMask>
                            ) : (
                                <input
                                    type={field.type}
                                    className="w-full px-4 py-3 sm:py-3.5 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all text-base"
                                    value={field.value}
                                    onChange={(e) => field.setter(e.target.value)}
                                    onBlur={field.onBlur}
                                    placeholder={field.placeholder}
                                />
                            )}
                        </div>
                    ))}

                    {/* Senha */}
                    <div className="space-y-1.5">
                        <label className="text-xs sm:text-sm font-semibold text-gray-700 ml-1 flex items-center gap-2">
                            <Lock size={14} className="text-legado-primary sm:w-4 sm:h-4" />
                            Senha *
                        </label>
                        <div className="relative">
                            <input
                                className="w-full px-4 py-3 sm:py-3.5 pr-12 rounded-xl border border-gray-200 focus:border-legado-primary focus:ring-2 focus:ring-legado-primary/20 outline-none transition-all text-base"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                type={mostrarSenha ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-legado-primary transition-colors"
                                onClick={() => setMostrarSenha((v) => !v)}
                            >
                                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Força da Senha */}
                        {senha && (
                            <div className="mt-2 px-1">
                                <div className="flex gap-1.5">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="h-1.5 flex-1 rounded-full transition-all" style={{ backgroundColor: i < forca ? forcaConfig[forca - 1].color : "#e5e7eb" }} />
                                    ))}
                                </div>
                                <p className="text-[10px] sm:text-xs font-bold mt-1" style={{ color: forcaConfig[forca - 1].color }}>
                                    Senha {forcaConfig[forca - 1].label}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botão de Cadastro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-legado-primary to-legado-primary-dark text-white py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-legado-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 sm:mt-6"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
                                Criando conta...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} className="sm:w-5 sm:h-5" />
                                Criar minha conta
                            </>
                        )}
                    </button>

                    {/* Link para Login */}
                    <div className="text-center pt-2 sm:pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/legado-app/login")}
                            className="text-xs sm:text-sm text-gray-600 hover:text-legado-primary font-medium transition-colors"
                        >
                            Já possui uma conta? <span className="font-bold">Fazer login</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}