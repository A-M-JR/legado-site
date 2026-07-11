import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, X, Loader2 } from "lucide-react";
import logoPadrao from "@/assets/legado/logo_degrade.png";
import { MoodSelector } from "../../components/MoodSelector";
import { RedePessoaAvatar } from "../../components/RedePessoaAvatar";
import { profileService } from "../../services/profileService";
import { getTitularConta } from "../../services/miScope";
import { RELACOES, dedupeRede } from "../../lib/redeUtils";
import type { HumorTipo, PessoaRede } from "../../types";
import { toast } from "@/hooks/use-toast";
import { useMelhorIdade } from "../../context/MelhorIdadeContext";

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const { refreshProfile } = useMelhorIdade();
    const [step, setStep] = useState(0);
    const [nome, setNome] = useState("");
    const [fotoUrl, setFotoUrl] = useState<string | undefined>();
    const [carregandoConta, setCarregandoConta] = useState(true);
    const [rede, setRede] = useState<PessoaRede[]>([]);
    const [humor, setHumor] = useState<HumorTipo | null>(null);
    const [erroRede, setErroRede] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [fotoRedeEnviando, setFotoRedeEnviando] = useState<Record<string, boolean>>({});

    const algumaFotoRedeEnviando = Object.values(fotoRedeEnviando).some(Boolean);

    function handleFotoRedeUploading(id: string, uploading: boolean) {
        setFotoRedeEnviando((prev) => {
            const next = { ...prev };
            if (uploading) next[id] = true;
            else delete next[id];
            return next;
        });
    }

    useEffect(() => {
        getTitularConta().then((conta) => {
            if (conta?.nome) setNome(conta.nome);
            if (conta?.fotoUrl) setFotoUrl(conta.fotoUrl);
            setCarregandoConta(false);
        });
    }, []);

    async function finish() {
        if (!nome.trim() || !humor || salvando) return;
        setSalvando(true);
        try {
            const redeValida = dedupeRede(rede.filter((p) => p.nome.trim()));
            const profile = await profileService.completeOnboarding({
                nome: nome.trim(),
                rede: redeValida,
                humor,
                fotoUrl,
            });
            if (!profile.onboardingComplete) {
                toast({
                    title: "Erro ao entrar",
                    description: "Não foi possível salvar seu perfil. Tente novamente.",
                    variant: "destructive",
                });
                return;
            }
            await refreshProfile();
            navigate("/melhor-idade", { replace: true });
        } catch (err) {
            toast({
                title: "Erro ao entrar",
                description:
                    err instanceof Error
                        ? err.message
                        : "Verifique a conexão ou rode a migration do Melhor Idade no Supabase.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }
    function removePessoa(id: string) {
        setRede((prev) => prev.filter((p) => p.id !== id));
    }

    function updatePessoa(id: string, patch: Partial<PessoaRede>) {
        setErroRede("");
        setRede((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }

    function addPessoa() {
        setErroRede("");
        setRede((prev) => [
            ...prev,
            {
                id: String(Date.now()),
                nome: "",
                relacao: RELACOES[0],
            },
        ]);
    }

    function continuarRede() {
        const incompletas = rede.some((p) => !p.nome.trim());
        if (incompletas) {
            setErroRede("Preencha o nome de cada pessoa ou remova quem não for adicionar.");
            return;
        }
        setStep(3);
    }

    function pularRede() {
        setErroRede("");
        setRede([]);
        setStep(3);
    }

    return (
        <div className="min-h-screen bg-[#f0f4f2] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center gap-2 mb-6">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all ${
                                i === step ? "w-8 bg-[#5ba58c]" : i < step ? "w-4 bg-[#5ba58c]/50" : "w-4 bg-[#d1e5dc]"
                            }`}
                        />
                    ))}
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-[#e6efe9] p-8 animate-in fade-in duration-500">
                    {step === 0 && (
                        <div className="text-center space-y-6">
                            <img src={logoPadrao} alt="Legado" className="h-20 mx-auto" />
                            <div className="text-6xl">👋</div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#255f4f]">Bem-vindo</h1>
                                <p className="text-[#6b8c7d] mt-2 leading-relaxed">
                                    Você não está sozinho.
                                    <br />
                                    Estamos com você.
                                </p>
                            </div>
                            <Button
                                onClick={() => setStep(1)}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold"
                            >
                                Começar
                            </Button>
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-[#255f4f]">Seu nome</h1>
                                <p className="text-[#6b8c7d] mt-1">
                                    {nome.trim()
                                        ? "Confirme como podemos te chamar"
                                        : "Como podemos te chamar?"}
                                </p>
                            </div>
                            <div className="flex justify-center">
                                {fotoUrl ? (
                                    <img
                                        src={fotoUrl}
                                        alt={nome || "Foto do perfil"}
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-[#e3f1eb] flex items-center justify-center border-4 border-white shadow-md">
                                        <User className="h-12 w-12 text-[#5ba58c]" />
                                    </div>
                                )}
                            </div>
                            {carregandoConta ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                                </div>
                            ) : (
                                <Input
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    placeholder="Digite seu nome"
                                    className="py-6 text-lg rounded-2xl border-[#d1e5dc] text-center"
                                />
                            )}
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!nome.trim() || carregandoConta}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold disabled:opacity-50"
                            >
                                {nome.trim() ? "Confirmar e continuar" : "Continuar"}
                            </Button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-[#255f4f]">Sua rede</h1>
                                <p className="text-sm text-[#6b8c7d] mt-1">
                                    Quem está com você nesse momento?
                                </p>
                                <p className="text-xs text-[#9db4aa] mt-1">
                                    Adicione familiares ou amigos para fazerem parte do seu cuidado.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {rede.length === 0 && (
                                    <p className="text-sm text-center text-[#9db4aa] py-2">
                                        Nenhuma pessoa ainda. Toque em adicionar abaixo.
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
                                                onFotoChange={(url) =>
                                                    updatePessoa(p.id, { fotoUrl: url })
                                                }
                                                onUploadingChange={handleFotoRedeUploading}
                                            />
                                            <div className="flex-1 space-y-2 min-w-0">
                                                <Input
                                                    value={p.nome}
                                                    onChange={(e) =>
                                                        updatePessoa(p.id, { nome: e.target.value })
                                                    }
                                                    placeholder="Nome da pessoa"
                                                    className="rounded-xl h-11"
                                                />
                                                <select
                                                    value={p.relacao}
                                                    onChange={(e) =>
                                                        updatePessoa(p.id, { relacao: e.target.value })
                                                    }
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
                                                aria-label="Remover pessoa"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {erroRede && (
                                <p className="text-sm text-red-600 text-center">{erroRede}</p>
                            )}

                            <button
                                type="button"
                                onClick={addPessoa}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[#c2e1d4] text-[#5ba58c] font-semibold hover:bg-[#f4fbf8] transition"
                            >
                                <Plus className="h-5 w-5" /> Adicionar pessoa
                            </button>

                            <Button
                                onClick={continuarRede}
                                disabled={rede.length === 0 || algumaFotoRedeEnviando}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold disabled:opacity-50"
                            >
                                Continuar
                            </Button>
                            <button
                                type="button"
                                onClick={pularRede}
                                className="w-full text-sm text-[#6b8c7d] hover:underline"
                            >
                                Convidar depois
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-[#255f4f]">Check-in inicial</h1>
                                <p className="text-[#6b8c7d] mt-1">Como você está agora?</p>
                                <p className="text-xs text-[#9db4aa] mt-1">
                                    Isso nos ajuda a cuidar melhor de você.
                                </p>
                            </div>
                            <MoodSelector value={humor} onChange={setHumor} />
                            <Button
                                onClick={finish}
                                disabled={!humor || salvando || algumaFotoRedeEnviando}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold disabled:opacity-50"
                            >
                                {salvando ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin inline" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Entrar no app"
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
