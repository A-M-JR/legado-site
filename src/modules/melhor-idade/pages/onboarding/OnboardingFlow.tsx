import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, X } from "lucide-react";
import logoPadrao from "@/assets/legado/logo_degrade.png";
import { MoodSelector } from "../../components/MoodSelector";
import { profileService } from "../../services/profileService";
import type { HumorTipo, PessoaRede } from "../../types";
import { useMelhorIdade } from "../../context/MelhorIdadeContext";

const REDE_INICIAL: PessoaRede[] = [
    {
        id: "1",
        nome: "Maria",
        relacao: "Filha",
        fotoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=80&q=80",
    },
    {
        id: "2",
        nome: "Carlos",
        relacao: "Amigo",
        fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
    },
];

export default function OnboardingFlow() {
    const navigate = useNavigate();
    const { refreshProfile } = useMelhorIdade();
    const [step, setStep] = useState(0);
    const [nome, setNome] = useState("");
    const [rede, setRede] = useState<PessoaRede[]>(REDE_INICIAL);
    const [humor, setHumor] = useState<HumorTipo | null>(null);

    function finish() {
        if (!nome.trim() || !humor) return;
        profileService.completeOnboarding({ nome: nome.trim(), rede, humor });
        refreshProfile();
        navigate("/melhor-idade", { replace: true });
    }

    function removePessoa(id: string) {
        setRede((prev) => prev.filter((p) => p.id !== id));
    }

    function addPessoa() {
        const id = String(Date.now());
        setRede((prev) => [
            ...prev,
            {
                id,
                nome: "Nova pessoa",
                relacao: "Familiar",
                fotoUrl:
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=80&q=80",
            },
        ]);
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
                                <p className="text-[#6b8c7d] mt-1">Como podemos te chamar?</p>
                            </div>
                            <div className="flex justify-center">
                                <div className="w-24 h-24 rounded-full bg-[#e3f1eb] flex items-center justify-center border-4 border-white shadow-md">
                                    <User className="h-12 w-12 text-[#5ba58c]" />
                                </div>
                            </div>
                            <Input
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite seu nome"
                                className="py-6 text-lg rounded-2xl border-[#d1e5dc] text-center"
                            />
                            <Button
                                onClick={() => setStep(2)}
                                disabled={!nome.trim()}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold disabled:opacity-50"
                            >
                                Continuar
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

                            <div className="space-y-2">
                                {rede.map((p) => (
                                    <div
                                        key={p.id}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8fcfb] border border-[#e6efe9]"
                                    >
                                        <img
                                            src={p.fotoUrl}
                                            alt={p.nome}
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-[#255f4f] truncate">
                                                {p.nome} ({p.relacao})
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removePessoa(p.id)}
                                            className="p-2 rounded-full hover:bg-red-50 text-[#9db4aa] hover:text-red-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addPessoa}
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-[#c2e1d4] text-[#5ba58c] font-semibold hover:bg-[#f4fbf8] transition"
                            >
                                <Plus className="h-5 w-5" /> Adicionar pessoa
                            </button>

                            <Button
                                onClick={() => setStep(3)}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold"
                            >
                                Continuar
                            </Button>
                            <button
                                type="button"
                                onClick={() => setStep(3)}
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
                                disabled={!humor}
                                className="w-full py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white text-lg font-bold disabled:opacity-50"
                            >
                                Entrar no app
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
