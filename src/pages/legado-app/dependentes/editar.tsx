// src/pages/legado-app/dependentes/editar.tsx

import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import { validarCPF } from "../../../utils/validarCPF";
import { isValidDateBR } from '../../../utils/formatDateToBR';
import { UserCircle, ArrowLeft, CheckCircle, KeyRound } from "lucide-react";
import "@/styles/legado-app.css";

export default function EditarDependentePage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados dos campos
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemAtual, setImagemAtual] = useState<string | null>(null);

    // Usuário mestre (admin dependente)
    const [isMaster, setIsMaster] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    // Alerta
    const [alerta, setAlerta] = useState("");
    const [showAlert, setShowAlert] = useState(false);

    // Carregar dependente
    useEffect(() => {
        (async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("dependentes")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !data) {
                showError("Erro ao carregar dados.");
                return;
            }
            setNome(data.nome);
            setTelefone(data.telefone ?? "");
            setDataNascimento(data.data_nascimento ?? "");
            setImagemAtual(data.imagem_url || null);
            setCpf(data.cpf || "");
            setIsMaster(data.usuario_mestre || false);
            setEmail(data.email || "");
        })();
        // eslint-disable-next-line
    }, [id]);

    function showError(msg: string) {
        setAlerta(msg);
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 2500);
    }

    // Upload imagem
    async function handleImagem(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) setImagem(file);
    }

    // Salvar
    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();

        if (!nome || !telefone || !dataNascimento) {
            showError("Preencha todos os campos obrigatórios.");
            return;
        }
        if (!validarCPF(cpf)) {
            showError("CPF inválido.");
            return;
        }

        if (!isValidDateBR(dataNascimento)) {
            showError('Data de nascimento inválida!')
            return
        }

        setLoading(true);

        try {
            let imagemUrl = imagemAtual;

            if (imagem && id) {
                const fileExt = imagem.name.split(".").pop();
                const fileName = `dependente-${id}.${fileExt}`;
                const filePath = `dependentes/${fileName}`;

                // Upload no bucket (ex: 'public')
                const { error: uploadError } = await supabase.storage
                    .from("dependentes")
                    .upload(filePath, imagem, { upsert: true });

                if (uploadError) throw uploadError;

                // Obter URL pública
                const { data: urlData } = supabase.storage.from("dependentes").getPublicUrl(filePath);
                imagemUrl = urlData.publicUrl;
                setImagemAtual(imagemUrl);
            }

            // Atualiza dados no banco com a URL da imagem atualizada

            const { error: updateError } = await supabase
                .from("dependentes")
                .update({
                    nome,
                    telefone,
                    cpf,
                    data_nascimento: dataNascimento,
                    usuario_mestre: isMaster,
                    email: isMaster ? email : null,
                    imagem_url: imagemUrl,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            setAlerta("Dados salvos com sucesso!");
            setShowAlert(true);
            setTimeout(() => navigate(-1), 1600);

        } catch (error: any) {
            showError("Erro ao salvar alterações: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
            <form className="legado-form-card w-full max-w-md" onSubmit={handleSalvar} autoComplete="off">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                    <button onClick={() => navigate(-1)} className="legado-icon-button">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: "#356c6f", margin: 0 }}>
                        Editar Dependente
                    </h2>
                </div>

                {/* Avatar */}
                <div style={{ textAlign: "center", marginBottom: 12 }}>
                    {imagem ? (
                        <img
                            src={URL.createObjectURL(imagem)}
                            alt="Preview"
                            className="mx-auto w-24 h-24 rounded-full object-cover border-2 border-[#5ba58c]"
                            style={{ marginBottom: 8 }}
                        />
                    ) : imagemAtual ? (
                        <img
                            src={imagemAtual}
                            alt="Dependente"
                            className="mx-auto w-24 h-24 rounded-full object-cover border-2 border-[#5ba58c]"
                            style={{ marginBottom: 8 }}
                        />
                    ) : (
                        <UserCircle size={96} className="mx-auto mb-2 text-gray-300" />
                    )}
                    <label
                        className="block legado-button"
                        style={{
                            background: "#f1faf5",
                            color: "#5ba58c",
                            minWidth: 180,
                            fontWeight: 600,
                            margin: "0 auto",
                            cursor: "pointer"
                        }}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImagem}
                            style={{ display: "none" }}
                        />
                        Selecionar imagem
                    </label>
                </div>

                {/* Form */}
                <label className="legado-form-label">Nome:</label>
                <input className="legado-input" value={nome} onChange={e => setNome(e.target.value)} />

                <label className="legado-form-label">Telefone:</label>
                <InputMask
                    mask="(99) 99999-9999"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                >
                    {(inputProps: any) => <input {...inputProps} className="legado-input" />}
                </InputMask>

                <label className="legado-form-label">CPF:</label>
                <InputMask
                    mask="999.999.999-99"
                    value={cpf}
                    onChange={e => setCpf(e.target.value)}
                >
                    {(inputProps: any) => <input {...inputProps} className="legado-input" />}
                </InputMask>

                <label className="legado-form-label">Data de Nascimento:</label>
                <InputMask
                    mask="99/99/9999"
                    value={dataNascimento}
                    onChange={e => setDataNascimento(e.target.value)}
                    placeholder="DD/MM/AAAA"
                >
                    {(inputProps: any) => <input {...inputProps} className="legado-input" />}
                </InputMask>

                {/* Checkbox Usuário Mestre */}
                {/* <div className="legado-checkbox" style={{ margin: "14px 0 8px 0" }}>
                    <input
                        type="checkbox"
                        checked={isMaster}
                        id="isMaster"
                        onChange={() => setIsMaster(!isMaster)}
                    />
                    <label htmlFor="isMaster" style={{ fontWeight: 600, color: "#5ba58c", cursor: "pointer" }}>
                        Transformar em usuário mestre
                    </label>
                </div>

                {isMaster && (
                    <>
                        <label className="legado-form-label">E-mail:</label>
                        <input
                            className="legado-input"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />

                        <label className="legado-form-label">Senha:</label>
                        <input
                            className="legado-input"
                            type="password"
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                        />
                    </>
                )} */}

                <button
                    className="legado-button w-full"
                    type="submit"
                    style={{ marginTop: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                    disabled={loading}
                >
                    {loading
                        ? <span className="loader" style={{ width: 18, height: 18 }} />
                        : (<>
                            <CheckCircle size={18} className="mr-2" />
                            Salvar Alterações
                        </>)
                    }
                </button>

                {/* ALERTA */}
                {showAlert && (
                    <div
                        className="legado-alert"
                        style={{
                            marginTop: 14,
                            backgroundColor: alerta.includes("sucesso") ? "#d1f2eb" : "#f8d7da",
                            color: alerta.includes("sucesso") ? "#256e5c" : "#842029",
                            border: `1px solid ${alerta.includes("sucesso") ? "#b8ebe0" : "#f5c2c7"}`
                        }}
                    >
                        {alerta}
                    </div>
                )}
            </form>
        </div>
    );
}
