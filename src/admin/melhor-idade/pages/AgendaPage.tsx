import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle2,
    Circle,
    Clock,
    Pill,
    Coffee,
    Moon,
    Sun,
    Plus,
    X,
    User
} from "lucide-react";
import clsx from "clsx";

type Tarefa = {
    id: number;
    hora: string; // "08:00"
    titulo: string;
    desc?: string;
    tipo: "remedio" | "comida" | "higiene" | "atividade";
    feito: boolean;
    periodo: "manha" | "tarde" | "noite";
    responsavel?: string;
};

export default function HoraDoCuidadoPage(): JSX.Element {
    const [tarefas, setTarefas] = useState<Tarefa[]>([
        { id: 1, hora: "08:00", titulo: "Remédio Pressão", desc: "1 comprimido branco", tipo: "remedio", feito: true, periodo: "manha", responsavel: "Maria" },
        { id: 2, hora: "08:30", titulo: "Café da Manhã", desc: "Frutas e torradas", tipo: "comida", feito: true, periodo: "manha", responsavel: "Maria" },
        { id: 3, hora: "12:00", titulo: "Almoço", desc: "Rico em fibras", tipo: "comida", feito: false, periodo: "tarde", responsavel: "João" },
        { id: 4, hora: "14:00", titulo: "Vitaminas", desc: "Cápsula gelatina", tipo: "remedio", feito: false, periodo: "tarde", responsavel: "João" },
        { id: 5, hora: "20:00", titulo: "Preparar para Dormir", desc: "Higiene e relaxamento", tipo: "higiene", feito: false, periodo: "noite", responsavel: "Maria" },
    ]);

    // modal state
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState<"hoje" | "proximas" | "pendentes">("hoje");
    const [periodoAtivo, setPeriodoAtivo] = useState<"manha" | "tarde" | "noite" | "todos">("todos");

    // novo cuidado form
    const [form, setForm] = useState({
        hora: "",
        titulo: "",
        desc: "",
        tipo: "remedio",
        periodo: "manha",
        responsavel: "Maria",
    });

    // mock responsaveis (no futuro obter via API)
    const responsaveis = ["Maria", "João", "Ana"];

    useEffect(() => {
        if (!showModal) {
            setForm({ hora: "", titulo: "", desc: "", tipo: "remedio", periodo: "manha", responsavel: "Maria" });
        } else {
            // evitar scrolling do body ao abrir modal
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [showModal]);

    function toggleTarefa(id: number) {
        setTarefas((prev) => prev.map((t) => (t.id === id ? { ...t, feito: !t.feito } : t)));
    }

    function handleSaveNew(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!form.titulo || !form.hora) {
            // poderia mostrar aviso UX
            return;
        }
        const novo: Tarefa = {
            id: Date.now(),
            hora: form.hora,
            titulo: form.titulo,
            desc: form.desc,
            tipo: form.tipo as Tarefa["tipo"],
            feito: false,
            periodo: form.periodo as Tarefa["periodo"],
            responsavel: form.responsavel,
        };
        setTarefas((prev) => [novo, ...prev].sort((a, b) => (a.hora < b.hora ? -1 : 1)));
        setShowModal(false);
    }

    // filtros simples (protótipo)
    const filtered = tarefas.filter((t) => {
        if (filter === "pendentes" && t.feito) return false;
        if (periodoAtivo !== "todos" && t.periodo !== periodoAtivo) return false;
        return true;
    });

    // agrupa por periodo (manhã/tarde/noite) mantendo ordem de horas
    function groupByPeriodo(list: Tarefa[]) {
        const map: Record<string, Tarefa[]> = { manha: [], tarde: [], noite: [] };
        list.forEach((it) => map[it.periodo].push(it));
        (Object.keys(map) as Array<keyof typeof map>).forEach((k) =>
            map[k].sort((a, b) => (a.hora < b.hora ? -1 : 1))
        );
        return map;
    }

    const grouped = groupByPeriodo(filtered);

    return (
        <div className="space-y-6 pb-28 md:pb-12">
            <section className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#255f4f]">Hora do Cuidado</h1>
                    <p className="text-sm text-[#6b8c7d]">Suporte prático para quem cuida — registre, acompanhe e delegue tarefas do dia a dia.</p>
                </div>

                {/* botão desktop */}
                <div className="hidden md:flex items-center gap-2">
                    <Button onClick={() => setShowModal(true)} className="bg-[#5ba58c] text-white">
                        <Plus className="mr-2 h-4 w-4" /> Novo Cuidado
                    </Button>
                </div>
            </section>

            {/* Filtros principais */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("hoje")}
                        className={clsx("px-4 py-2 rounded-full font-semibold text-sm transition", filter === "hoje" ? "bg-[#255f4f] text-white" : "bg-white text-[#4f665a] border border-[#e6efe9]")}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={() => setFilter("proximas")}
                        className={clsx("px-4 py-2 rounded-full font-semibold text-sm transition", filter === "proximas" ? "bg-[#255f4f] text-white" : "bg-white text-[#4f665a] border border-[#e6efe9]")}
                    >
                        Próximas
                    </button>
                    <button
                        onClick={() => setFilter("pendentes")}
                        className={clsx("px-4 py-2 rounded-full font-semibold text-sm transition", filter === "pendentes" ? "bg-[#255f4f] text-white" : "bg-white text-[#4f665a] border border-[#e6efe9]")}
                    >
                        Pendentes
                    </button>
                </div>

                {/* Periodo badges scroll */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar ml-auto">
                    <PeriodoBadge icon={Sun} label="Manhã" active={periodoAtivo === "manha"} onClick={() => setPeriodoAtivo(periodoAtivo === "manha" ? "todos" : "manha")} />
                    <PeriodoBadge icon={Coffee} label="Tarde" active={periodoAtivo === "tarde"} onClick={() => setPeriodoAtivo(periodoAtivo === "tarde" ? "todos" : "tarde")} />
                    <PeriodoBadge icon={Moon} label="Noite" active={periodoAtivo === "noite"} onClick={() => setPeriodoAtivo(periodoAtivo === "noite" ? "todos" : "noite")} />
                </div>
            </div>

            {/* Timeline / listas por período */}
            <div className="space-y-6">
                {(["manha", "tarde", "noite"] as const).map((periodKey) => {
                    const list = grouped[periodKey];
                    if (!list || list.length === 0) return null;
                    const label = periodKey === "manha" ? "Manhã" : periodKey === "tarde" ? "Tarde" : "Noite";
                    return (
                        <div key={periodKey}>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-[#9db4aa]" />
                                <h4 className="text-sm font-semibold text-[#255f4f]">{label}</h4>
                            </div>

                            <div className="space-y-3">
                                {list.map((tarefa) => (
                                    <div key={tarefa.id} className="relative pl-14">
                                        <div
                                            className={clsx(
                                                "absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition",
                                                tarefa.feito ? "bg-[#5ba58c] border-4 border-[#f8fcfb]" : "bg-white border-2 border-[#e9f3ee]"
                                            )}>
                                            {tarefa.tipo === "remedio" ? (
                                                <Pill className={clsx("h-5 w-5", tarefa.feito ? "text-white" : "text-[#5ba58c]")} />
                                            ) : (
                                                <Clock className={clsx("h-5 w-5", tarefa.feito ? "text-white" : "text-[#9db4aa]")} />
                                            )}
                                        </div>

                                        <Card
                                            onClick={() => toggleTarefa(tarefa.id)}
                                            className={clsx(
                                                "cursor-pointer transition-all rounded-2xl",
                                                tarefa.feito ? "border-[#e6efe9] bg-[#f4fbf8] opacity-90" : "bg-white shadow-sm"
                                            )}
                                        >
                                            <CardContent className="p-4 flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-black text-[#5ba58c]">{tarefa.hora}</span>
                                                        <h3 className={clsx("text-base font-bold truncate", tarefa.feito ? "text-[#6b8c7d] line-through" : "text-[#255f4f]")}>
                                                            {tarefa.titulo}
                                                        </h3>
                                                    </div>

                                                    <p className="text-xs text-[#9db4aa] truncate">{tarefa.desc}</p>

                                                    <div className="mt-2 flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">{tarefa.tipo === "remedio" ? "Remédio" : tarefa.tipo === "comida" ? "Alimentação" : tarefa.tipo === "higiene" ? "Higiene" : "Atividade"}</Badge>
                                                        <div className="flex items-center gap-1 text-xs text-[#6b8c7d]">
                                                            <User className="h-4 w-4 text-[#9db4aa]" />
                                                            <span>{tarefa.responsavel}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <div>
                                                        {tarefa.feito ? <CheckCircle2 className="h-7 w-7 text-[#5ba58c]" /> : <Circle className="h-7 w-7 text-[#dbe9e0]" />}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Floating add button (mobile) */}
            <div className="fixed left-4 right-4 bottom-[calc(var(--mi-bottom-nav-height,88px)+12px)] md:hidden z-40">
                <Button onClick={() => setShowModal(true)} className="w-full py-4 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-lg">
                    <Plus className="mr-2 h-5 w-5" /> Novo Cuidado
                </Button>
            </div>

            {/* Modal (in-page bottom-sheet) */}
            {showModal && (
                <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
                    <div className="relative w-full md:w-3/4 lg:w-1/2 bg-white md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-auto">
                        <div className="p-4 border-b flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[#255f4f]">Registrar Cuidado</h3>
                                <span className="text-xs text-[#9db4aa]">{new Date().toLocaleDateString()}</span>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 rounded-md hover:bg-gray-100">
                                <X className="h-5 w-5 text-[#255f4f]" />
                            </button>
                        </div>

                        <form onSubmit={(e) => { e.preventDefault(); handleSaveNew(e); }} className="p-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Hora</span>
                                    <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="p-3 border rounded-lg" />
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Tipo</span>
                                    <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="p-3 border rounded-lg">
                                        <option value="remedio">Remédio</option>
                                        <option value="comida">Alimentação</option>
                                        <option value="higiene">Higiene</option>
                                        <option value="atividade">Atividade</option>
                                    </select>
                                </label>
                            </div>

                            <label className="flex flex-col">
                                <span className="text-xs text-[#6b8c7d] mb-1">Título</span>
                                <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Remédio manhã" className="p-3 border rounded-lg" />
                            </label>

                            <label className="flex flex-col">
                                <span className="text-xs text-[#6b8c7d] mb-1">Descrição (opcional)</span>
                                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Observações rápidas" className="p-3 border rounded-lg" />
                            </label>

                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Período</span>
                                    <select value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })} className="p-3 border rounded-lg">
                                        <option value="manha">Manhã</option>
                                        <option value="tarde">Tarde</option>
                                        <option value="noite">Noite</option>
                                    </select>
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Responsável</span>
                                    <select value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} className="p-3 border rounded-lg">
                                        {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <Button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-200 text-[#255f4f]">Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-[#5ba58c] text-white">Salvar Cuidado</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function PeriodoBadge({ icon: Icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={clsx("flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition whitespace-nowrap", active ? "bg-[#255f4f] text-white shadow-md" : "bg-white text-[#6b8c7d] border border-[#e6efe9]")}>
            <Icon className="h-4 w-4" /> {label}
        </button>
    );
}