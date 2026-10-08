// src/pages/legado-app/titulares/EditarTitularPage.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { validarCPF } from "../../../utils/validarCPF";
import { isValidDateBR } from "../../../utils/formatDateToBR";
import { dataBRParaISO, dataISOParaBR, isTelefoneValido, limparNome, maskCPF, maskDataBR, maskTelefone } from "@/lib/masks";
import { ArrowLeft, KeyRound, Eye, EyeOff, Camera, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";
import LegadoNav, { LEGADO_NAV_ESPACO } from "@/components/legado/LegadoNav";
import "@/styles/legado-app.css";

export default function EditarTitularPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Campos
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemUrl, setImagemUrl] = useState<string | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);

    // UI
    const [loading, setLoading] = useState(false);
    const [carregandoDados, setCarregandoDados] = useState(true);
    const [alerta, setAlerta] = useState("");
    const [showSenhaModal, setShowSenhaModal] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Carregar titular
    useEffect(() => {
        (async () => {
            try {
                if (!id) return;
                const { data, error } = await supabase.from("titulares").select("*").eq("id", id).single();
                if (error || !data) {
                    setAlerta("Erro ao carregar dados.");
                    return;
                }
                setNome(data.nome || "");
                setTelefone(maskTelefone(data.telefone || ""));
                setCpf(maskCPF(data.cpf || ""));
                // Aceita ISO (yyyy-MM-dd) e dd/MM/aaaa.
                setDataNascimento(data.data_nascimento ? dataISOParaBR(data.data_nascimento) : "");
                setEmail(data.email || "");
                setImagemUrl(data.imagem_url || null);
            } catch {
                setAlerta("Erro ao carregar dados.");
            } finally {
                setCarregandoDados(false);
            }
        })();
    }, [id]);

    // Upload de imagem
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

    // Máscaras simples
    // Força da senha (feedback simples)
    function senhaForca(s: string) {
        let score = 0;
        if (s.length >= 8) score++;
        if (/[A-Z]/.test(s)) score++;
        if (/[a-z]/.test(s)) score++;
        if (/\d/.test(s)) score++;
        if (/[^A-Za-z0-9]/.test(s)) score++;
        return Math.min(score, 4);
    }
    const forca = useMemo(() => senhaForca(novaSenha), [novaSenha]);

    // Salvar alterações
    async function handleSalvar(e: React.FormEvent) {
        e.preventDefault();
        
        if (!limparNome(nome) || !telefone || !dataNascimento || !email) {
            setAlerta("Preencha todos os campos obrigatórios.");
            return;
        }
        if (!isTelefoneValido(telefone)) {
            setAlerta("Telefone inválido. Informe DDD + número.");
            return;
        }
        if (!isValidDateBR(dataNascimento)) {
            setAlerta("Data de nascimento inválida.");
            return;
        }
        if (!validarCPF(cpf)) {
            setAlerta("CPF inválido.");
            return;
        }
        setLoading(true);

        const dataIso = dataBRParaISO(dataNascimento);

        try {
            // Atualiza dados
            const { error: updateError } = await supabase
                .from("titulares")
                .update({ nome: limparNome(nome), telefone, data_nascimento: dataIso, email, cpf })
                .eq("id", id);
            if (updateError) throw updateError;

            // Upload imagem (opcional)
            if (imagem && id) {
                const fileExt = imagem.name.split(".").pop();
                const fileName = `perfil_${id}_${Date.now()}.${fileExt}`;
                const filePath = `perfil/${fileName}`;

                const { error: uploadError } = await supabase.storage.from("titulares").upload(filePath, imagem, { upsert: true });
                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage.from("titulares").getPublicUrl(filePath);
                const publicUrl = urlData?.publicUrl;

                const { error: urlUpdateError } = await supabase.from("titulares").update({ imagem_url: publicUrl }).eq("id", id);
                if (urlUpdateError) throw urlUpdateError;

                setImagemUrl(publicUrl || null);
            }

            setAlerta("Dados atualizados com sucesso.");
            setTimeout(() => navigate(-1), 1200);
        } catch (error: any) {
            setAlerta("Erro ao salvar dados: " + (error?.message || "tente novamente"));
        } finally {
            setLoading(false);
        }
    }

    // Trocar senha
    async function handleTrocarSenha() {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            setAlerta("Preencha todos os campos da senha.");
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setAlerta("A nova senha e a confirmação não coincidem.");
            return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: senhaAtual });
        if (signInError) {
            setAlerta("Senha atual incorreta.");
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        if (error) {
            setAlerta("Erro ao alterar senha: " + error.message);
        } else {
            setAlerta("Senha alterada com sucesso.");
            setShowSenhaModal(false);
            setSenhaAtual("");
            setNovaSenha("");
            setConfirmarSenha("");
        }
    }

    return (
        <div className={`legado-app-wrapper min-h-screen flex flex-col items-center px-4 pt-6 bg-gradient-to-b from-tema-fundo-topo to-tema-fundo-base ${LEGADO_NAV_ESPACO}`}>
            <div className="w-full max-w-md md:max-w-xl space-y-6">
                
                {/* Top Bar - Botão Voltar */}
                <div className="flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-1.5 text-tema-titulo font-bold text-sm bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>
                    <div className="opacity-20">
                        <CheckCircle size={20} className="text-tema-titulo" />
                    </div>
                </div>
                
                {/* Título */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <h2 className="text-2xl font-bold tracking-tight text-tema-titulo">Editar Perfil</h2>
                    <p className="text-base text-tema-texto opacity-80">Atualize seus dados com tranquilidade</p>
                </div>

                {/* Form Card */}
                <form
                    className="bg-white rounded-2xl p-6 shadow-lg border border-tema-borda animate-in zoom-in-95 duration-300 space-y-5"
                    onSubmit={handleSalvar}
                    autoComplete="off"
                >
                    {carregandoDados ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Imagem de perfil */}
                            <div className="flex flex-col items-center pb-4 border-b border-tema-borda">
                                <div className="relative group mb-4">
                                    <label htmlFor="fileInput" className="cursor-pointer">
                                        {imagemPreview ? (
                                            <img
                                                src={imagemPreview}
                                                alt="Preview"
                                                className="rounded-full w-28 h-28 object-cover border-4 border-tema-primaria shadow-lg group-hover:opacity-90 transition-all"
                                            />
                                        ) : imagemUrl ? (
                                            <img
                                                src={imagemUrl}
                                                alt="Titular"
                                                className="rounded-full w-28 h-28 object-cover border-4 border-tema-primaria shadow-lg group-hover:opacity-90 transition-all"
                                            />
                                        ) : (
                                            <div className="bg-gradient-to-br from-tema-claro-2 to-tema-borda rounded-full w-28 h-28 flex items-center justify-center border-4 border-tema-primaria shadow-lg group-hover:scale-105 transition-all">
                                                <Camera size={40} className="text-tema-primaria" />
                                            </div>
                                        )}
                                        <input
                                            id="fileInput"
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    {/* Badge de edição */}
                                    <div className="absolute bottom-1 right-1 bg-tema-primaria p-2 rounded-full border-3 border-white shadow-md group-hover:scale-110 transition-transform">
                                        <Camera size={16} className="text-white" />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-tema-destaque bg-tema-destaque-claro font-bold text-sm hover:bg-tema-borda-forte transition-all active:scale-95 shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
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
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="legado-form-label text-base">Telefone *</label>
                                    <input
                                        className="legado-input text-base"
                                        value={telefone}
                                        onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                                        type="tel"
                                        inputMode="tel"
                                        autoComplete="tel-national"
                                        placeholder="(99) 99999-9999"
                                        maxLength={15}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="legado-form-label text-base">CPF *</label>
                                    <input
                                        className="legado-input text-base"
                                        value={cpf}
                                        onChange={(e) => setCpf(maskCPF(e.target.value))}
                                        inputMode="numeric"
                                        placeholder="999.999.999-99"
                                        maxLength={14}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="legado-form-label text-base">Data de nascimento *</label>
                                    <input
                                        className="legado-input text-base"
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(maskDataBR(e.target.value))}
                                        inputMode="numeric"
                                        placeholder="DD/MM/AAAA"
                                        maxLength={10}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="legado-form-label text-base">E-mail *</label>
                                    <input
                                        className="legado-input text-base"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Botão Alterar Senha */}
                            <button
                                type="button"
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-tema-primaria bg-tema-claro-2 font-bold text-base hover:bg-tema-borda transition-all active:scale-95 shadow-sm"
                                onClick={() => setShowSenhaModal(true)}
                            >
                                <KeyRound size={20} />
                                Alterar senha
                            </button>

                            {/* Botão de submit */}
                            <button
                                type="submit"
                                className="legado-button w-full flex items-center justify-center gap-2 text-base py-3.5 shadow-lg hover:shadow-xl transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
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
                                        alerta.toLowerCase().includes("sucesso") || alerta.toLowerCase().includes("atualizados")
                                            ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                                            : "bg-red-50 text-red-700 border-2 border-red-200"
                                    }`}
                                >
                                    {alerta}
                                </div>
                            )}
                        </>
                    )}
                </form>
            </div>

            {/* Modal de Senha */}
            {showSenhaModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4" onClick={() => setShowSenhaModal(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-center mb-4 text-tema-titulo">Alterar Senha</h3>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    className="legado-input pr-10 text-base"
                                    type={mostrarSenhaAtual ? "text" : "password"}
                                    placeholder="Senha atual"
                                    value={senhaAtual}
                                    onChange={(e) => setSenhaAtual(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                                    onClick={() => setMostrarSenhaAtual((v) => !v)}
                                >
                                    {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    className="legado-input pr-10 text-base"
                                    type={mostrarNovaSenha ? "text" : "password"}
                                    placeholder="Nova senha"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                                    onClick={() => setMostrarNovaSenha((v) => !v)}
                                >
                                    {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    className="legado-input pr-10 text-base"
                                    type={mostrarConfirmarSenha ? "text" : "password"}
                                    placeholder="Confirmar nova senha"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                />
                                <button 
                                    type="button" 
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" 
                                    onClick={() => setMostrarConfirmarSenha((v) => !v)}
                                >
                                    {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Indicador de força da senha */}
                        {novaSenha && (
                            <div className="flex gap-1 mt-3 justify-center">
                                {[0, 1, 2, 3].map((i) => (
                                    <span
                                        key={i}
                                        className="h-1.5 flex-1 rounded-full transition-all"
                                        style={{
                                            background: i < forca ? ["#f87171", "#fb923c", "#fbbf24", "#34d399"][forca - 1] : "#e5e7eb",
                                        }}
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2 mt-5">
                            <button 
                                className="flex-1 py-2.5 rounded-xl text-tema-primaria bg-tema-claro-2 font-bold hover:bg-tema-borda transition-all" 
                                onClick={() => setShowSenhaModal(false)}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="flex-1 legado-button py-2.5" 
                                onClick={handleTrocarSenha}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <LegadoNav />
        </div>
    );
}