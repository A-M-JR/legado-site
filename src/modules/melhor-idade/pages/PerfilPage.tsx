import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Camera,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
    Lock,
    Plus,
    Save,
    User,
    Users,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { uploadImagem } from "@/lib/uploadImage";
import { MI_PERFIL_FOLDER, MI_STORAGE_BUCKET } from "../lib/storage";
import { validarCPF } from "@/utils/validarCPF";
import { dataBRParaISO, dataISOParaBR } from "@/lib/masks";
import { MiCard, MiFilterPills } from "../components/MiCard";
import { MiDatePicker } from "../components/MiDatePicker";
import { RedePessoaAvatar } from "../components/RedePessoaAvatar";
import { MiPageHeader } from "../components/MiPageHeader";
import { useMelhorIdade } from "../context/MelhorIdadeContext";
import { getContaDados, updateContaDados, type ContaDados } from "../services/miScope";
import { RELACOES, dedupeRede } from "../lib/redeUtils";
import type { PessoaRede } from "../types";

const ABAS = [
    { id: "perfil", label: "Perfil" },
    { id: "familia", label: "Família" },
    { id: "conta", label: "Conta e senha" },
];

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

function CampoSenha({
    label,
    value,
    onChange,
    mostrar,
    onToggle,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    mostrar: boolean;
    onToggle: () => void;
    autoComplete: string;
}) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-semibold text-[#6b8c7d]">{label}</span>
            <div className="relative">
                <Input
                    type={mostrar ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="rounded-xl h-12 pr-10"
                    autoComplete={autoComplete}
                />
                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db4aa]"
                    aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
                >
                    {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </label>
    );
}

