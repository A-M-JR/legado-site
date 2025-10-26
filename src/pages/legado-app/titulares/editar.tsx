// src/pages/legado-app/titulares/EditarTitularPage.tsx
import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { validarCPF } from "../../../utils/validarCPF";
import { UserCircle, ArrowLeft, KeyRound, Eye, EyeOff, Heart, NotebookPen, Sparkles, Image as ImageIcon } from "lucide-react";
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
                setTelefone(data.telefone || "");
                setCpf(data.cpf || "");
                setDataNascimento(data.data_nascimento ? data.data_nascimento.split("-").reverse().join("/") : "");
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
    function handleImagem(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setAlerta("Selecione uma imagem com até 2MB.");
                return;
            }
            setImagem(file);
            setImagemUrl(URL.createObjectURL(file));
        }
    }

    // Máscaras simples
    function maskPhone(value: string) {
        return value.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 15);
    }
    function maskCPF(value: string) {
        return value.replace(/\D/g, "").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2").slice(0, 14);
    }
    function maskDate(value: string) {
        value = value.replace(/\D/g, "");
        if (value.length > 2 && value.length <= 4) value = value.replace(/(\d{2})(\d+)/, "$1/$2");
        else if (value.length > 4) value = value.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        return value.slice(0, 10);
    }

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
    async function handleSalvar() {
        if (!nome || !telefone || !dataNascimento || !email) {
            setAlerta("Preencha todos os campos obrigatórios.");
            return;
        }
        if (!validarCPF(cpf)) {
            setAlerta("CPF inválido.");
            return;
        }
        setLoading(true);

        const dataIso = dataNascimento.split("/").reverse().join("-");

        try {
            // Atualiza dados
            const { error: updateError } = await supabase
                .from("titulares")
                .update({ nome, telefone, data_nascimento: dataIso, email, cpf })
                .eq("id", id);
            if (updateError) throw updateError;

            // Upload imagem (opcional)
            if (imagem && id) {
                const fileExt = imagem.name.split(".").pop();
                const fileName = `perfil-${id}.${fileExt}`;
                const filePath = `titulares/${fileName}`;

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
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="legado-form-card w-full max-w-md relative">
                {/* Header */}
                <div className="flex items-center justify-between mb-3 mt-2">
                    <button onClick={() => navigate(-1)} className="legado-icon-button" aria-label="Voltar">
                        <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-[#255f4f]">Editar Titular</h2>
                    <div style={{ width: 36 }} />
                </div>

                {/* Microcopy */}
                <p className="text-sm text-gray-600 text-center mb-4">Atualize seus dados com tranquilidade. Você pode mudar a senha quando quiser.</p>

                {/* Foto */}
                <div className="flex flex-col items-center mb-5">
                    <label className="cursor-pointer group">
                        {imagemUrl ? (
                            <img src={imagemUrl} alt="Titular" className="rounded-full w-28 h-28 object-cover border-2 border-[#5BA58C]" />
                        ) : (
                            <div className="rounded-full w-28 h-28 flex items-center justify-center border-2 border-[#5BA58C] bg-white">
                                <UserCircle size={44} className="text-[#5BA58C]" />
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagem} />
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

                {/* Form */}
                {carregandoDados ? (
                    <div className="space-y-3 mb-4">
                        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); handleSalvar(); }} className="space-y-2">
                        <label className="legado-label">Nome</label>
                        <input className="legado-input" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus required />

                        <label className="legado-label">Telefone</label>
                        <input className="legado-input" value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} maxLength={15} required />

                        <label className="legado-label">CPF</label>
                        <input className="legado-input" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} maxLength={14} required />

                        <label className="legado-label">Data de Nascimento</label>
                        <input className="legado-input" value={dataNascimento} onChange={(e) => setDataNascimento(maskDate(e.target.value))} placeholder="DD/MM/AAAA" maxLength={10} required />

                        <label className="legado-label">E-mail</label>
                        <input className="legado-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                        <div className="flex justify-center mt-3">
                            <button
                                type="button"
                                className="legado-button"
                                style={{ background: "#f1faf5", color: "#5ba58c", minWidth: 180, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}
                                onClick={() => setShowSenhaModal(true)}
                            >
                                <KeyRound size={20} style={{ marginRight: 8 }} />
                                Alterar senha
                            </button>
                        </div>

                        <button type="submit" className="legado-button w-full mt-2" style={{ opacity: loading ? 0.7 : 1 }} disabled={loading}>
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </form>
                )}

                {/* Alerta */}
                {alerta && (
                    <div
                        className="legado-alert mt-3"
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
            </div>

            {/* Modal de Senha */}
            {showSenhaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowSenhaModal(false)}>
                    <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-center mb-3 text-[#255f4f]">Alterar Senha</h3>

                        <div className="relative mb-2">
                            <input
                                className="legado-input pr-10"
                                type={mostrarSenhaAtual ? "text" : "password"}
                                placeholder="Senha atual"
                                value={senhaAtual}
                                onChange={(e) => setSenhaAtual(e.target.value)}
                            />
                            <button type="button" className="abs-toggle" onClick={() => setMostrarSenhaAtual((v) => !v)} aria-label="Mostrar/ocultar senha atual">
                                {mostrarSenhaAtual ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative mb-2">
                            <input
                                className="legado-input pr-10"
                                type={mostrarNovaSenha ? "text" : "password"}
                                placeholder="Nova senha"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                            />
                            <button type="button" className="abs-toggle" onClick={() => setMostrarNovaSenha((v) => !v)} aria-label="Mostrar/ocultar nova senha">
                                {mostrarNovaSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <div className="relative mb-2">
                            <input
                                className="legado-input pr-10"
                                type={mostrarConfirmarSenha ? "text" : "password"}
                                placeholder="Confirmar nova senha"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                            />
                            <button type="button" className="abs-toggle" onClick={() => setMostrarConfirmarSenha((v) => !v)} aria-label="Mostrar/ocultar confirmar senha">
                                {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Indicador de força da senha */}
                        <div className="flex gap-1 mb-3 justify-center" aria-hidden>
                            {[0, 1, 2, 3].map((i) => (
                                <span
                                    key={i}
                                    style={{
                                        width: 32,
                                        height: 6,
                                        borderRadius: 999,
                                        background: i < forca ? ["#f87171", "#fb923c", "#fbbf24", "#34d399"][forca - 1] : "#e5e7eb",
                                    }}
                                />
                            ))}
                        </div>

                        <button className="legado-button w-full mb-2" onClick={handleTrocarSenha}>Confirmar</button>
                        <button className="w-full text-[#337b68] font-bold py-2 rounded-lg" style={{ background: "none" }} onClick={() => setShowSenhaModal(false)}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom nav */}
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