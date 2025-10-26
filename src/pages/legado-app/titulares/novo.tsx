// src/pages/legado-app/titulares/CadastroTitular.tsx
import { useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import { CheckCircle, ArrowLeft, Image as ImageIcon, Eye, EyeOff, Heart, NotebookPen, Sparkles } from "lucide-react";
import { validarCPF } from "../../../utils/validarCPF";
import "@/styles/legado-app.css";

export default function CadastroTitular() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [alerta, setAlerta] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setAlerta("Selecione uma imagem com até 2MB.");
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

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setAlerta(null);

        if (!nome || !telefone || !dataNascimento || !email || !senha) {
            setAlerta("Preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }

        if (!validarCPF(cpf)) {
            setAlerta("CPF inválido.");
            setLoading(false);
            return;
        }

        // Validação de data simples (DD/MM/AAAA)
        const parts = dataNascimento.split("/");
        if (parts.length !== 3) {
            setAlerta("Data de nascimento inválida.");
            setLoading(false);
            return;
        }
        const [d, m, y] = parts;
        const dataNascISO = `${y}-${m}-${d}`;

        // 1) Cria usuário
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error || !data.user) {
            setAlerta("Erro ao cadastrar usuário: " + (error?.message || "tente novamente"));
            setLoading(false);
            return;
        }

        // 2) Upload imagem (opcional)
        let imagem_url: string | null = null;
        if (imagem) {
            const { data: upload, error: uploadErr } = await supabase.storage
                .from("titulares")
                .upload(`${data.user.id}/perfil.jpg`, imagem, { upsert: true });

            if (uploadErr) {
                setAlerta("Erro ao fazer upload da imagem.");
                setLoading(false);
                return;
            }
            imagem_url = upload?.path
                ? supabase.storage.from("titulares").getPublicUrl(upload.path).data.publicUrl
                : null;
        }

        // 3) Insere titular
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
            setAlerta("Erro ao cadastrar titular: " + insertError.message);
            return;
        }

        setAlerta("Titular cadastrado com sucesso!");
        setTimeout(() => navigate("/legado-app/login", { replace: true }), 1200);
    }

    // Sugere nome a partir do e-mail se nome estiver vazio
    function sugerirNomeSeVazio() {
        if (!nome && email.includes("@")) {
            const sugest = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            if (sugest) setNome(sugest);
        }
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <form className="legado-form-card w-full max-w-md" onSubmit={handleSubmit} autoComplete="off">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 mt-2">
                    <button type="button" onClick={() => navigate(-1)} className="legado-icon-button" aria-label="Voltar">
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-[#255f4f]">Cadastro de Titular</h2>
                    <div style={{ width: 36 }} />
                </div>

                <p className="text-sm text-gray-600 text-center mb-4">
                    Preencha seus dados para começarmos. Você pode alterar depois, se precisar.
                </p>

                {/* Imagem */}
                <div className="flex flex-col items-center mb-5">
                    <div className="relative flex flex-col items-center">
                        <label className="cursor-pointer group">
                            {imagemPreview ? (
                                <img src={imagemPreview} alt="Preview" className="rounded-full w-28 h-28 object-cover border-2 border-[#5BA58C]" />
                            ) : (
                                <div className="rounded-full w-28 h-28 flex items-center justify-center border-2 border-[#5BA58C]">
                                    <ImageIcon size={40} className="text-[#5BA58C]" />
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
                        </label>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-[#d1f2eb] rounded-full shadow font-semibold transition hover:bg-[#b8ebe0] text-[#007080] mt-3"
                            style={{ fontWeight: 600, fontSize: 15 }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon size={18} className="text-[#007080]" />
                            Selecionar imagem
                        </button>
                    </div>
                </div>

                {/* Inputs */}
                <label className="legado-label">Nome *</label>
                <input className="legado-input mb-3" value={nome} onChange={(e) => setNome(e.target.value)} />

                <label className="legado-label">Telefone *</label>
                <InputMask mask="(99) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)}>
                    {(inputProps: any) => <input {...inputProps} className="legado-input mb-3" placeholder="(99) 99999-9999" />}
                </InputMask>

                <label className="legado-label">CPF *</label>
                <InputMask mask="999.999.999-99" value={cpf} onChange={(e) => setCpf(e.target.value)}>
                    {(inputProps: any) => <input {...inputProps} className="legado-input mb-3" placeholder="999.999.999-99" />}
                </InputMask>

                <label className="legado-label">Data de nascimento *</label>
                <InputMask mask="99/99/9999" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)}>
                    {(inputProps: any) => <input {...inputProps} className="legado-input mb-3" placeholder="DD/MM/AAAA" />}
                </InputMask>

                <label className="legado-label">E-mail *</label>
                <input
                    className="legado-input mb-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={sugerirNomeSeVazio}
                    type="email"
                />

                <label className="legado-label">Senha *</label>
                <div className="relative mb-1">
                    <input
                        className="legado-input pr-10"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        type={mostrarSenha ? "text" : "password"}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#eafcf9]"
                        onClick={() => setMostrarSenha((v) => !v)}
                        aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                    >
                        {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Indicador de força da senha */}
                <div className="flex gap-1 mb-4 justify-center" aria-hidden>
                    {[0, 1, 2, 3].map((i) => (
                        <span
                            key={i}
                            style={{
                                width: 36,
                                height: 6,
                                borderRadius: 999,
                                background: i < forca ? ["#f87171", "#fb923c", "#fbbf24", "#34d399"][forca - 1] : "#e5e7eb",
                            }}
                        />
                    ))}
                </div>

                <button type="submit" className="legado-button w-full flex items-center justify-center gap-2" disabled={loading}>
                    {loading ? <span className="animate-spin"><CheckCircle size={20} /></span> : <CheckCircle size={20} />}
                    Cadastrar
                </button>

                {/* Alerta */}
                {alerta && (
                    <div
                        className="legado-alert mt-2"
                        style={{
                            backgroundColor: alerta.toLowerCase().includes("sucesso") ? "#d1f2eb" : "#f8d7da",
                            color: alerta.toLowerCase().includes("sucesso") ? "#256e5c" : "#842029",
                            border: `1px solid ${alerta.toLowerCase().includes("sucesso") ? "#b8ebe0" : "#f5c2c7"}`,
                            fontWeight: 500,
                        }}
                    >
                        {alerta}
                    </div>
                )}
            </form>

            {/* Bottom nav (consistente) */}
            <nav
                className="fixed bottom-3 left-0 right-0 mx-auto max-w-md bg-white/90 backdrop-blur border rounded-xl shadow-sm px-3 py-2 flex items-center justify-around"
                style={{ zIndex: 40 }}
            >
                <button className="text-[#255f4f] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/menu")}>
                    <Heart size={18} /> Menu
                </button>
                <button className="text-[#6c63ff] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/diario")}>
                    <NotebookPen size={18} /> Diário
                </button>
                <button className="text-[#ff9a56] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/exercicios")}>
                    <Sparkles size={18} /> Exercícios
                </button>
            </nav>
        </div>
    );
}