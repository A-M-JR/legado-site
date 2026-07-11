import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ChevronRight, User } from "lucide-react";
import { MiCard } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { useMelhorIdade } from "../context/MelhorIdadeContext";

export default function FamiliaPage() {
    const navigate = useNavigate();
    const { profile, refreshProfile } = useMelhorIdade();

    useEffect(() => {
        refreshProfile();
    }, [refreshProfile]);

    const pessoas = useMemo(() => {
        const eu = {
            id: "eu",
            nome: profile.nome || "Você",
            fotoUrl: profile.fotoUrl,
            relacao: "Titular",
        };
        const rede = profile.rede.map((p) => ({
            id: p.id,
            nome: p.nome,
            fotoUrl: p.fotoUrl,
            relacao: p.relacao,
        }));
        return [eu, ...rede];
    }, [profile]);

    return (
        <div className="space-y-6">
            <MiPageHeader
                eyebrow="Família"
                title="Minha família"
                subtitle="Escolha um perfil para ver e registrar mensagens e memórias."
            />

            {pessoas.length <= 1 && profile.rede.length === 0 ? (
                <MiCard variant="soft" className="p-6 text-center text-[#6b8c7d] space-y-3">
                    <Users className="h-10 w-10 mx-auto text-[#9db4aa]" />
                    <p>Nenhum familiar cadastrado ainda.</p>
                    <button
                        type="button"
                        onClick={() => navigate("/melhor-idade/perfil")}
                        className="text-sm font-semibold text-[#5ba58c] hover:underline"
                    >
                        Adicionar família em Meu perfil
                    </button>
                </MiCard>
            ) : (
                <div className="space-y-3">
                    {pessoas.map((pessoa) => (
                        <MiCard
                            key={pessoa.id}
                            onClick={() => navigate(`/melhor-idade/familia/${pessoa.id}`)}
                            className="p-4 flex items-center gap-4"
                        >
                            {pessoa.fotoUrl ? (
                                <img
                                    src={pessoa.fotoUrl}
                                    alt={pessoa.nome}
                                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                                />
                            ) : (
                                <div className="w-14 h-14 rounded-full bg-[#e3f1eb] flex items-center justify-center border-2 border-white shadow">
                                    <User className="h-6 w-6 text-[#5ba58c]" />
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#255f4f] truncate">{pessoa.nome}</p>
                                <p className="text-xs text-[#6b8c7d]">{pessoa.relacao}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                        </MiCard>
                    ))}
                </div>
            )}
        </div>
    );
}
