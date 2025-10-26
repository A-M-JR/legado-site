// src/pages/legado-app/MenuPage.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Edit, Plus, UserPlus, UserCircle, Flower2, NotebookPen, Sparkles, Heart, History } from "lucide-react";
import { checkValidDateBR, formatBR } from "../../../utils/formatDateToBR";
import "@/styles/legado-app.css";

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

type Categoria =
    | "respiracao" | "movimento" | "gratidao" | "mindfulness" | "criatividade" | "conexao";

type ExercicioSugerido = {
    id: string;
    titulo: string;
    descricao?: string | null;
    categoria?: Categoria | null;
    duracao_minutos?: number | null;
    grupo?: string | null;
};

export default function MenuPage() {
    const navigate = useNavigate();
    const [titular, setTitular] = useState<Titular | null>(null);
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "vivos" | "falecidos">("todos");
    const [exercicioSugerido, setExercicioSugerido] = useState<ExercicioSugerido | null>(null);
    const [jaCuidouHoje, setJaCuidouHoje] = useState<boolean>(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState<null | "titular" | "dependente">(null);
    const [modalDepId, setModalDepId] = useState<string | null>(null);
    const [modalData, setModalData] = useState<string>("");
    const [dataErro, setDataErro] = useState<string>("");

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen, modalDepId, modalTarget]);

    useEffect(() => {
        (async () => {
            const { data: userRes } = await supabase.auth.getUser();
            const user = userRes?.user;

            if (!user) return;

            // Carrega titular e dependentes
            const { data: titularData } = await supabase
                .from("titulares")
                .select("*")
                .eq("auth_id", user.id)
                .maybeSingle();

            if (titularData) {
                setTitular(titularData as Titular);
                const { data: dependentesData } = await supabase
                    .from("dependentes")
                    .select("*")
                    .eq("id_titular", (titularData as Titular).id);
                setDependentes((dependentesData as Dependente[]) || []);
            }

            // SUGESTÃO DO DIA — sem repetir o último e não sugerir feito hoje
            const start = new Date(); start.setHours(0, 0, 0, 0);
            const end = new Date(); end.setHours(23, 59, 59, 999);

            const { data: feitosHoje } = await supabase
                .from("exercicios_realizados")
                .select("exercicio_id, realizado_em")
                .eq("auth_id", user.id)
                .gte("realizado_em", start.toISOString())
                .lte("realizado_em", end.toISOString());

            const idsFeitosHoje = new Set((feitosHoje || []).map(r => r.exercicio_id as string));
            setJaCuidouHoje((feitosHoje || []).length > 0);

            const { data: ultimoRealizado } = await supabase
                .from("exercicios_realizados")
                .select("exercicio_id, realizado_em")
                .eq("auth_id", user.id)
                .order("realizado_em", { ascending: false })
                .limit(1);

            let lastIdToAvoid: string | null = null;
            const last = (ultimoRealizado && ultimoRealizado[0]) || null;
            if (last) {
                const lastDate = new Date(last.realizado_em);
                const isToday = lastDate >= start && lastDate <= end;
                if (!isToday) lastIdToAvoid = last.exercicio_id as string;
            }

            const { data: listaEx } = await supabase
                .from("exercicios_autocuidado")
                .select("id, titulo, categoria")
                .order("titulo", { ascending: true })
                .limit(500);

            if (!listaEx || listaEx.length === 0) {
                setExercicioSugerido(null);
                return;
            }

            const candidatosBase = listaEx.filter(e => !idsFeitosHoje.has(e.id));
            const candidatos = (lastIdToAvoid)
                ? candidatosBase.filter(e => e.id !== lastIdToAvoid)
                : candidatosBase;

            let escolhido: any = null;
            if (candidatos.length > 0) {
                escolhido = candidatos[Math.floor(Math.random() * candidatos.length)];
            } else if (candidatosBase.length > 0) {
                escolhido = candidatosBase[Math.floor(Math.random() * candidatosBase.length)];
            } else {
                escolhido = null;
            }

            if (escolhido) {
                setExercicioSugerido({
                    id: escolhido.id,
                    titulo: escolhido.titulo,
                    categoria: (escolhido as any).categoria ?? null,
                    descricao: null,
                    duracao_minutos: null,
                    grupo: null
                });
            } else {
                setExercicioSugerido(null);
            }
        })();
    }, []);

    const dependentesFiltrados = useMemo(() => {
        if (filtro === "todos") return dependentes;
        return dependentes.filter(d => (filtro === "vivos" ? !d.falecido : d.falecido));
    }, [filtro, dependentes]);

    const contagem = useMemo(() => {
        const vivos = dependentes.filter(d => !d.falecido).length;
        const falecidos = dependentes.filter(d => d.falecido).length;
        return { total: dependentes.length, vivos, falecidos };
    }, [dependentes]);

    function abrirModalFalecimentoDependente(depId: string) {
        setModalTarget("dependente");
        setModalDepId(depId);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    }

    function abrirModalFalecimentoTitular() {
        setModalTarget("titular");
        setModalDepId(null);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    }

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
                .update({ falecido: true, data_falecimento: dataISO })
                .eq("id", modalDepId);
            if (!error) {
                setDependentes(prev =>
                    prev.map(dep => dep.id === modalDepId ? { ...dep, falecido: true, data_falecimento: dataISO } : dep)
                );
                setModalOpen(false);
                setModalData("");
            }
        } else if (modalTarget === "titular" && titular) {
            const { error } = await supabase
                .from("titulares")
                .update({ falecido: true, data_falecimento: dataISO })
                .eq("id", titular.id);
            if (!error) {
                setTitular({ ...titular, falecido: true, data_falecimento: dataISO });
                setModalOpen(false);
                setModalData("");
            }
        }
    }

    async function reativarTitular() {
        if (!titular) return;
        const { error } = await supabase
            .from("titulares")
            .update({ falecido: false, data_falecimento: null })
            .eq("id", titular.id);
        if (!error) setTitular({ ...titular, falecido: false, data_falecimento: undefined });
    }

    async function reativarDependente(depId: string) {
        const { error } = await supabase
            .from("dependentes")
            .update({ falecido: false, data_falecimento: null })
            .eq("id", depId);
        if (!error) {
            setDependentes(prev =>
                prev.map(dep => dep.id === depId ? { ...dep, falecido: false, data_falecimento: undefined } : dep)
            );
        }
    }

    function formatarData(valor: string) {
        valor = valor.replace(/\D/g, "");
        if (valor.length > 2 && valor.length <= 4) valor = valor.replace(/(\d{2})(\d+)/, "$1/$2");
        else if (valor.length > 4) valor = valor.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
        return valor.slice(0, 10);
    }

    return (
        <div className="legado-app-wrapper flex items-center justify-center min-h-screen px-4 pb-20">
            <div className="legado-form-card w-full max-w-md relative">

                {/* Header suave + saudação (centralizado) */}
                <div className="mb-3 text-center">
                    <div className="flex items-center justify-center gap-2 text-[#255f4f]">
                        <Heart size={18} />
                        <h2 className="text-lg font-semibold">Como você está hoje?</h2>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                        Um passo de cada vez. Estamos aqui para caminhar com você.
                    </p>
                </div>

                {/* TITULAR (apresentação melhorada e centralizada) */}
                {titular && (
                    <div
                        className="legado-titular-container mb-6 cursor-pointer"
                        onClick={() => navigate(`/legado-app/recordacoes/list/${titular.id}`)}
                        style={{ transition: "background 0.2s" }}
                        tabIndex={0}
                    >
                        {titular.imagem_url ? (
                            <img src={titular.imagem_url} alt="Titular" />
                        ) : (
                            <UserCircle size={100} className="text-gray-300 mb-2" />
                        )}
                        <h2 className="text-center">{titular.nome}</h2>
                        <div className="flex items-center justify-center gap-2 mb-1">
                            {titular.data_nascimento && <p>★ {formatBR(titular.data_nascimento)}</p>}
                            {titular.falecido && titular.data_falecimento && (
                                <p className="legado-dependente-info falecido">• † {formatBR(titular.data_falecimento)}</p>
                            )}
                        </div>
                        <span
                            className={`text-xs px-2 py-1 rounded-full ${titular.falecido ? "bg-gray-100 text-gray-600" : "bg-green-100 text-green-700"}`}
                            onClick={(e) => e.stopPropagation()}
                            title={titular.falecido ? "Ausente" : "Presente"}
                        >
                            {titular.falecido ? "Ausente" : "Presente"}
                        </span>

                        {/* Ações (centralizadas) */}
                        <div className="legado-perfil-actions">
                            <button
                                className="legado-button"
                                onClick={e => { e.stopPropagation(); navigate(`/legado-app/titulares/editar/${titular.id}`); }}
                                title="Editar perfil"
                            >
                                <Edit size={16} className="inline" /> Editar
                            </button>
                            <button
                                className="legado-button"
                                style={{ backgroundColor: titular.falecido ? "#3cb371" : "#dc3545" }}
                                onClick={e => {
                                    e.stopPropagation();
                                    titular.falecido ? reativarTitular() : abrirModalFalecimentoTitular();
                                }}
                            >
                                {titular.falecido ? (
                                    <>
                                        <UserPlus size={16} className="inline" />
                                        Reativar
                                    </>
                                ) : (
                                    <>
                                        <Flower2 size={16} className="inline" />
                                        Encerrar ciclo
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Menus (centralizados) */}
                        {/* <div className="grid grid-cols-2 gap-8 mt-3 w-full justify-items-center">
                            <button
                                className="legado-button w-full"
                                onClick={e => { e.stopPropagation(); navigate("/legado-app/diario"); }}
                                style={{ backgroundColor: "#6c63ff" }}
                                title="Meu Diário do Luto"
                            >
                                <NotebookPen size={16} />
                                Diário
                            </button>
                            <button
                                className="legado-button w-full"
                                onClick={e => { e.stopPropagation(); navigate("/legado-app/exercicios"); }}
                                style={{ backgroundColor: "#ff9a56" }}
                                title="Exercícios para Melhorar o Dia"
                            >
                                <Sparkles size={16} />
                                Exercícios
                            </button>
                        </div> */}
                    </div>
                )}

                {/* EXERCÍCIO SUGERIDO DO DIA (sem botão Histórico) */}
                <div className="mb-4">
                    {exercicioSugerido ? (
                        <div className="p-4 rounded-lg border-2 border-dashed border-[#ff9a56] bg-orange-50">
                            <div className="flex items-start gap-3">
                                <Sparkles size={22} className="text-[#ff9a56] flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-[#ff9a56] text-sm mb-1 text-center">
                                        Um passo leve para hoje
                                    </h3>
                                    <p className="font-bold text-gray-800 text-center">{exercicioSugerido.titulo}</p>
                                    <p className="text-sm text-gray-600 mt-1 text-center">
                                        Pequena prática para cuidar de você agora.
                                    </p>

                                    <div className="flex items-center justify-center mt-3">
                                        <button
                                            className="legado-button"
                                            style={{ backgroundColor: "#ff9a56", minWidth: 180 }}
                                            onClick={() => navigate(`/legado-app/exercicios/${exercicioSugerido.id}`)}
                                        >
                                            Começar agora
                                        </button>
                                    </div>

                                    {jaCuidouHoje && (
                                        <p className="text-xs text-green-700 mt-2 text-center">
                                            Você cuidou de si hoje. Se quiser, pode repetir ou explorar outro exercício.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-center">
                            <p className="font-semibold text-gray-700">Tudo feito por hoje</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Que tal escrever um pouco no Diário ou rever memórias?
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-3">
                                <button
                                    className="legado-button"
                                    style={{ backgroundColor: "#6c63ff" }}
                                    onClick={() => navigate("/legado-app/diario")}
                                >
                                    Abrir Diário
                                </button>
                                <button
                                    className="legado-button"
                                    style={{ backgroundColor: "#ff9a56" }}
                                    onClick={() => navigate("/legado-app/exercicios")}
                                >
                                    Ver exercícios
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* FILTROS (centralizados) */}
                <div className="legado-filtro-buttons justify-center">
                    <button className={filtro === "todos" ? "active" : ""} onClick={() => setFiltro("todos")}>
                        Todos ({contagem.total})
                    </button>
                    <button className={filtro === "vivos" ? "active" : ""} onClick={() => setFiltro("vivos")}>
                        Presente ({contagem.vivos})
                    </button>
                    <button className={filtro === "falecidos" ? "active" : ""} onClick={() => setFiltro("falecidos")}>
                        Ausente ({contagem.falecidos})
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

                {/* Botão flutuante de adicionar dependente (centralizado) */}
                <div className="w-full flex justify-center mt-4">
                    <button
                        className="legado-fab"
                        title="Adicionar dependente"
                        onClick={() => navigate("/legado-app/dependentes/novo")}
                    >
                        <Plus /> Adicionar dependente
                    </button>
                </div>
            </div>

            {/* Bottom bar simples para polegar (mobile-first) */}
            <nav
                className="fixed bottom-3 left-0 right-0 mx-auto max-w-md bg-white/90 backdrop-blur border rounded-xl shadow-sm px-3 py-2 flex items-center justify-around"
                style={{ zIndex: 40 }}
            >
                <button className="text-[#255f4f] flex flex-col items-center text-xs" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
                    <Heart size={18} /> Menu
                </button>
                <button className="text-[#6c63ff] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/diario")}>
                    <NotebookPen size={18} /> Diário
                </button>
                <button className="text-[#ff9a56] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/exercicios")}>
                    <Sparkles size={18} /> Exercícios
                </button>
                <button className="text-[#2563eb] flex flex-col items-center text-xs" onClick={() => navigate("/legado-app/exercicios/historico")}>
                    <History size={18} /> Histórico
                </button>
            </nav>


            {/* Modal de data de falecimento */}
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
                                const nums = e.target.value.replace(/\D/g, "");
                                let v = nums;
                                if (v.length > 2 && v.length <= 4) v = v.replace(/(\d{2})(\d+)/, "$1/$2");
                                else if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
                                v = v.slice(0, 10);
                                setModalData(v);
                                const res = checkValidDateBR(v);
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
                            disabled={!!dataErro || !modalData}
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
    );
}