export default function PerfilPage() {
    const navigate = useNavigate();
    const { profile, updateProfile } = useMelhorIdade();
    const [aba, setAba] = useState("perfil");
    const [conta, setConta] = useState<ContaDados | null>(null);
    const [carregando, setCarregando] = useState(true);

    const [nome, setNome] = useState(profile.nome);
    const [fotoUrl, setFotoUrl] = useState(profile.fotoUrl);
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [dataNascimentoISO, setDataNascimentoISO] = useState("");

    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const [senhaAtual, setSenhaAtual] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [salvandoSenha, setSalvandoSenha] = useState(false);

    const [rede, setRede] = useState<PessoaRede[]>(() => dedupeRede(profile.rede));
    const [erroRede, setErroRede] = useState("");
    const [fotoRedeEnviando, setFotoRedeEnviando] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setNome(profile.nome);
        setFotoUrl(profile.fotoUrl);
        setRede(dedupeRede(profile.rede));
    }, [profile.nome, profile.fotoUrl, profile.rede]);

    useEffect(() => {
        getContaDados()
            .then((dados) => {
                if (dados) {
                    setConta(dados);
                    setTelefone(dados.telefone);
                    setCpf(dados.cpf);
                    setDataNascimentoISO(dataBRParaISO(dados.dataNascimento));
                }
            })
            .finally(() => setCarregando(false));
    }, []);

    const fotoExibir = fotoPreview || fotoUrl;
    const podeEditarDados = conta?.podeEditar ?? false;
    const algumaFotoRedeEnviando = Object.values(fotoRedeEnviando).some(Boolean);
    const salvandoDesabilitado = salvando || enviandoFoto || algumaFotoRedeEnviando;

    function handleFotoRedeUploading(id: string, uploading: boolean) {
        setFotoRedeEnviando((prev) => {
            const next = { ...prev };
            if (uploading) next[id] = true;
            else delete next[id];
            return next;
        });
    }

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setFotoPreview(URL.createObjectURL(file));
        setEnviandoFoto(true);

        const url = await uploadImagem({
            file,
            folder: MI_PERFIL_FOLDER,
            bucket: MI_STORAGE_BUCKET,
        });

        setEnviandoFoto(false);
        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto.",
                variant: "destructive",
            });
            setFotoPreview(null);
            return;
        }

        setFotoUrl(url);
        setFotoPreview(null);
    }

    function addPessoa() {
        setErroRede("");
        setRede((prev) => [...prev, { id: String(Date.now()), nome: "", relacao: RELACOES[0] }]);
    }

    function removePessoa(id: string) {
        setRede((prev) => prev.filter((p) => p.id !== id));
    }

    function updatePessoa(id: string, patch: Partial<PessoaRede>) {
        setErroRede("");
        setRede((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }

    async function salvarPerfil() {
        if (!nome.trim()) {
            toast({ title: "Informe o nome", variant: "destructive" });
            setAba("perfil");
            return;
        }

        if (podeEditarDados && cpf && !validarCPF(cpf)) {
            toast({ title: "CPF inválido", variant: "destructive" });
            setAba("conta");
            return;
        }

        const incompletas = rede.some((p) => !p.nome.trim());
        if (incompletas) {
            setErroRede("Preencha o nome de cada familiar ou remova quem não for incluir.");
            setAba("familia");
            return;
        }

        setSalvando(true);
        try {
            const redeValida = dedupeRede(rede.filter((p) => p.nome.trim()));
            await updateProfile({ nome: nome.trim(), fotoUrl, rede: redeValida });

            if (podeEditarDados) {
                await updateContaDados({
                    telefone,
                    cpf,
                    dataNascimento: dataNascimentoISO ? dataISOParaBR(dataNascimentoISO) : "",
                });
            }

            toast({ title: "Perfil atualizado" });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    async function alterarSenha(e: React.FormEvent) {
        e.preventDefault();
        if (!conta?.email) {
            toast({ title: "E-mail não encontrado", variant: "destructive" });
            return;
        }
        if (!senhaAtual || !novaSenha || !confirmarSenha) {
            toast({ title: "Preencha todos os campos de senha", variant: "destructive" });
            return;
        }
        if (novaSenha.length < 8) {
            toast({ title: "Senha fraca", description: "Mínimo 8 caracteres.", variant: "destructive" });
            return;
        }
        if (novaSenha !== confirmarSenha) {
            toast({ title: "Senhas não conferem", variant: "destructive" });
            return;
        }

        setSalvandoSenha(true);
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: conta.email,
            password: senhaAtual,
        });
        if (signInError) {
            setSalvandoSenha(false);
            toast({ title: "Senha atual incorreta", variant: "destructive" });
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: novaSenha });
        setSalvandoSenha(false);

        if (error) {
            toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
            return;
        }

        setSenhaAtual("");
        setNovaSenha("");
        setConfirmarSenha("");
        toast({ title: "Senha alterada com sucesso" });
    }

    if (carregando) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#5ba58c]" />
            </div>
        );
    }

    return (
        <div className="space-y-5 pb-28 sm:pb-8">
            <MiPageHeader
                eyebrow="Perfil"
                title="Meu perfil"
                subtitle="Organize seu perfil, família e dados de acesso."
            />

            <MiFilterPills options={ABAS} value={aba} onChange={setAba} />

            {aba === "perfil" && (
                <MiCard variant="soft" className="p-5 space-y-4">
                    <div>
                        <h2 className="font-bold text-[#255f4f]">Como você aparece no app</h2>
                        <p className="text-xs text-[#9db4aa] mt-1">
                            Nome e foto exibidos no Melhor Idade.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="relative group"
                            aria-label="Alterar foto"
                        >
                            {fotoExibir ? (
                                <img
                                    src={fotoExibir}
                                    alt={nome || "Foto"}
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-[#e3f1eb] flex items-center justify-center border-4 border-white shadow-lg">
                                    <User className="h-14 w-14 text-[#5ba58c]" />
                                </div>
                            )}
                            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                {enviandoFoto ? (
                                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                                ) : (
                                    <Camera className="h-8 w-8 text-white" />
                                )}
                            </span>
                        </button>
                        <p className="text-xs text-[#6b8c7d]">Toque para trocar a foto</p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFoto}
                        />
                    </div>

                    <label className="block space-y-2">
                        <span className="text-sm font-semibold text-[#6b8c7d]">Nome no app</span>
                        <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Como podemos te chamar?"
                            className="rounded-xl h-12"
                            required
                        />
                    </label>
                </MiCard>
            )}

            {aba === "familia" && (
                <MiCard variant="soft" className="p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#5ba58c]" />
                        <div>
                            <h2 className="font-bold text-[#255f4f]">Minha família</h2>
                            <p className="text-xs text-[#9db4aa]">
                                Aparecem em Minha família e Minha rotina.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {rede.length === 0 && (
                            <p className="text-sm text-center text-[#9db4aa] py-4">
                                Nenhum familiar cadastrado.
                            </p>
                        )}
                        {rede.map((p) => (
                            <div
                                key={p.id}
                                className="p-3 rounded-2xl bg-[#f8fcfb] border border-[#e6efe9] space-y-3"
                            >
                                <div className="flex items-start gap-3">
                                    <RedePessoaAvatar
                                        id={p.id}
                                        fotoUrl={p.fotoUrl}
                                        nome={p.nome}
                                        onFotoChange={(url) => updatePessoa(p.id, { fotoUrl: url })}
                                        onUploadingChange={handleFotoRedeUploading}
                                    />
                                    <div className="flex-1 space-y-2 min-w-0">
                                        <Input
                                            value={p.nome}
                                            onChange={(e) => updatePessoa(p.id, { nome: e.target.value })}
                                            placeholder="Nome"
                                            className="rounded-xl h-11"
                                        />
                                        <select
                                            value={p.relacao}
                                            onChange={(e) => updatePessoa(p.id, { relacao: e.target.value })}
                                            className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm"
                                        >
                                            {RELACOES.map((r) => (
                                                <option key={r} value={r}>
                                                    {r}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePessoa(p.id)}
                                        className="p-2 rounded-full hover:bg-red-50 text-[#9db4aa] hover:text-red-500 shrink-0"
                                        aria-label="Remover"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {erroRede && <p className="text-sm text-red-600 text-center">{erroRede}</p>}

                    <button
                        type="button"
                        onClick={addPessoa}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-[#c2e1d4] text-[#5ba58c] font-semibold hover:bg-[#f4fbf8] transition"
                    >
                        <Plus className="h-5 w-5" /> Adicionar familiar
                    </button>
                </MiCard>
            )}

            {aba === "conta" && (
                <div className="space-y-4">
                    <MiCard variant="soft" className="p-5 space-y-4">
                        <div>
                            <h2 className="font-bold text-[#255f4f]">Dados da conta</h2>
                            {!podeEditarDados && (
                                <p className="text-xs text-[#9db4aa] mt-1">
                                    Somente leitura — familiar vinculado à conta.
                                </p>
                            )}
                        </div>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-[#6b8c7d]">E-mail</span>
                            <Input
                                value={conta?.email ?? ""}
                                readOnly
                                className="rounded-xl h-12 bg-[#f8fcfb]"
                            />
                        </label>

                        <label className="block space-y-2">
                            <span className="text-sm font-semibold text-[#6b8c7d]">Telefone</span>
                            <Input
                                value={telefone}
                                onChange={(e) => setTelefone(maskPhone(e.target.value))}
                                placeholder="(00) 00000-0000"
                                className="rounded-xl h-12"
                                readOnly={!podeEditarDados}
                            />
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className="block space-y-2">
                                <span className="text-sm font-semibold text-[#6b8c7d]">CPF</span>
                                <Input
                                    value={cpf}
                                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                                    placeholder="000.000.000-00"
                                    className="rounded-xl h-12"
                                    readOnly={!podeEditarDados}
                                />
                            </label>
                            <label className="block space-y-2 sm:col-span-2">
                                <span className="text-sm font-semibold text-[#6b8c7d]">Nascimento</span>
                                <MiDatePicker
                                    value={dataNascimentoISO}
                                    onChange={setDataNascimentoISO}
                                    disabled={!podeEditarDados}
                                    max={new Date().toISOString().slice(0, 10)}
                                />
                            </label>
                        </div>

                        <p className="text-xs text-[#9db4aa] bg-[#f8fcfb] rounded-xl px-3 py-2 border border-[#e6efe9]">
                            Telefone, CPF e nascimento são salvos com o botão{" "}
                            <strong className="text-[#255f4f]">Salvar alterações</strong> abaixo.
                        </p>
                    </MiCard>

                    <MiCard variant="soft" className="p-5 space-y-4">
                        <div className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-[#5ba58c]" />
                            <div>
                                <h2 className="font-bold text-[#255f4f]">Alterar senha</h2>
                                <p className="text-xs text-[#9db4aa]">
                                    Ação separada — não usa o botão de salvar perfil.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={alterarSenha} className="space-y-3">
                            <CampoSenha
                                label="Senha atual"
                                value={senhaAtual}
                                onChange={setSenhaAtual}
                                mostrar={mostrarSenhaAtual}
                                onToggle={() => setMostrarSenhaAtual((v) => !v)}
                                autoComplete="current-password"
                            />
                            <CampoSenha
                                label="Nova senha"
                                value={novaSenha}
                                onChange={setNovaSenha}
                                mostrar={mostrarNovaSenha}
                                onToggle={() => setMostrarNovaSenha((v) => !v)}
                                autoComplete="new-password"
                            />
                            <CampoSenha
                                label="Confirmar nova senha"
                                value={confirmarSenha}
                                onChange={setConfirmarSenha}
                                mostrar={mostrarConfirmar}
                                onToggle={() => setMostrarConfirmar((v) => !v)}
                                autoComplete="new-password"
                            />

                            <Button
                                type="submit"
                                disabled={salvandoSenha}
                                className="w-full rounded-xl h-12 bg-[#255f4f] hover:bg-[#1d4d42] text-white font-bold"
                            >
                                {salvandoSenha ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Alterando...
                                    </>
                                ) : (
                                    <>
                                        <Lock className="mr-2 h-4 w-4" />
                                        Atualizar senha
                                    </>
                                )}
                            </Button>
                        </form>
                    </MiCard>
                </div>
            )}

            {/* Barra fixa — salvar perfil, família e dados (não senha) */}
            <div className="fixed left-0 right-0 bottom-20 md:bottom-0 z-40 px-4 pb-3 md:pb-4 md:static md:px-0 md:z-auto">
                <div className="max-w-2xl lg:max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border border-[#e6efe9] rounded-2xl shadow-lg p-3 flex gap-2 md:shadow-none md:bg-transparent md:border-0 md:p-0 md:rounded-none">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl h-12"
                        onClick={() => navigate("/melhor-idade")}
                    >
                        Voltar
                    </Button>
                    <Button
                        type="button"
                        disabled={salvandoDesabilitado}
                        onClick={salvarPerfil}
                        className="flex-[2] rounded-xl h-12 bg-[#5ba58c] hover:bg-[#4a8a75] text-white font-bold"
                    >
                        {salvando ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Salvar alterações
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
