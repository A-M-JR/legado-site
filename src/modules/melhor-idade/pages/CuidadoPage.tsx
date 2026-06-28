import { useMemo, useState } from "react";
import {
    CheckCircle2,
    Circle,
    Clock,
    Pill,
    Coffee,
    Moon,
    Sun,
    Plus,
    User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import clsx from "clsx";
import { MiCard, MiFilterPills } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { cuidadoService } from "../services/cuidadoService";
import type { CuidadoPeriodo, CuidadoTarefa, CuidadoTipo } from "../types";

const FILTROS = [
    { id: "hoje", label: "Hoje" },
    { id: "pendentes", label: "Pendentes" },
    { id: "todos", label: "Todos" },
];

const PERIODOS: { id: CuidadoPeriodo | "todos"; label: string; icon: typeof Sun }[] = [
    { id: "manha", label: "Manhã", icon: Sun },
    { id: "tarde", label: "Tarde", icon: Coffee },
    { id: "noite", label: "Noite", icon: Moon },
];

const RESPONSAVEIS = ["Maria", "João", "Ana"];

const TIPO_LABEL: Record<CuidadoTipo, string> = {
    remedio: "Remédio",
    comida: "Alimentação",
    higene: "Higiene",
    atividade: "Atividade",
};

const FORM_INICIAL = {
    hora: "",
    titulo: "",
    desc: "",
    tipo: "remedio" as CuidadoTipo,
    periodo: "manha" as CuidadoPeriodo,
    responsavel: "Maria",
};

export default function CuidadoPage() {
    const [tarefas, setTarefas] = useState<CuidadoTarefa[]>(() => cuidadoService.list());
    const [filtro, setFiltro] = useState("hoje");
    const [periodoAtivo, setPeriodoAtivo] = useState<CuidadoPeriodo | "todos">("todos");
    const [modalNova, setModalNova] = useState(false);
    const [detalhe, setDetalhe] = useState<CuidadoTarefa | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);

    const filtered = useMemo(() => {
        return tarefas.filter((t) => {
            if (filtro === "pendentes" && t.feito) return false;
            if (periodoAtivo !== "todos" && t.periodo !== periodoAtivo) return false;
            return true;
        });
    }, [tarefas, filtro, periodoAtivo]);

    const grouped = useMemo(() => cuidadoService.groupByPeriodo(filtered), [filtered]);

    function toggle(id: string) {
        setTarefas(cuidadoService.toggleFeito(id));
    }

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.titulo || !form.hora) return;
        setTarefas(
            cuidadoService.add({
                hora: form.hora,
                titulo: form.titulo,
                desc: form.desc,
                tipo: form.tipo,
                periodo: form.periodo,
                responsavel: form.responsavel,
            })
        );
        setForm(FORM_INICIAL);
        setModalNova(false);
        toast({ title: "Cuidado registrado", description: "Demonstração — salvo localmente." });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <MiPageHeader
                    eyebrow="Cuidado"
                    title="Hora do Cuidado"
                    subtitle="Registre, acompanhe e delegue tarefas do dia a dia."
                />
                <Button
                    onClick={() => setModalNova(true)}
                    className="hidden sm:flex bg-[#5ba58c] text-white rounded-xl shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo cuidado
                </Button>
            </div>

            <MiFilterPills options={FILTROS} value={filtro} onChange={setFiltro} />

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                    type="button"
                    onClick={() => setPeriodoAtivo("todos")}
                    className={clsx(
                        "px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0",
                        periodoAtivo === "todos"
                            ? "bg-[#255f4f] text-white"
                            : "bg-white border border-[#e6efe9] text-[#6b8c7d]"
                    )}
                >
                    Todos períodos
                </button>
                {PERIODOS.map((p) => {
                    const Icon = p.icon;
                    const active = periodoAtivo === p.id;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPeriodoAtivo(active ? "todos" : p.id)}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0",
                                active
                                    ? "bg-[#255f4f] text-white"
                                    : "bg-white border border-[#e6efe9] text-[#6b8c7d]"
                            )}
                        >
                            <Icon className="h-3.5 w-3.5" /> {p.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {(["manha", "tarde", "noite"] as const).map((periodKey) => {
                    const list = grouped[periodKey];
                    if (!list.length) return null;
                    const label =
                        periodKey === "manha" ? "Manhã" : periodKey === "tarde" ? "Tarde" : "Noite";
                    return (
                        <div key={periodKey}>
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="h-4 w-4 text-[#9db4aa]" />
                                <h4 className="text-sm font-bold text-[#255f4f]">{label}</h4>
                            </div>
                            <div className="space-y-3">
                                {list.map((t) => (
                                    <div key={t.id} className="relative pl-12 sm:pl-14">
                                        <div
                                            className={clsx(
                                                "absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center z-10",
                                                t.feito
                                                    ? "bg-[#5ba58c] ring-4 ring-[#f8fcfb]"
                                                    : "bg-white border-2 border-[#e9f3ee]"
                                            )}
                                        >
                                            {t.tipo === "remedio" ? (
                                                <Pill
                                                    className={clsx(
                                                        "h-4 w-4 sm:h-5 sm:w-5",
                                                        t.feito ? "text-white" : "text-[#5ba58c]"
                                                    )}
                                                />
                                            ) : (
                                                <Clock
                                                    className={clsx(
                                                        "h-4 w-4 sm:h-5 sm:w-5",
                                                        t.feito ? "text-white" : "text-[#9db4aa]"
                                                    )}
                                                />
                                            )}
                                        </div>
                                        <MiCard
                                            onClick={() => setDetalhe(t)}
                                            className={clsx(
                                                "p-3 sm:p-4",
                                                t.feito && "bg-[#f4fbf8] opacity-90"
                                            )}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-black text-[#5ba58c]">
                                                            {t.hora}
                                                        </span>
                                                        <h3
                                                            className={clsx(
                                                                "text-sm sm:text-base font-bold truncate",
                                                                t.feito
                                                                    ? "text-[#9db4aa] line-through"
                                                                    : "text-[#255f4f]"
                                                            )}
                                                        >
                                                            {t.titulo}
                                                        </h3>
                                                    </div>
                                                    {t.desc && (
                                                        <p className="text-xs text-[#9db4aa] mt-0.5 line-clamp-2">
                                                            {t.desc}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {TIPO_LABEL[t.tipo]}
                                                        </Badge>
                                                        {t.responsavel && (
                                                            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-[#6b8c7d]">
                                                                <User className="h-3 w-3" />
                                                                {t.responsavel}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggle(t.id);
                                                    }}
                                                    className="shrink-0"
                                                >
                                                    {t.feito ? (
                                                        <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-[#5ba58c]" />
                                                    ) : (
                                                        <Circle className="h-6 w-6 sm:h-7 sm:w-7 text-[#dbe9e0]" />
                                                    )}
                                                </button>
                                            </div>
                                        </MiCard>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed left-4 right-4 bottom-24 sm:hidden z-40">
                <Button
                    onClick={() => setModalNova(true)}
                    className="w-full py-5 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-xl"
                >
                    <Plus className="mr-2 h-5 w-5" /> Novo cuidado
                </Button>
            </div>

            <MiDemoModal
                open={modalNova}
                onOpenChange={setModalNova}
                title="Registrar cuidado"
                description="Demonstração — salvo neste navegador."
            >
                <form onSubmit={salvar} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Hora *">
                            <Input
                                type="time"
                                value={form.hora}
                                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                                className="rounded-xl h-11"
                                required
                            />
                        </Field>
                        <Field label="Tipo">
                            <select
                                value={form.tipo}
                                onChange={(e) =>
                                    setForm({ ...form, tipo: e.target.value as CuidadoTipo })
                                }
                                className="w-full h-11 rounded-xl border border-input px-3 text-sm"
                            >
                                <option value="remedio">Remédio</option>
                                <option value="comida">Alimentação</option>
                                <option value="higiene">Higiene</option>
                                <option value="atividade">Atividade</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Título *">
                        <Input
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            placeholder="Ex: Remédio manhã"
                            className="rounded-xl h-11"
                            required
                        />
                    </Field>
                    <Field label="Descrição">
                        <Input
                            value={form.desc}
                            onChange={(e) => setForm({ ...form, desc: e.target.value })}
                            placeholder="Observações"
                            className="rounded-xl h-11"
                        />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Período">
                            <select
                                value={form.periodo}
                                onChange={(e) =>
                                    setForm({ ...form, periodo: e.target.value as CuidadoPeriodo })
                                }
                                className="w-full h-11 rounded-xl border border-input px-3 text-sm"
                            >
                                <option value="manha">Manhã</option>
                                <option value="tarde">Tarde</option>
                                <option value="noite">Noite</option>
                            </select>
                        </Field>
                        <Field label="Responsável">
                            <select
                                value={form.responsavel}
                                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                                className="w-full h-11 rounded-xl border border-input px-3 text-sm"
                            >
                                {RESPONSAVEIS.map((r) => (
                                    <option key={r} value={r}>
                                        {r}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={() => setModalNova(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white">
                            Salvar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={!!detalhe}
                onOpenChange={(o) => !o && setDetalhe(null)}
                title={detalhe?.titulo || ""}
                description={detalhe ? `${detalhe.hora} — ${TIPO_LABEL[detalhe.tipo]}` : ""}
            >
                {detalhe && (
                    <div className="space-y-4">
                        {detalhe.desc && (
                            <p className="text-[#4f665a] bg-[#f8fcfb] rounded-xl p-4 text-sm">
                                {detalhe.desc}
                            </p>
                        )}
                        {detalhe.responsavel && (
                            <p className="text-sm text-[#6b8c7d] flex items-center gap-2">
                                <User className="h-4 w-4" /> Responsável: {detalhe.responsavel}
                            </p>
                        )}
                        <Button
                            className="w-full rounded-xl h-12 bg-[#5ba58c] text-white"
                            onClick={() => {
                                toggle(detalhe.id);
                                setDetalhe({ ...detalhe, feito: !detalhe.feito });
                            }}
                        >
                            {detalhe.feito ? "Marcar pendente" : "Marcar como feito"}
                        </Button>
                    </div>
                )}
            </MiDemoModal>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#6b8c7d]">{label}</span>
            {children}
        </label>
    );
}
