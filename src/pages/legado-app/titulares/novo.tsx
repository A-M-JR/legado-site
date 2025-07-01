import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import { CheckCircle, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { validarCPF } from "../../../utils/validarCPF";
import { isValidDateBR } from "../../../utils/formatDateToBR";
import "@/styles/legado-app.css";

export default function CadastroTitular() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [alerta, setAlerta] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // REF do input file
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

        // Converte data BR para ISO
        const [d, m, y] = dataNascimento.split("/");
        const dataNascISO = `${y}-${m}-${d}`;

        // 1. Cria usuário no Auth do Supabase
        const { data, error } = await supabase.auth.signUp({ email, password: senha });
        if (error || !data.user) {
            setAlerta("Erro ao cadastrar usuário: " + error?.message);
            setLoading(false);
            return;
        }

        // 2. Upload da imagem se houver
        let imagem_url = null;
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

        // 3. Insere titular no banco
        const { error: insertError } = await supabase.from("titulares").insert({
            nome,
            telefone,
            cpf,
            data_nascimento: dataNascISO,
            email,
            imagem_url,
            auth_id: data.user.id,
        });

        setLoading(false);

        if (insertError) {
            setAlerta("Erro ao cadastrar titular: " + insertError.message);
            return;
        }

        setAlerta("Titular cadastrado com sucesso!");
        setTimeout(() => navigate("/legado-app/login", { replace: true }), 1400);
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-2">
            <form className="legado-form-card w-full max-w-md" onSubmit={handleSubmit} autoComplete="off">
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 mt-2">
                    <button type="button" onClick={() => navigate(-1)} className="legado-icon-button">
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-xl font-bold text-[#255f4f] text-center flex-1">
                        Cadastro de Titular
                    </h2>
                </div>

                {/* Imagem */}
                <div className="flex flex-col items-center mb-6 mt-2">
                    <div className="relative flex flex-col items-center">
                        {/* Círculo de imagem */}
                        <label className="cursor-pointer group">
                            {imagemPreview ? (
                                <img
                                    src={imagemPreview}
                                    alt="Preview"
                                    className="rounded-full w-32 h-32 object-cover border-2 border-[#5BA58C]"
                                />
                            ) : (
                                <div className="rounded-full w-32 h-32 flex items-center justify-center border-2 border-[#5BA58C]">
                                    <ImageIcon size={48} className="text-[#5BA58C]" />
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageChange}
                            />
                        </label>
                        {/* Botão centralizado abaixo do círculo */}
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 bg-[#d1f2eb] rounded-full shadow font-semibold transition hover:bg-[#b8ebe0] text-[#007080] mt-4"
                            style={{ fontWeight: 600, fontSize: 16 }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon size={18} className="text-[#007080]" />
                            Selecionar imagem
                        </button>
                    </div>
                </div>
                {/* Inputs */}
                <label className="legado-label">Nome *</label>
                <input
                    className="legado-input mb-3"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                />

                <label className="legado-label">Telefone *</label>
                <InputMask
                    mask="(99) 99999-9999"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                >
                    {(inputProps: any) => (
                        <input
                            {...inputProps}
                            className="legado-input mb-3"
                            placeholder="(99) 99999-9999"
                        />
                    )}
                </InputMask>

                <label className="legado-label">CPF *</label>
                <InputMask
                    mask="999.999.999-99"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                >
                    {(inputProps: any) => (
                        <input
                            {...inputProps}
                            className="legado-input mb-3"
                            placeholder="999.999.999-99"
                        />
                    )}
                </InputMask>

                <label className="legado-label">Data de nascimento *</label>
                <InputMask
                    mask="99/99/9999"
                    value={dataNascimento}
                    onChange={e => setDataNascimento(e.target.value)}
                >
                    {(inputProps: any) => (
                        <input
                            {...inputProps}
                            className="legado-input mb-3"
                            placeholder="DD/MM/AAAA"
                        />
                    )}
                </InputMask>

                <label className="legado-label">E-mail *</label>
                <input
                    className="legado-input mb-3"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                />

                <label className="legado-label">Senha *</label>
                <input
                    className="legado-input mb-4"
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    type="password"
                    autoComplete="new-password"
                />

                <button
                    type="submit"
                    className="legado-button w-full flex items-center justify-center gap-2"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="animate-spin"><CheckCircle size={20} /></span>
                    ) : (
                        <>
                            <CheckCircle size={20} /> Cadastrar
                        </>
                    )}
                </button>

                {/* Alerta */}
                {alerta && (
                    <div
                        className="legado-alert mt-2"
                        style={{
                            backgroundColor: alerta.toLowerCase().includes("sucesso") ? "#d1f2eb" : "#f8d7da",
                            color: alerta.toLowerCase().includes("sucesso") ? "#256e5c" : "#842029",
                            border: `1px solid ${alerta.toLowerCase().includes("sucesso") ? "#b8ebe0" : "#f5c2c7"}`,
                            fontWeight: 500
                        }}
                    >
                        {alerta}
                    </div>
                )}
            </form>
        </div>
    );
}
