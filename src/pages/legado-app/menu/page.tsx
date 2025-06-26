import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { format } from "date-fns";
import "@/styles/legado-app.css";

interface Titular {
    id: string;
    nome: string;
    imagem_url: string;
    data_nascimento: string;
    data_falecimento?: string;
    falecido: boolean;
}

interface Dependente {
    id: string;
    id_titular: string;
    nome: string;
    imagem_url: string;
    data_nascimento: string;
    data_falecimento?: string;
    falecido: boolean;
}

export default function MenuPage() {
    const [titular, setTitular] = useState<Titular | null>(null);
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [filter, setFilter] = useState("todos");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: titularData } = await supabase
                .from("titulares")
                .select("*")
                .eq("auth_id", user.id)
                .maybeSingle();

            if (titularData) {
                setTitular(titularData);
                const { data: dependenteData } = await supabase
                    .from("dependentes")
                    .select("*")
                    .eq("id_titular", titularData.id);
                setDependentes(dependenteData || []);
            }
        };

        fetchData();
    }, []);

    const filtered = useMemo(() => {
        if (filter === "vivos") return dependentes.filter((d) => !d.falecido);
        if (filter === "falecidos") return dependentes.filter((d) => d.falecido);
        return dependentes;
    }, [dependentes, filter]);

    const formatDate = (date?: string) => {
        if (!date) return "-";
        const parsed = new Date(date);
        return isNaN(parsed.getTime()) ? "-" : format(parsed, "dd/MM/yyyy");
    };

    return (
        <div className="legado-app-wrapper p-4">
            <div className="legado-form-card">
                {titular && (
                    <div className="text-center mb-6">
                        <img
                            src={titular.imagem_url || "/images/default-user.png"}
                            alt="Titular"
                            className="w-32 h-32 rounded-full mx-auto mb-4"
                        />
                        <h2 className="text-xl font-bold text-green-900">{titular.nome}</h2>
                        <p className="text-sm text-gray-700">★ {formatDate(titular.data_nascimento)}</p>
                        {titular.falecido && (
                            <p className="text-sm text-red-600 font-semibold">
                                † {formatDate(titular.data_falecimento)}
                            </p>
                        )}
                    </div>
                )}

                <div className="mb-4 flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Dependentes</h3>
                    <select
                        className="legado-input w-40"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="vivos">Vivos</option>
                        <option value="falecidos">Falecidos</option>
                    </select>
                </div>

                {filtered.map((dep) => (
                    <div
                        key={dep.id}
                        className="flex items-center gap-4 mb-4 p-3 bg-[#f0f8f6] rounded-xl shadow"
                    >
                        <img
                            src={dep.imagem_url || "/images/default-user.png"}
                            alt={dep.nome}
                            className="w-16 h-16 rounded-full"
                        />
                        <div className="flex-1">
                            <p className="text-sm font-semibold">{dep.nome}</p>
                            <p className="text-xs">★ {formatDate(dep.data_nascimento)}</p>
                            {dep.falecido && (
                                <p className="text-xs text-red-600">† {formatDate(dep.data_falecimento)}</p>
                            )}
                        </div>
                        <button
                            className="legado-button"
                            onClick={() => navigate(`/legado-app/recordacoes/${dep.id}`)}
                        >
                            Ver
                        </button>
                    </div>
                ))}

                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate("/legado-app/dependentes/novo")}
                        className="legado-button"
                    >
                        Adicionar dependente
                    </button>
                </div>
            </div>
        </div>
    );
}
