// src/pages/legado-app/MenuPage.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { format } from "date-fns";
import InputMask from "react-input-mask";
import { Edit, Skull, Plus, UserPlus, UserCircle, Flower2 } from "lucide-react";
import { isValidDateBR, formatBR } from "../../../utils/formatDateToBR";
import "@/styles/legado-app.css";

// Tipagem
type Titular = {
    id: string;
    nome: string;
    imagem_url: string;
    data_nascimento: string;
    data_falecimento?: string;
    falecido: boolean;
};

type Dependente = {
    id: string;
    id_titular: string;
    nome: string;
    imagem_url: string;
    data_nascimento: string;
    data_falecimento?: string;
    falecido: boolean;
};

export default function MenuPage() {
    const navigate = useNavigate();
    const [titular, setTitular] = useState<Titular | null>(null);
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "vivos" | "falecidos">("todos");
    const [modalOpen, setModalOpen] = useState(false);
    const [modalDepId, setModalDepId] = useState<string | null>(null);
    const [modalData, setModalData] = useState<string>("");
    const [dataErro, setDataErro] = useState<string>("");


    // Load titular e dependentes
    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: titularData } = await supabase
                .from("titulares")
                .select("*")
                .eq("auth_id", user?.id)
                .maybeSingle();

            if (titularData) {
                setTitular(titularData as Titular);
                const { data: dependentesData } = await supabase
                    .from("dependentes")
                    .select("*")
                    .eq("id_titular", titularData.id);

                setDependentes((dependentesData as Dependente[]) || []);
            }
        })();
    }, []);

    const inputRef = useRef(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [modalOpen, modalDepId]);


    // Filtro
    const dependentesFiltrados = useMemo(() => {
        if (filtro === "todos") return dependentes;
        return dependentes.filter((d) => (filtro === "vivos" ? !d.falecido : d.falecido));
    }, [filtro, dependentes]);

    // Encerrar ciclo titular (marcar como falecido)
    async function encerrarCicloTitular() {
        if (!titular) return;
        const hoje = new Date().toISOString();
        const { error } = await supabase
            .from("titulares")
            .update({ falecido: true, data_falecimento: hoje })
            .eq("id", titular.id);
        if (!error) setTitular({ ...titular, falecido: true, data_falecimento: hoje });
    }

    // Reativar titular
    async function reativarTitular() {
        if (!titular) return;
        const { error } = await supabase
            .from("titulares")
            .update({ falecido: false, data_falecimento: null })
            .eq("id", titular.id);
        if (!error) setTitular({ ...titular, falecido: false, data_falecimento: undefined });
    }

    // Marcar dependente como falecido (abre modal)
    function abrirModalFalecimento(depId: string) {
        setModalDepId(depId);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    }

    function validarDataBR(data: string) {
        // Regex para dd/mm/aaaa simples e depois checagem de datas reais:
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return false;
        const [dia, mes, ano] = data.split("/").map(Number);
        const dataObj = new Date(ano, mes - 1, dia);
        return (
            dataObj.getFullYear() === ano &&
            dataObj.getMonth() === mes - 1 &&
            dataObj.getDate() === dia
        );
    }

    function formatarData(valor: string) {
        // Remove tudo que não é número
        valor = valor.replace(/\D/g, '');
        // Adiciona a barra após o segundo e quarto dígito
        if (valor.length > 2 && valor.length <= 4) {
            valor = valor.replace(/(\d{2})(\d+)/, '$1/$2');
        } else if (valor.length > 4) {
            valor = valor.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
        }
        return valor.slice(0, 10); // Limita a 10 caracteres
    }

    // No onClick do salvar:
    <button
        className="legado-button w-full mb-2"
        disabled={!validarDataBR(modalData)}
        onClick={salvarFalecimento}
    >
        Salvar
    </button>

    // Salvar data de falecimento do dependente
    async function salvarFalecimento() {
        if (!modalDepId) return;
        if (!validarDataBR(modalData)) {
            setDataErro("Data inválida. Use o formato DD/MM/AAAA.");
            return;
        }
        setDataErro("");
        if (!modalDepId || !validarDataBR(modalData)) return;
        const [d, m, y] = modalData.split("/");
        const dataISO = `${y}-${m}-${d}`;
        const { error } = await supabase
            .from("dependentes")
            .update({
                falecido: true,
                data_falecimento: dataISO,
            })
            .eq("id", modalDepId);
        if (!error) {
            setDependentes((prev) =>
                prev.map((dep) =>
                    dep.id === modalDepId
                        ? { ...dep, falecido: true, data_falecimento: dataISO }
                        : dep
                )
            );
            setModalOpen(false);
            setModalData("");
        }
    }

    // Reativar dependente
    async function reativarDependente(depId: string) {
        const { error } = await supabase
            .from("dependentes")
            .update({
                falecido: false,
                data_falecimento: null,
            })
            .eq("id", depId);
        if (!error) {
            setDependentes((prev) =>
                prev.map((dep) =>
                    dep.id === depId
                        ? { ...dep, falecido: false, data_falecimento: undefined }
                        : dep
                )
            );
        }
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
            <div className="legado-form-card w-full max-w-md relative">

                {/* TITULAR */}
                {titular && (
                    <div className="legado-titular-container mb-6">
                        {titular.imagem_url ? (
                            <img src={titular.imagem_url} alt="Titular" className="mb-2" />
                        ) : (
                            <UserCircle size={100} className="text-gray-300 mb-2" />
                        )}
                        <h2>{titular.nome}</h2>
                        {titular.data_nascimento && (
                            <p>★ {formatBR(titular.data_nascimento)}</p>
                        )}
                        {titular.falecido && titular.data_falecimento && (
                            <p className="legado-dependente-info falecido">
                                † {formatBR(titular.data_falecimento)}
                            </p>
                        )}

                        <div className="legado-perfil-actions">
                            <button
                                className="legado-button"
                                onClick={() => navigate(`/legado-app/titulares/editar/${titular.id}`)}
                            >
                                <Edit size={16} className="inline mr-1" /> Editar
                            </button>
                            <button
                                className="legado-button"
                                style={{ backgroundColor: titular.falecido ? "#3cb371" : "#dc3545" }}
                                onClick={titular.falecido ? reativarTitular : encerrarCicloTitular}
                            >
                                {titular.falecido ? (
                                    <>
                                        <UserPlus size={16} className="inline mr-1" />
                                        Reativar
                                    </>
                                ) : (
                                    <>
                                        <Flower2 size={16} className="inline mr-1" />
                                        Encerrar ciclo
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* FILTROS */}
                <div className="legado-filtro-buttons">
                    <button
                        className={filtro === "todos" ? "active" : ""}
                        onClick={() => setFiltro("todos")}
                    >
                        Todos
                    </button>
                    <button
                        className={filtro === "vivos" ? "active" : ""}
                        onClick={() => setFiltro("vivos")}
                    >
                        Presente
                    </button>
                    <button
                        className={filtro === "falecidos" ? "active" : ""}
                        onClick={() => setFiltro("falecidos")}
                    >
                        Ausente
                    </button>
                </div>

                {/* DEPENDENTES */}
                {dependentesFiltrados.map((dep) => (
                    <div
                        className="legado-dependente-card cursor-pointer hover:bg-[#e4f6f0]"
                        key={dep.id}
                        onClick={() => navigate(`/legado-app/recordacoes/list/${dep.id}`)}
                        style={{ position: "relative" }}
                    >
                        {dep.imagem_url ? (
                            <img src={dep.imagem_url} alt="Foto" />
                        ) : (
                            <UserCircle size={64} className="text-gray-300" />
                        )}
                        <div className="legado-dependente-info">
                            <p className="nome">{dep.nome}</p>
                            {dep.data_nascimento && <p className="nascimento">★ {formatBR(dep.data_nascimento)}</p>}
                            {dep.falecido && dep.data_falecimento && (
                                <p className="falecido">† {formatBR(dep.data_falecimento)}</p>
                            )}
                        </div>
                        <div className="legado-dependente-actions" style={{ zIndex: 2 }}>
                            <button
                                onClick={e => { e.stopPropagation(); navigate(`/legado-app/dependentes/editar/${dep.id}`); }}
                                title="Editar"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    dep.falecido ? reativarDependente(dep.id) : abrirModalFalecimento(dep.id);
                                }}
                                title={dep.falecido ? "Reativar" : "Encerrar ciclo"}
                                className={dep.falecido ? "" : "lapide"}
                            >
                                {dep.falecido ? <UserPlus size={18} /> : <Flower2 size={18} />}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Botão flutuante de adicionar dependente */}
                <div className="w-full flex justify-center mt-4">
                    <button
                        className="legado-fab"
                        title="Adicionar dependente"
                        onClick={() => navigate("/legado-app/dependentes/novo")}
                    >
                        <Plus /> Adicionar dependente
                    </button>
                </div>

                {/* Modal de data de falecimento */}
                {modalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                        onClick={() => setModalOpen(false)}
                        style={{ animation: "fadeIn .2s" }}
                        key={modalDepId}
                    >
                        <div
                            className="bg-white rounded-xl p-6 max-w-xs w-full shadow-lg"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-lg font-bold text-center mb-2 text-[#255f4f]">
                                Data de falecimento
                            </h3>
                            <input
                                type="text"
                                maxLength={10}
                                placeholder="DD/MM/AAAA"
                                className="legado-input mb-3"
                                value={modalData}
                                onChange={e => {
                                    setModalData(formatarData(e.target.value));
                                    setDataErro(""); // Limpa erro ao digitar
                                }}
                                autoFocus
                                ref={inputRef}
                            />
                            {dataErro && (
                                <div style={{ color: "#dc3545", fontSize: "0.95rem", marginBottom: 8, textAlign: "center" }}>
                                    {dataErro}
                                </div>
                            )}
                            <button
                                className="legado-button w-full mb-2"
                                disabled={modalData.length !== 10}
                                onClick={salvarFalecimento}
                            >
                                Salvar
                            </button>
                            <button
                                className="w-full text-[#337b68] font-bold py-2 rounded-lg"
                                style={{ background: "none" }}
                                onClick={() => setModalOpen(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
