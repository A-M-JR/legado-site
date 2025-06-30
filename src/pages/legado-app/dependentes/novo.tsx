// src/pages/legado-app/dependentes/novo.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, Image as ImageIcon, CheckCircle, ArrowLeft } from "lucide-react";
import "@/styles/legado-app.css";
import { validarCPF } from "../../../utils/validarCPF";
import { isValidDateBR } from '../../../utils/formatDateToBR';


export default function NovoDependentePage() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [alerta, setAlerta] = useState<string | null>(null);

    // Upload da imagem para Supabase Storage e retorna a URL pública
    async function uploadImagem(file: File, dependenteId: string) {
        const ext = file.name.split(".").pop();
        const fileName = `dependente_${dependenteId}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from("dependentes")
            .upload(`perfil/${fileName}`, file, {
                upsert: false,
            });

        if (error) {
            setAlerta("Erro ao enviar imagem: " + error.message);
            return null;
        }
        // Pega URL pública
        const { data } = supabase.storage
            .from("dependentes")
            .getPublicUrl(`perfil/${fileName}`);
        return data?.publicUrl ?? null;
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                setAlerta("Selecione uma imagem com menos de 1MB.");
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

        if (!nome || !telefone || !dataNascimento) {
            setAlerta("Preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }

        if (!nome || !telefone || !dataNascimento) {
            setAlerta("Preencha todos os campos obrigatórios.");
            setLoading(false);
            return;
        }
        if (!validarCPF(cpf)) {
            setAlerta("CPF inválido.");
            setLoading(false);
            return;
        }

        // Busca o titular logado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setAlerta("Usuário não autenticado.");
            setLoading(false);
            return;
        }
        const { data: titularData } = await supabase
            .from("titulares")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();

        if (!titularData) {
            setAlerta("Titular não encontrado.");
            setLoading(false);
            return;
        }

        // Cadastra o dependente
        const { data: dependenteResult, error: insertError } = await supabase
            .from("dependentes")
            .insert({
                nome,
                telefone,
                cpf,
                data_nascimento: dataNascimento,
                id_titular: titularData.id,
            })
            .select("id")
            .single();

        if (insertError || !dependenteResult) {
            setAlerta(insertError?.message || "Erro ao cadastrar dependente.");
            setLoading(false);
            return;
        }

        // Upload da imagem, se houver
        if (imagem) {
            const imagemUrl = await uploadImagem(imagem, dependenteResult.id);
            if (imagemUrl) {
                await supabase
                    .from("dependentes")
                    .update({ imagem_url: imagemUrl })
                    .eq("id", dependenteResult.id);
            }
        }

        setLoading(false);
        navigate(-1);
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-2">
            <form
                className="legado-form-card w-full max-w-md"
                onSubmit={handleSubmit}
                autoComplete="off"
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-6 mt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="legado-icon-button"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <h2 className="text-xl font-bold text-[#255f4f] text-center flex-1">
                        Cadastro de Dependente
                    </h2>
                </div>

                {/* Imagem de perfil */}
                <div className="flex flex-col items-center mb-4">
                    {/* Avatar Preview */}
                    <div className="relative mb-2">
                        <label htmlFor="fileInput">
                            {imagemPreview ? (
                                <img
                                    src={imagemPreview}
                                    alt="Preview"
                                    className="rounded-full w-24 h-24 object-cover border-2 border-[#5BA58C] cursor-pointer hover:opacity-80 transition"
                                />
                            ) : (
                                <div className="bg-[#f5fbf9] rounded-full w-24 h-24 flex items-center justify-center border-2 border-[#5BA58C] cursor-pointer hover:bg-[#e0f0ec] transition">
                                    <ImageIcon size={38} className="text-[#5BA58C]" />
                                </div>
                            )}
                            <input
                                id="fileInput"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </label>
                        {/* Ícone de editar */}
                        <div className="absolute bottom-0 right-0 bg-[#5BA58C] p-1 rounded-full border-2 border-white">
                            <ImageIcon size={16} className="text-white" />
                        </div>
                    </div>
                    {/* Botão abaixo */}
                    <button
                        type="button"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[#007080] bg-[#d1f2eb] font-semibold text-sm hover:bg-[#b8ebe0] transition"
                        onClick={() => document.getElementById("fileInput")?.click()}
                        style={{ marginTop: 2 }}
                    >
                        <ImageIcon size={16} />
                        Selecionar imagem
                    </button>
                </div>

                {/* Campos */}
                <label className="legado-label">Nome *</label>
                <input
                    className="legado-input mb-3"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <label className="legado-label">Telefone *</label>
                <InputMask
                    className="legado-input mb-3"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    mask="(99) 99999-9999"
                    placeholder="(99) 99999-9999"
                />

                <label className="legado-label">CPF *</label>
                <InputMask
                    className="legado-input mb-3"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    mask="999.999.999-99"
                    placeholder="999.999.999-99"
                />

                <label className="legado-label">Data de nascimento *</label>
                <InputMask
                    className="legado-input mb-3"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    mask="99/99/9999"
                    placeholder="DD/MM/AAAA"
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
                            <Plus size={20} /> Cadastrar
                        </>
                    )}
                </button>

                {/* Alerta */}
                {alerta && (
                    <div className="legado-alert" style={{ marginTop: 12 }}>
                        {alerta}
                        <button
                            style={{
                                marginLeft: 8,
                                background: "none",
                                border: "none",
                                color: "#fff",
                                fontWeight: 700,
                                cursor: "pointer",
                            }}
                            type="button"
                            onClick={() => setAlerta(null)}
                        >
                            x
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}
