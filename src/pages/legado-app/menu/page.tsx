// src/pages/legado-app/MenuPage.tsx
import { useRef, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
    Edit, Plus, UserPlus, UserCircle, Flower2, NotebookPen,
    Sparkles, Heart, History, LogOut, Loader2, ChevronLeft, X
} from "lucide-react";
import { checkValidDateBR, formatBR } from "../../../utils/formatDateToBR";
import { toast } from "@/hooks/use-toast";
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
    const [titular, setTitular] = useState<Titular | null>(null);
    const [dependentes, setDependentes] = useState<Dependente[]>([]);
    const [filtro, setFiltro] = useState<"todos" | "vivos" | "falecidos">("todos");
    const [exercicioSugerido, setExercicioSugerido] = useState<any>(null);
    const [jaCuidouHoje, setJaCuidouHoje] = useState<boolean>(false);
    const [loggingOut, setLoggingOut] = useState(false);

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

            // Buscar exercício sugerido
            const { data: listaEx } = await supabase
                .from("exercicios_autocuidado")
                .select("id, titulo")
                .limit(1);

            if (listaEx && listaEx[0]) setExercicioSugerido(listaEx[0]);

            // Verificar se já cuidou hoje
            const hoje = new Date().toISOString().split("T")[0];
            const { data: registroHoje } = await supabase
                .from("exercicios_realizados")
                .select("id")
                .eq("auth_id", user.id)
                .gte("realizado_em", hoje)
                .maybeSingle();

            setJaCuidouHoje(!!registroHoje);
        })();
    }, []);

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
        if (!checkValidDateBR(modalData)) {
            setDataErro("Data inválida. Use DD/MM/AAAA");
            return;
        }

        const [d, m, y] = modalData.split("/");
        const dataISO = `${y}-${m}-${d}`;

        if (modalTarget === "titular" && titular) {
            const { error } = await supabase
                .from("titulares")
                .update({ falecido: true, data_falecimento: dataISO })
                .eq("id", titular.id);

            if (!error) {
                setTitular({ ...titular, falecido: true, data_falecimento: dataISO });
                toast({ title: "Ciclo encerrado com respeito." });
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
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="legado-app-wrapper min-h-screen pb-32 pt-4 px-4 overflow-x-hidden">

            {/* Top Bar - Botão Voltar ao Menu de Módulos */}
            <div className="w-full max-w-md mx-auto mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top duration-500">
                <button
                    onClick={() => navigate("/legado-app/selecao-modulos")}
                    className="flex items-center gap-1.5 text-[#255f4f] font-bold text-sm bg-white/50 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                >
                    <ChevronLeft size={18} />
                    Menu Principal
                </button>
                <div className="opacity-20">
                    <Heart size={20} className="text-[#255f4f]" />
                </div>
            </div>

            <div className="w-full max-w-md mx-auto space-y-6">

                {/* Saudação */}
                <div className="text-center space-y-1 animate-in fade-in duration-700">
                    <div className="flex items-center justify-center gap-2 text-[#255f4f]">
                        <Heart size={22} fill="#255f4f" className="opacity-20" />
                        <h2 className="text-2xl font-bold tracking-tight">Como você está hoje?</h2>
                    </div>
                    <p className="text-base text-[#4f665a] opacity-80">Um passo de cada vez. Estamos aqui com você.</p>
                </div>

                {/* TITULAR - Card Premium Estilo Imagem */}
                {titular && (
                    <div
                        className="legado-titular-container group relative overflow-hidden border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 animate-in zoom-in-95"
                        onClick={() => navigate(`/legado-app/recordacoes/list/${titular.id}`)}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                        {titular.imagem_url ? (
                            <img src={titular.imagem_url} alt="Titular" className="shadow-inner border-4 border-white" />
                        ) : (
                            <div className="w-[100px] h-[100px] rounded-full bg-white/50 flex items-center justify-center mb-3 border-4 border-white shadow-sm">
                                <UserCircle size={60} className="text-[#255f4f]/20" />
                            </div>
                        )}

                        <h2 className="text-[#255f4f] font-bold text-2xl">{titular.nome}</h2>
                        <p className="text-sm font-medium opacity-70">★ {formatBR(titular.data_nascimento)}</p>

                        <div className="mt-3">
                            <span className={`text-xs uppercase tracking-widest font-bold px-4 py-1.5 rounded-full ${titular.falecido ? "bg-gray-200 text-gray-600" : "bg-[#b5e2d0] text-[#255f4f]"}`}>
                                {titular.falecido ? "Ausente" : "Presente"}
                            </span>
                        </div>

                        <div className="flex gap-3 mt-6 w-full px-2">
                            <button
                                className="flex-1 flex items-center justify-center gap-2 bg-[#5ba58c] hover:bg-[#4c947e] text-white py-3 rounded-xl font-bold text-base transition-all active:scale-95 shadow-md"
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

                {/* FILTROS - Pílulas da Imagem */}
                <div className="flex justify-center gap-2 py-2 animate-in fade-in duration-1000">
                    <button onClick={() => setFiltro("todos")} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filtro === "todos" ? "bg-[#a3d9c4] text-[#255f4f] shadow-sm" : "bg-[#def0e8] text-[#337b68] opacity-60"}`}>
                        Todos ({contagem.total})
                    </button>
                    <button onClick={() => setFiltro("vivos")} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filtro === "vivos" ? "bg-[#a3d9c4] text-[#255f4f] shadow-sm" : "bg-[#def0e8] text-[#337b68] opacity-60"}`}>
                        Presente ({contagem.vivos})
                    </button>
                    <button onClick={() => setFiltro("falecidos")} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${filtro === "falecidos" ? "bg-[#a3d9c4] text-[#255f4f] shadow-sm" : "bg-[#def0e8] text-[#337b68] opacity-60"}`}>
                        Ausente ({contagem.falecidos})
                    </button>
                </div>

                {/* DEPENDENTES - Lista Estilo Imagem */}
                <div className="space-y-3">
                    {dependentesFiltrados.map((dep) => (
                        <div
                            key={dep.id}
                            className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-[#def0e8] hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => navigate(`/legado-app/recordacoes/list/${dep.id}`)}
                        >
                            {dep.imagem_url ? (
                                <img src={dep.imagem_url} alt="Foto" className="w-16 h-16 rounded-full object-cover border-2 border-[#def0e8]" />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#f0f8f6] flex items-center justify-center border-2 border-[#def0e8]">
                                    <UserCircle size={36} className="text-[#337b68]/20" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-bold text-[#2d2d2d] text-base">{dep.nome}</p>
                                <p className="text-xs text-gray-500">★ {formatBR(dep.data_nascimento)}</p>
                                {dep.falecido && <p className="text-xs text-[#cc3c3c] font-bold mt-0.5">† {formatBR(dep.data_falecimento!)}</p>}
                            </div>
                            <div className="flex flex-col gap-2 pr-1" onClick={e => e.stopPropagation()}>
                                <button
                                    onClick={() => navigate(`/legado-app/dependentes/editar/${dep.id}`)}
                                    className="text-[#337b68] opacity-40 hover:opacity-100 transition-opacity"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={() => dep.falecido ? reativarPessoa("dependente", dep.id) : abrirModalFalecimentoDependente(dep.id)}
                                    className={dep.falecido ? "text-emerald-600 hover:scale-110 transition-transform" : "text-[#cc3c3c] opacity-40 hover:opacity-100 transition-opacity"}
                                >
                                    {dep.falecido ? <UserPlus size={20} /> : <Flower2 size={20} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Botão Adicionar */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={() => navigate("/legado-app/dependentes/novo")}
                        className="bg-[#5ba58c] hover:bg-[#4c947e] text-white px-10 py-3.5 rounded-2xl font-bold text-base shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={22} /> Adicionar dependente
                    </button>
                </div>
            </div>

            {/* BOTTOM NAVBAR - Centralizado e Estilo Imagem */}
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/95 backdrop-blur-md border border-[#d8e8e0] rounded-2xl shadow-2xl px-6 py-3.5 flex items-center justify-between z-50 animate-in slide-in-from-bottom duration-500">
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex flex-col items-center gap-1 text-[#255f4f] group">
                    <Heart size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
                </button>
                <button onClick={() => navigate("/legado-app/diario")} className="flex flex-col items-center gap-1 text-[#6c63ff] group">
                    <NotebookPen size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Diário</span>
                </button>
                <button onClick={() => navigate("/legado-app/exercicios")} className="flex flex-col items-center gap-1 text-[#ff9a56] group">
                    <Sparkles size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Exercícios</span>
                </button>
                <button onClick={() => navigate("/legado-app/exercicios/historico")} className="flex flex-col items-center gap-1 text-[#2563eb] group">
                    <History size={22} className="group-active:scale-125 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Histórico</span>
                </button>
                <button onClick={handleLogout} className="flex flex-col items-center gap-1 text-red-500 group">
                    {loggingOut ? <Loader2 size={22} className="animate-spin" /> : <LogOut size={22} className="group-active:scale-125 transition-transform" />}
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Sair</span>
                </button>
            </nav>

            {/* MODAL DE FALECIMENTO */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-[#255f4f]">Encerrar ciclo com respeito</h3>
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
                            onChange={e => setModalData(e.target.value)}
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
                                className="flex-1 bg-[#5ba58c] hover:bg-[#4c947e] text-white py-3 rounded-xl font-bold text-base transition-all active:scale-95 shadow-md"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}