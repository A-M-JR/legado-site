// src/pages/legado-app/dependentes/editar.tsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputMask from "react-input-mask";
import { supabase } from "../../../lib/supabaseClient";
import { validarCPF } from "../../../utils/validarCPF";
import { isValidDateBR } from '../../../utils/formatDateToBR';
import { ArrowLeft, CheckCircle, Camera, Image as ImageIcon, Plus } from "lucide-react";
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
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);

    // Usuário mestre (admin dependente)
    const [isMaster, setIsMaster] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    // Alerta
    const [alerta, setAlerta] = useState("");

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
                setAlerta("Erro ao carregar dados.");
                return;
            }
            setNome(data.nome);
            setTelefone(data.telefone ?? "");
            
            // Formatar data de nascimento para DD/MM/AAAA
            if (data.data_nascimento) {
                const [y, m, d] = data.data_nascimento.split("-");
                setDataNascimento(`${d}/${m}/${y}`);
            }
            
            setImagemAtual(data.imagem_url || null);
            setCpf(data.cpf || "");
            setIsMaster(data.usuario_mestre || false);
            setEmail(data.email || "");
        })();
    }, [id]);

    // Upload imagem
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

    // Salvar
    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();

        if (!nome || !telefone || !dataNascimento) {
            setAlerta("Preencha todos os campos obrigatórios.");
            return;
        }

        if (!isValidDateBR(dataNascimento)) {
            setAlerta('Data de nascimento inválida!');
            return;
        }

        if (cpf && !validarCPF(cpf)) {
            setAlerta("CPF inválido.");
            return;
        }

        setLoading(true);

        try {
            let imagemUrl = imagemAtual;

            if (imagem && id) {
                const fileExt = imagem.name.split(".").pop();
                const fileName = `dependente_${id}_${Date.now()}.${fileExt}`;
                const filePath = `perfil/${fileName}`;

                // Upload no bucket
                const { error: uploadError } = await supabase.storage
                    .from("dependentes")
                    .upload(filePath, imagem, { upsert: true });

                if (uploadError) throw uploadError;

                // Obter URL pública
                const { data: urlData } = supabase.storage.from("dependentes").getPublicUrl(filePath);
                imagemUrl = urlData.publicUrl;
            }

            // Converte data para formato ISO
            const [d, m, y] = dataNascimento.split("/");
            const dataISO = `${y}-${m}-${d}`;

            // Atualiza dados no banco
            const { error: updateError } = await supabase
                .from("dependentes")
                .update({
                    nome,
                    telefone,
                    cpf: cpf || null,
                    data_nascimento: dataISO,
                    usuario_mestre: isMaster,
                    email: isMaster ? email : null,
                    imagem_url: imagemUrl,
                })
                .eq("id", id);

            if (updateError) throw updateError;

            setAlerta("Dados salvos com sucesso!");
            setTimeout(() => navigate(-1), 1600);

        } catch (error: any) {
            setAlerta("Erro ao salvar alterações: " + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="legado-app-wrapper min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md space-y-6">
                
                {/* Top Bar - Botão Voltar */}
                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-[#255f4f] font-bold text-sm bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                    <div className="opacity-20">
                        <CheckCircle size={20} className="text-[#255f4f]" />
                    </div>
                </div>
                
                {/* Título */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <h2 className="text-2xl font-bold tracking-tight text-[#255f4f]">Editar Dependente</h2>
                    <p className="text-base text-[#4f665a] opacity-80">Atualize as informações da pessoa</p>
                </div>

                {/* Form Card */}
                <form
                    className="bg-white rounded-2xl p-6 shadow-lg border border-[#def0e8] animate-in zoom-in-95 duration-300 space-y-5"
                    onSubmit={handleSalvar}
                    autoComplete="off"
                >
                    {/* Imagem de perfil */}
                    <div className="flex flex-col items-center pb-4 border-b border-[#def0e8]">
                        <div className="relative group mb-4">
                            <label htmlFor="fileInput" className="cursor-pointer">
                                {imagemPreview ? (
                                    <img
                                        src={imagemPreview}
                                        alt="Preview"
                                        className="rounded-full w-28 h-28 object-cover border-4 border-[#5BA58C] shadow-lg group-hover:opacity-90 transition-all"
                                    />
                                ) : imagemAtual ? (
                                    <img
                                        src={imagemAtual}
                                        alt="Dependente"
                                        className="rounded-full w-28 h-28 object-cover border-4 border-[#5BA58C] shadow-lg group-hover:opacity-90 transition-all"
                                    />
                                ) : (
                                    <div className="bg-gradient-to-br from-[#f5fbf9] to-[#e0f0ec] rounded-full w-28 h-28 flex items-center justify-center border-4 border-[#5BA58C] shadow-lg group-hover:scale-105 transition-all">
                                        <Camera size={40} className="text-[#5BA58C]" />
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
                            {/* Badge de edição */}
                            <div className="absolute bottom-1 right-1 bg-[#5BA58C] p-2 rounded-full border-3 border-white shadow-md group-hover:scale-110 transition-transform">
                                <Camera size={16} className="text-white" />
                            </div>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[#007080] bg-[#d1f2eb] font-bold text-sm hover:bg-[#b8ebe0] transition-all active:scale-95 shadow-sm"
                            onClick={() => document.getElementById("fileInput")?.click()}
                        >
                            <ImageIcon size={18} />
                            Alterar foto
                        </button>
                    </div>

                    {/* Campos */}
                    <div className="space-y-4">
                        <div>
                            <label className="legado-form-label text-base">Nome completo *</label>
                            <input
                                className="legado-input text-base"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome"
                            />
                        </div>

                        <div>
                            <label className="legado-form-label text-base">Telefone *</label>
                            <InputMask
                                className="legado-input text-base"
                                value={telefone}
                                onChange={(e) => setTelefone(e.target.value)}
                                mask="(99) 99999-9999"
                                placeholder="(99) 99999-9999"
                            />
                        </div>

                        <div>
                            <label className="legado-form-label text-base">CPF (opcional)</label>
                            <InputMask
                                className="legado-input text-base"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                mask="999.999.999-99"
                                placeholder="999.999.999-99"
                            />
                        </div>

                        <div>
                            <label className="legado-form-label text-base">Data de nascimento *</label>
                            <InputMask
                                className="legado-input text-base"
                                value={dataNascimento}
                                onChange={(e) => setDataNascimento(e.target.value)}
                                mask="99/99/9999"
                                placeholder="DD/MM/AAAA"
                            />
                        </div>
                    </div>

                    {/* Botão de submit */}
                    <button
                        type="submit"
                        className="legado-button w-full flex items-center justify-center gap-2 mt-6 text-base py-3.5 shadow-lg hover:shadow-xl transition-all"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={20} /> Salvar Alterações
                            </>
                        )}
                    </button>

                    {/* Alerta */}
                    {alerta && (
                        <div
                            className={`p-4 rounded-xl font-semibold text-sm text-center animate-in slide-in-from-top duration-300 ${
                                alerta.toLowerCase().includes("sucesso") || alerta.toLowerCase().includes("salvos")
                                    ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                                    : "bg-red-50 text-red-700 border-2 border-red-200"
                            }`}
                        >
                            {alerta}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}