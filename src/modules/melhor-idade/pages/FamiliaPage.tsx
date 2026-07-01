import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Users, ChevronRight } from "lucide-react";
import { MiCard } from "../components/MiCard";

type Pessoa = {
    id: string;
    nome: string;
    imagem_url?: string;
    tipo: "titular" | "dependente";
};

export default function FamiliaPage() {
    const navigate = useNavigate();
    const { userProfile } = useOutletContext<{ userProfile?: { role: string; titular_id: string | null } }>();
    const [pessoas, setPessoas] = useState<Pessoa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const { data: userRes } = await supabase.auth.getUser();
            const user = userRes?.user;
            if (!user) {
                if (!cancelled) setLoading(false);
                return;
            }

            let titularId: string | null = userProfile?.titular_id ?? null;
            let titular: { id: string; nome: string; imagem_url?: string } | null = null;

            if (!titularId) {
                const { data } = await supabase
                    .from("titulares")
                    .select("id, nome, imagem_url")
                    .eq("auth_id", user.id)
                    .maybeSingle();
                titular = data;
                titularId = data?.id ?? null;
            } else {
                const { data } = await supabase
                    .from("titulares")
                    .select("id, nome, imagem_url")
                    .eq("id", titularId)
                    .maybeSingle();
                titular = data;
            }

            const lista: Pessoa[] = [];
            if (titular) {
                lista.push({
                    id: titular.id,
                    nome: titular.nome,
                    imagem_url: titular.imagem_url,
                    tipo: "titular",
                });
            }

            if (titularId) {
                const { data: deps } = await supabase
                    .from("dependentes")
                    .select("id, nome, imagem_url")
                    .eq("id_titular", titularId)
                    .order("nome");

                if (deps?.length) {
                    for (const d of deps) {
                        if (!lista.some((p) => p.id === d.id)) {
                            lista.push({
                                id: d.id,
                                nome: d.nome,
                                imagem_url: d.imagem_url,
                                tipo: "dependente",
                            });
                        }
                    }
                }
            }

            if (!cancelled) {
                setPessoas(lista);
                setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [userProfile?.titular_id]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#255f4f]">Minha família</h1>
                <p className="text-sm text-[#6b8c7d] mt-1">
                    Escolha um perfil para ver e registrar mensagens, fotos e memórias.
                </p>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-20 bg-white/60 animate-pulse rounded-2xl border border-[#e6efe9]" />
                    ))}
                </div>
            ) : pessoas.length === 0 ? (
                <MiCard variant="soft" className="p-6 text-center text-[#6b8c7d]">
                    <Users className="h-10 w-10 mx-auto mb-3 text-[#9db4aa]" />
                    <p>Nenhum perfil familiar encontrado.</p>
                </MiCard>
            ) : (
                <div className="space-y-3">
                    {pessoas.map((pessoa) => (
                        <MiCard
                            key={`${pessoa.tipo}-${pessoa.id}`}
                            onClick={() => navigate(`/melhor-idade/familia/${pessoa.id}`)}
                            className="p-4 flex items-center gap-4"
                        >
                            <img
                                src={pessoa.imagem_url || "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&w=80&q=80"}
                                alt={pessoa.nome}
                                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#255f4f] truncate">{pessoa.nome}</p>
                                <p className="text-xs text-[#6b8c7d] capitalize">
                                    {pessoa.tipo === "titular" ? "Titular" : "Familiar"}
                                </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                        </MiCard>
                    ))}
                </div>
            )}
        </div>
    );
}
