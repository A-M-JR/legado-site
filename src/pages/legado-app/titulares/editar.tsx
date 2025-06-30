import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient"
import { validarCPF } from "../../../utils/validarCPF";
import { UserCircle, ArrowLeft, KeyRound } from "lucide-react";
import "@/styles/legado-app.css";

export default function EditarTitularPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Estados dos campos
    const [nome, setNome] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemUrl, setImagemUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Alertas
    const [alerta, setAlerta] = useState("");
    const [showSenhaModal, setShowSenhaModal] = useState(false);
    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");

    // Carregar titular
    useEffect(() => {
        (async () => {
            if (!id) return;
            const { data, error } = await supabase
                .from("titulares")
                .select("*")
                .eq("id", id)
                .single();
            if (error || !data) {
                setAlerta("Erro ao carregar dados: " + error?.message);
                return;
            }
            setNome(data.nome);
            setTelefone(data.telefone ?? "");
            setCpf(data.cpf ?? "");
            setDataNascimento(data.data_nascimento
                ? data.data_nascimento.split("-").reverse().join("/")
                : ""
            );
            setEmail(data.email ?? "");
            setImagemUrl(data.imagem_url ?? null);
        })();
    }, [id]);

    // Upload de imagem
    const handleImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setImagem(e.target.files[0]);
            setImagemUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    // Máscara para telefone e data
    function maskPhone(value: string) {
        return value
            .replace(/\D/g, "")
            .replace(/^(\d{2})(\d)/g, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2")
            .slice(0, 15);
    }
    function maskCPF(value: string) {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
            .slice(0, 14);
    }
    function maskDate(value: string) {
        value = value.replace(/\D/g, "");
        if (value.length > 2 && value.length <= 4) {
            value = value.replace(/(\d{2})(\d+)/, "$1/$2");
        } else if (value.length > 4) {
            value = value.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        }
        return value.slice(0, 10);
    }

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
    // Atualiza os dados do titular (sem imagem ainda)
    const { error: updateError } = await supabase
      .from("titulares")
      .update({
        nome,
        telefone,
        data_nascimento: dataIso,
        email,
        cpf,
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Se tem nova imagem selecionada, faz upload
    if (imagem && id) {
      // Nome do arquivo único, ex: titulares/perfil-123.jpg
      const fileExt = imagem.name.split(".").pop();
      const fileName = `perfil-${id}.${fileExt}`;
      const filePath = `titulares/${fileName}`;

      // Faz upload no bucket 'public' (ajuste se o seu bucket for outro)
      const { error: uploadError } = await supabase.storage
        .from("public")   // Mude para seu bucket real
        .upload(filePath, imagem, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage.from("public").getPublicUrl(filePath);

      // Atualiza a coluna imagem_url no banco
      const { error: urlUpdateError } = await supabase
        .from("titulares")
        .update({ imagem_url: urlData.publicUrl })
        .eq("id", id);

      if (urlUpdateError) throw urlUpdateError;

      setImagemUrl(urlData.publicUrl); // Atualiza estado para exibir
    }

    setAlerta("Dados atualizados com sucesso.");
    setTimeout(() => navigate(-1), 1500);
  } catch (error: any) {
    setAlerta("Erro ao salvar dados: " + error.message);
  } finally {
    setLoading(false);
  }
}

    // Modal de senha
    async function handleTrocarSenha() {
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            setAlerta("Preencha todos os campos da senha.");
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setAlerta("A nova senha e a confirmação não coincidem.");
            return;
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: senhaAtual,
        });
        if (signInError) {
            setAlerta("Senha atual incorreta.");
            return;
        }
        const { error } = await supabase.auth.updateUser({
            password: novaSenha,
        });
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
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
            <div className="legado-form-card w-full max-w-lg relative">
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 24 }}>
                    <button onClick={() => navigate(-1)} className="legado-icon-button">
                        <ArrowLeft />
                    </button>
                    <h2 className="text-xl font-bold" style={{ color: "#356c6f", margin: 0 }}>
                        Editar Titular
                    </h2>
                </div>
                {/* Imagem */}
                <div className="text-center mb-4">
                    {imagemUrl ? (
                        <img src={imagemUrl} alt="Titular" className="mx-auto rounded-full mb-2" style={{ width: 100, height: 100, objectFit: "cover", border: "2px solid #4d9f85" }} />
                    ) : (
                        <UserCircle size={100} className="text-gray-300 mx-auto mb-2" />
                    )}
                    <div>
                        <input
                            id="file"
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImagem}
                        />
                        <label htmlFor="file" className="legado-button" style={{ background: "#f1faf5", color: "#5ba58c", fontWeight: 600, padding: "8px 16px", cursor: "pointer" }}>
                            Selecionar imagem
                        </label>
                    </div>
                </div>
                {/* Formulário */}
                <form
                    onSubmit={e => { e.preventDefault(); handleSalvar(); }}
                    className="space-y-1"
                >
                    <label className="legado-label">Nome:</label>
                    <input
                        className="legado-input"
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        autoFocus
                        required
                    />
                    <label className="legado-label">Telefone:</label>
                    <input
                        className="legado-input"
                        value={telefone}
                        onChange={e => setTelefone(maskPhone(e.target.value))}
                        maxLength={15}
                        required
                    />
                    <label className="legado-label">CPF:</label>
                    <input
                        className="legado-input"
                        value={cpf}
                        onChange={e => setCpf(maskCPF(e.target.value))}
                        maxLength={14}
                        required
                    />
                    <label className="legado-label">Data de Nascimento:</label>
                    <input
                        className="legado-input"
                        value={dataNascimento}
                        onChange={e => setDataNascimento(maskDate(e.target.value))}
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                        required
                    />
                    <label className="legado-label">E-mail:</label>
                    <input
                        className="legado-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />

                    <div style={{ display: "flex", justifyContent: "center", margin: "18px 0 10px 0" }}>
                        <button
                            type="button"
                            className="legado-button"
                            style={{
                                background: "#f1faf5",
                                color: "#5ba58c",
                                minWidth: 180,
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            onClick={() => setShowSenhaModal(true)}
                        >
                            <KeyRound size={20} style={{ marginRight: 8, verticalAlign: "middle" }} />
                            Alterar senha
                        </button>
                    </div>


                    <button
                        type="submit"
                        className="legado-button w-full mt-2"
                        style={{ opacity: loading ? 0.7 : 1 }}
                        disabled={loading}
                    >
                        {loading ? "Salvando..." : "Salvar Alterações"}
                    </button>
                </form>
                {/* Alerta */}
                {alerta && (
                    <div className="legado-alert mt-2">{alerta}</div>
                )}
            </div>
            {/* Modal de senha */}
            {showSenhaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-lg">
                        <h3 className="text-lg font-bold text-center mb-2 text-[#255f4f]">
                            Alterar Senha
                        </h3>
                        <input
                            className="legado-input mb-2"
                            type="password"
                            placeholder="Senha atual"
                            value={senhaAtual}
                            onChange={e => setSenhaAtual(e.target.value)}
                        />
                        <input
                            className="legado-input mb-2"
                            type="password"
                            placeholder="Nova senha"
                            value={novaSenha}
                            onChange={e => setNovaSenha(e.target.value)}
                        />
                        <input
                            className="legado-input mb-2"
                            type="password"
                            placeholder="Confirmar nova senha"
                            value={confirmarSenha}
                            onChange={e => setConfirmarSenha(e.target.value)}
                        />
                        <button className="legado-button w-full mb-2" onClick={handleTrocarSenha}>
                            Confirmar
                        </button>
                        <button
                            className="w-full text-[#337b68] font-bold py-2 rounded-lg"
                            style={{ background: "none" }}
                            onClick={() => setShowSenhaModal(false)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
