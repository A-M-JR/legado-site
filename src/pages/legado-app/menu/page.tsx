// src/pages/legado-app/MenuPage.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    Edit, Plus, UserPlus, UserCircle, Flower2,
    Sparkles, Heart, Loader2, ChevronLeft, X, Star, Cross
} from "lucide-react";
import { checkValidDateBR, formatBR } from "../../../utils/formatDateToBR";
import { toast } from "@/hooks/use-toast";
import { dataBRParaISO, dataISOParaBR, maskDataBR } from "@/lib/masks";
import { Divisor } from "@/components/recordacoes/Ornamentos";
import { temaMemorial } from "@/lib/legadoTema";
import LegadoNav, { LEGADO_NAV_ESPACO } from "@/components/legado/LegadoNav";
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

export default function MenuPage() {
    const navigate = useNavigate();
    const { userProfile } = useOutletContext<{ userProfile?: { role: string; titular_id: string | null } }>();
    const [titular, setTitular] = useState<Titular | null>(null);
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "vivos" | "falecidos">("todos");
    const [exercicioSugerido, setExercicioSugerido] = useState<any>(null);
    const [jaCuidouHoje, setJaCuidouHoje] = useState<boolean>(false);
    const [pageLoading, setPageLoading] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState<null | "titular" | "dependente">(null);
    const [modalDepId, setModalDepId] = useState<string | null>(null);
    const [modalData, setModalData] = useState<string>("");
    const [dataErro, setDataErro] = useState<string>("");

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (modalOpen && inputRef.current) inputRef.current.focus();
    }, [modalOpen]);

    useEffect(() => {
        (async () => {
            const { data: userRes } = await supabase.auth.getUser();
            const user = userRes?.user;
            if (!user) return;

            let titularData: Titular | null = null;

            if (userProfile?.role === "familiar" && userProfile.titular_id) {
                const { data } = await supabase
                    .from("titulares")
                    .select("*")
                    .eq("id", userProfile.titular_id)
                    .maybeSingle();
                titularData = data as Titular | null;
            } else {
                const { data } = await supabase
                    .from("titulares")
                    .select("*")
                    .eq("auth_id", user.id)
                    .maybeSingle();
                titularData = data as Titular | null;
            }

            if (titularData) {
                setTitular(titularData);
                const { data: dependentesData } = await supabase
                    .from("dependentes")
                    .select("*")
                    .eq("id_titular", titularData.id);
                setDependentes((dependentesData as Dependente[]) || []);
            }

            const [listaExResult, registroHojeResult] = await Promise.all([
                supabase.from("exercicios_autocuidado").select("id, titulo").limit(1),
                supabase
                    .from("exercicios_realizados")
                    .select("id")
                    .eq("auth_id", user.id)
                    .gte("realizado_em", new Date().toISOString().split("T")[0])
                    .maybeSingle(),
            ]);

            if (listaExResult.data?.[0]) setExercicioSugerido(listaExResult.data[0]);
            setJaCuidouHoje(!!registroHojeResult.data);
            setPageLoading(false);
        })();
    }, [userProfile]);

    const dependentesFiltrados = useMemo(() => {
        if (filtro === "todos") return dependentes;
        return dependentes.filter(d => (filtro === "vivos" ? !d.falecido : d.falecido));
    }, [filtro, dependentes]);

    const contagem = useMemo(() => ({
        total: dependentes.length,
        vivos: dependentes.filter(d => !d.falecido).length,
        falecidos: dependentes.filter(d => d.falecido).length
    }), [filtro, dependentes]);

    const abrirModalFalecimentoTitular = () => {
        setModalTarget("titular");
        setModalDepId(null);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    };

    const abrirModalFalecimentoDependente = (depId: string) => {
        setModalTarget("dependente");
        setModalDepId(depId);
        setModalData("");
        setDataErro("");
        setModalOpen(true);
    };

    const confirmarFalecimento = async () => {
        const result = checkValidDateBR(modalData);
        if (!result.valid) {
            setDataErro(result.error || "Data inválida. Use DD/MM/AAAA");
            return;
        }

        const dataISO = dataBRParaISO(modalData);

        // Falecimento não pode ser antes do nascimento (há cadastros com nascimento em ISO e em dd/MM/aaaa).
        const nascimentoRaw = modalTarget === "titular"
            ? titular?.data_nascimento
            : dependentes.find((dep) => dep.id === modalDepId)?.data_nascimento;
        const nascimentoISO = nascimentoRaw ? dataBRParaISO(dataISOParaBR(nascimentoRaw)) : "";
        if (nascimentoISO && dataISO < nascimentoISO) {
            setDataErro(`A data de falecimento não pode ser anterior ao nascimento (${dataISOParaBR(nascimentoRaw!)}).`);
            return;
        }

        if (modalTarget === "titular" && titular) {
            const { error } = await supabase
                .from("titulares")
                .update({ falecido: true, data_falecimento: dataISO })
                .eq("id", titular.id);

            if (!error) {
                setTitular({ ...titular, falecido: true, data_falecimento: dataISO });
                toast({ title: "Ciclo encerrado com respeito." });
            } else {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar." });
            }
        } else if (modalTarget === "dependente" && modalDepId) {
            const { error } = await supabase
                .from("dependentes")
                .update({ falecido: true, data_falecimento: dataISO })
                .eq("id", modalDepId);

            if (!error) {
                setDependentes(prev =>
                    prev.map(d => d.id === modalDepId ? { ...d, falecido: true, data_falecimento: dataISO } : d)
                );
                toast({ title: "Ciclo encerrado com respeito." });
            } else {
                toast({ variant: "destructive", title: "Erro", description: "Não foi possível registrar." });
            }
        }

        setModalOpen(false);
    };

    const reativarPessoa = async (tipo: "titular" | "dependente", id: string) => {
        const tabela = tipo === "titular" ? "titulares" : "dependentes";
        const { error } = await supabase
            .from(tabela)
            .update({ falecido: false, data_falecimento: null })
            .eq("id", id);

        if (!error) {
            if (tipo === "titular" && titular) {
                setTitular({ ...titular, falecido: false, data_falecimento: undefined });
            } else {
                setDependentes(prev =>
                    prev.map(d => d.id === id ? { ...d, falecido: false, data_falecimento: undefined } : d)
                );
            }
            toast({ title: "Pessoa reativada com sucesso." });
        } else {
            toast({ variant: "destructive", title: "Erro", description: "Não foi possível reativar." });
        }
    };

    return (
        <div className={`legado-app-wrapper min-h-screen pt-4 px-4 overflow-x-hidden ${LEGADO_NAV_ESPACO}`}>
            {pageLoading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-10 h-10 text-tema-titulo animate-spin" />
                </div>
            ) : (
            <>

            {/* Top Bar - Botão Voltar ao Menu de Módulos */}
            <div className="w-full max-w-md md:max-w-5xl mx-auto mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                <button
                    onClick={() => navigate("/legado-app/selecao-modulos")}
                    className="flex items-center gap-1.5 text-tema-titulo font-bold text-sm bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={18} />
                    Menu Principal
                </button>
                <div className="opacity-20">
                    <Heart size={20} className="text-tema-titulo" />
                </div>
            </div>

            <div className="w-full max-w-md md:max-w-5xl mx-auto space-y-6">

                {/* Saudação */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <div className="flex items-center justify-center gap-2 text-tema-titulo">
                        <Heart size={22} fill="currentColor" className="opacity-20" />
                        <h2 className="text-2xl font-bold tracking-tight">Como você está hoje?</h2>
                    </div>
                    <p className="text-base text-tema-texto opacity-80">Um passo de cada vez. Estamos aqui com você.</p>
                    {temaMemorial && (
                        <div className="pt-3">
                            <Divisor />
                        </div>
                    )}
                </div>

                <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-8 md:items-start">
                <aside className="space-y-6 md:sticky md:top-24">
                {/* TITULAR - Card Premium Estilo Imagem */}
                {titular && (
                    <div
                        role="button"
                        tabIndex={0}
                        className="legado-titular-container group relative overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 animate-in zoom-in-95 cursor-pointer"
                        onClick={() => navigate(`/legado-app/recordacoes/list/${titular.id}`)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/legado-app/recordacoes/list/${titular.id}`); }}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                        {titular.imagem_url ? (
                            <img src={titular.imagem_url} alt="Titular" className="shadow-inner border-4 border-white" />
                        ) : (
                            <div className="w-[100px] h-[100px] rounded-full bg-white/50 flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                                <UserCircle size={60} className="text-tema-titulo/20" />
                            </div>
                        )}

                        <h2 className="text-tema-titulo font-bold text-2xl">{titular.nome}</h2>
                        <p className="text-sm font-medium opacity-70">★ {formatBR(titular.data_nascimento)}</p>

                        <div className="mt-3">
                            <span className={`text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full ${titular.falecido ? "bg-gray-200 text-gray-600" : "bg-tema-borda-forte text-tema-titulo"}`}>
                                {titular.falecido ? "Ausente" : "Presente"}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-6 w-full px-2">
                            <button
                                className="flex-1 flex items-center justify-center gap-2 bg-tema-primaria hover:bg-tema-primaria-escura text-white py-3 rounded-xl font-bold text-base transition-all active:scale-95 shadow-md"
                                onClick={e => { e.stopPropagation(); navigate(`/legado-app/titulares/editar/${titular.id}`); }}
                            >
                                <Edit size={18} /> Editar
                            </button>
                            <button
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-base text-white transition-all active:scale-95 shadow-md ${titular.falecido ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#dc3545] hover:bg-[#c82333]"}`}
                                onClick={e => {
                                    e.stopPropagation();
                                    titular.falecido ? reativarPessoa("titular", titular.id) : abrirModalFalecimentoTitular();
                                }}
                            >
                                {titular.falecido ? <><UserPlus size={18} /> Reativar</> : <><Flower2 size={18} /> Encerrar ciclo</>}
                            </button>
                        </div>
                    </div>
                )}

                {/* EXERCÍCIO SUGERIDO - Estilo Pontilhado da Imagem */}
                {exercicioSugerido && !jaCuidouHoje && (
                    <div className="bg-white/60 backdrop-blur-sm border-2 border-dashed border-[#F89C5C] rounded-2xl p-6 relative animate-in slide-in-from-right duration-700">
                        <Sparkles size={22} className="absolute top-5 left-5 text-[#F89C5C] opacity-60" />
                        <div className="text-center space-y-3">
                            <h3 className="text-[#F89C5C] text-xs font-bold uppercase tracking-widest">Um passo leve para hoje</h3>
                            <p className="font-bold text-[#2d2d2d] text-xl leading-snug">{exercicioSugerido.titulo}</p>
                            <p className="text-sm text-gray-500">Pequena prática para cuidar de você agora.</p>
                            <button
                                onClick={() => navigate(`/legado-app/exercicios/${exercicioSugerido.id}`)}
                                className="mt-3 bg-[#F89C5C] hover:bg-[#e68a4b] text-white px-10 py-3 rounded-xl font-bold text-base shadow-lg transition-all active:scale-95"
                            >
                                Começar agora
                            </button>
                        </div>
                    </div>
                )}

                {jaCuidouHoje && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-2xl p-6 text-center animate-in slide-in-from-right duration-700">
                        <Sparkles size={28} className="mx-auto mb-3 text-emerald-600" />
                        <h3 className="text-emerald-700 font-bold text-lg mb-2">Você já cuidou de si hoje! 💚</h3>
                        <p className="text-sm text-emerald-600">Continue assim. Cada passo importa.</p>
                    </div>
                )}

                {/* Botão Adicionar (abaixo da sugestão de exercício) */}
                <button
                    onClick={() => navigate("/legado-app/dependentes/novo")}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-tema-borda-forte bg-white/70 hover:bg-white hover:border-tema-primaria text-tema-titulo px-6 py-4 font-bold transition-all active:scale-[0.99]"
                >
                    <Plus size={20} /> Adicionar dependente
                </button>
                </aside>

                <section className="space-y-4">
                {/* Cabeçalho da família + filtros */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-tema-titulo">
                        Sua família <span className="text-sm font-normal text-tema-suave">({contagem.total})</span>
                    </h3>
                    <div className="inline-flex rounded-full bg-white border border-tema-borda p-1 shadow-sm" role="tablist" aria-label="Filtrar dependentes">
                        {([
                            ["todos", `Todos ${contagem.total}`],
                            ["vivos", `Presentes ${contagem.vivos}`],
                            ["falecidos", `Em memória ${contagem.falecidos}`],
                        ] as const).map(([valor, rotulo]) => (
                            <button
                                key={valor}
                                role="tab"
                                aria-selected={filtro === valor}
                                onClick={() => setFiltro(valor)}
                                className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                                    filtro === valor ? "bg-tema-primaria text-white shadow-sm" : "text-tema-suave hover:text-tema-titulo"
                                }`}
                            >
                                {rotulo}
                            </button>
                        ))}
                    </div>
                </div>

                {/* DEPENDENTES */}
                {dependentesFiltrados.length === 0 ? (
                    <div className="text-center py-12 px-4 bg-white/70 rounded-2xl border border-dashed border-tema-borda-forte">
                        <p className="font-semibold text-tema-titulo">Ninguém por aqui ainda.</p>
                        <p className="text-sm text-tema-suave mt-1">Adicione as pessoas importantes da sua história.</p>
                    </div>
                ) : (
                    <div className="grid gap-3 lg:grid-cols-2">
                        {dependentesFiltrados.map((dep) => (
                            <div
                                key={dep.id}
                                role="button"
                                tabIndex={0}
                                className="group bg-white rounded-2xl p-4 flex items-center gap-4 border border-tema-borda shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                                onClick={() => navigate(`/legado-app/recordacoes/list/${dep.id}`)}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate(`/legado-app/recordacoes/list/${dep.id}`); }}
                            >
                                <div className={`shrink-0 rounded-full p-0.5 ${dep.falecido ? "bg-tema-dourado/60" : "bg-tema-borda-forte"}`}>
                                    {dep.imagem_url ? (
                                        <img src={dep.imagem_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white" />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-tema-claro-2 flex items-center justify-center border-2 border-white">
                                            <UserCircle size={30} className="text-tema-medio/40" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-tema-titulo text-base truncate">{dep.nome}</p>
                                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-tema-suave">
                                        <span className="inline-flex items-center gap-1 whitespace-nowrap" title="Nascimento">
                                            <Star size={11} className="fill-current shrink-0" aria-label="Nascimento" />
                                            {formatBR(dep.data_nascimento)}
                                        </span>
                                        {dep.falecido && dep.data_falecimento && (
                                            <span className="inline-flex items-center gap-1 whitespace-nowrap" title="Falecimento">
                                                <Cross size={11} className="shrink-0" aria-label="Falecimento" />
                                                {formatBR(dep.data_falecimento)}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={`inline-block mt-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                                            dep.falecido ? "bg-tema-claro text-tema-dourado" : "bg-tema-claro-2 text-tema-medio"
                                        }`}
                                    >
                                        {dep.falecido ? "Em memória" : "Presente"}
                                    </span>
                                </div>

                                <div className="flex flex-col gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={() => navigate(`/legado-app/dependentes/editar/${dep.id}`)}
                                        className="p-2 rounded-xl bg-tema-claro-2 text-tema-medio hover:bg-tema-claro hover:text-tema-titulo transition"
                                        aria-label={`Editar ${dep.nome}`}
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => (dep.falecido ? reativarPessoa("dependente", dep.id) : abrirModalFalecimentoDependente(dep.id))}
                                        className={`p-2 rounded-xl transition ${
                                            dep.falecido
                                                ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                                : "bg-red-50 text-[#cc3c3c] hover:bg-red-100"
                                        }`}
                                        aria-label={dep.falecido ? `Reativar ${dep.nome}` : `Encerrar ciclo de ${dep.nome}`}
                                        title={dep.falecido ? "Reativar" : "Encerrar ciclo"}
                                    >
                                        {dep.falecido ? <UserPlus size={16} /> : <Flower2 size={16} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                </section>
                </div>
            </div>

            <LegadoNav />

            {/* MODAL DE FALECIMENTO */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-tema-titulo">Encerrar ciclo com respeito</h3>
                            <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <p className="text-base text-gray-600 mb-6">Informe a data de falecimento para registrar com carinho.</p>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="DD/MM/AAAA"
                            value={modalData}
                            onChange={e => setModalData(maskDataBR(e.target.value))}
                            inputMode="numeric"
                            maxLength={10}
                            className="legado-input text-base mb-2"
                        />
                        {dataErro && <p className="text-sm text-red-600 mb-4">{dataErro}</p>}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-bold text-base transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmarFalecimento}
                                className="flex-1 bg-tema-primaria hover:bg-tema-primaria-escura text-white py-3 rounded-xl font-bold text-base transition-all active:scale-95 shadow-md"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
}