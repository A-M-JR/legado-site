// src/pages/legado-app/MenuPage.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Edit, Plus, UserPlus, UserCircle, Flower2 } from "lucide-react";
import { isValidDateBR, checkValidDateBR, formatBR } from "../../../utils/formatDateToBR";
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

    // Modal para data de falecimento
    const [modalOpen, setModalOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState<null | "titular" | "dependente">(null);
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

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [modalOpen, modalDepId, modalTarget]);

    // Filtro
    const dependentesFiltrados = useMemo(() => {
        if (filtro === "todos") return dependentes;
        return dependentes.filter((d) => (filtro === "vivos" ? !d.falecido : d.falecido));
    }, [filtro, dependentes]);

    // Modal: abrir para dependente
    function abrirModalFalecimentoDependente(depId: string) {
        setModalTarget("dependente");
        setModalDepId(depId);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    }

    // Modal: abrir para titular
    function abrirModalFalecimentoTitular() {
        setModalTarget("titular");
        setModalDepId(null);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    }

    // Modal: salvar (titular ou dependente)
    async function salvarFalecimento() {
        const result = checkValidDateBR(modalData);
        if (!result.valid) {
            setDataErro(result.error);
            return;
        }
        setDataErro("");
        const [d, m, y] = modalData.split("/");
        const dataISO = `${y}-${m}-${d}`;

        if (modalTarget === "dependente" && modalDepId) {
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
        } else if (modalTarget === "titular" && titular) {
            const { error } = await supabase
                .from("titulares")
                .update({
                    falecido: true,
                    data_falecimento: dataISO,
                })
                .eq("id", titular.id);
            if (!error) {
                setTitular({ ...titular, falecido: true, data_falecimento: dataISO });
                setModalOpen(false);
                setModalData("");
            }
        }
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

    function formatarData(valor: string) {
        valor = valor.replace(/\D/g, '');
        if (valor.length > 2 && valor.length <= 4) {
            valor = valor.replace(/(\d{2})(\d+)/, '$1/$2');
        } else if (valor.length > 4) {
            valor = valor.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3');
        }
        return valor.slice(0, 10);
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4">
            <div className="legado-form-card w-full max-w-md relative">

                {/* TITULAR */}
                {titular && (
                    <div
                        className="legado-titular-container mb-6 cursor-pointer"
                        onClick={() => navigate(`/legado-app/recordacoes/list/${titular.id}`)}
                        style={{ transition: "background 0.2s" }}
                        tabIndex={0}
                    >
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
                                onClick={e => { e.stopPropagation(); navigate(`/legado-app/titulares/editar/${titular.id}`); }}
                            >
                                <Edit size={16} className="inline mr-1" /> Editar
                            </button>
                            <button
                                className="legado-button"
                                style={{ backgroundColor: titular.falecido ? "#3cb371" : "#dc3545" }}
                                onClick={e => {
                                    e.stopPropagation();
                                    titular.falecido
                                        ? reativarTitular()
                                        : abrirModalFalecimentoTitular();
                                }}
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
                                    dep.falecido ? reativarDependente(dep.id) : abrirModalFalecimentoDependente(dep.id);
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

                {/* Modal de data de falecimento (titular ou dependente) */}
                {modalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
                        onClick={() => setModalOpen(false)}
                        style={{ animation: "fadeIn .2s" }}
                        key={modalDepId ?? "titular"}
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
                                    const value = formatarData(e.target.value);
                                    setModalData(value);
                                    const res = checkValidDateBR(value);
                                    setDataErro(res.valid ? "" : res.error || "");
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
                                disabled={!checkValidDateBR(modalData).valid}
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
