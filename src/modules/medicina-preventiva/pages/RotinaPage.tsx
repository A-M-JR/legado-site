import { useEffect, useMemo, useState } from "react";
import {
    CheckCircle2,
    Circle,
    Plus,
    Pill,
    Activity,
    Droplets,
    HeartPulse,
    Utensils,
    Clock,
    Trash2,
    Sun,
    Coffee,
    Moon,
    type LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { MiCard, MiFilterPills } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { rotinaService } from "../services/rotinaService";
import type { RotinaItem, RotinaPeriodo, RotinaTipo } from "../types";

const FILTROS = [
    { id: "todos", label: "Todos" },
    { id: "pendentes", label: "Pendentes" },
    { id: "feitos", label: "Concluídos" },
];

const TIPOS: { id: RotinaTipo; label: string; icon: LucideIcon; cor: string }[] = [
    { id: "medicacao", label: "Medicação", icon: Pill, cor: "text-blue-600" },
    { id: "exercicio", label: "Exercício", icon: Activity, cor: "text-orange-500" },
    { id: "hidratacao", label: "Hidratação", icon: Droplets, cor: "text-sky-500" },
    { id: "medicao", label: "Medir sinais", icon: HeartPulse, cor: "text-rose-500" },
    { id: "alimentacao", label: "Alimentação", icon: Utensils, cor: "text-emerald-600" },
    { id: "jejum", label: "Jejum pré-exame", icon: Clock, cor: "text-violet-600" },
    { id: "outro", label: "Outro", icon: CheckCircle2, cor: "text-[#5ba58c]" },
];

const PERIODOS: { id: RotinaPeriodo; label: string; icon: LucideIcon }[] = [
    { id: "manha", label: "Manhã", icon: Sun },
    { id: "tarde", label: "Tarde", icon: Coffee },
    { id: "noite", label: "Noite", icon: Moon },
];

const FORM_INICIAL = {
    hora: "",
    titulo: "",
    descricao: "",
    tipo: "medicacao" as RotinaTipo,
    periodo: "manha" as RotinaPeriodo,
    valorAlvo: "",
    unidadeMedida: "",
};

function tipoInfo(tipo: RotinaTipo) {
    return TIPOS.find((t) => t.id === tipo) ?? TIPOS[TIPOS.length - 1];
}

export default function RotinaPage() {
    const [itens, setItens] = useState<RotinaItem[]>([]);
    const [filtro, setFiltro] = useState("todos");
    const [periodoAtivo, setPeriodoAtivo] = useState<RotinaPeriodo | "todos">("todos");
    const [modalNovo, setModalNovo] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        rotinaService.list().then(setItens);
    }, []);

    const filtrados = useMemo(
        () =>
            itens.filter((i) => {
                if (filtro === "pendentes" && i.feito) return false;
                if (filtro === "feitos" && !i.feito) return false;
                if (periodoAtivo !== "todos" && i.periodo !== periodoAtivo) return false;
                return true;
            }),
        [itens, filtro, periodoAtivo]
    );

    const agrupados = useMemo(() => rotinaService.groupByPeriodo(filtrados), [filtrados]);

    async function alternar(id: string) {
        setItens(await rotinaService.toggleFeito(id));
    }

    async function remover(id: string) {
        setItens(await rotinaService.remove(id));
        toast({ title: "Item removido" });
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.titulo.trim() || !form.hora || salvando) return;

        setSalvando(true);
        try {
            setItens(
                await rotinaService.add({
                    hora: form.hora,
                    titulo: form.titulo.trim(),
                    descricao: form.descricao.trim(),
                    tipo: form.tipo,
                    periodo: form.periodo,
                    valorAlvo: form.valorAlvo.trim(),
                    unidadeMedida: form.unidadeMedida.trim(),
                })
            );
            setForm(FORM_INICIAL);
            setModalNovo(false);
            toast({ title: "Item adicionado à rotina" });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <MiPageHeader
                    eyebrow="Rotina"
                    title="Minha rotina"
                    subtitle="Os cuidados preventivos do seu dia, organizados por período."
                />
                <Button
                    onClick={() => setModalNovo(true)}
                    className="hidden sm:flex bg-[#5ba58c] text-white rounded-xl shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo item
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
                    const ativo = periodoAtivo === p.id;
                    return (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setPeriodoAtivo(ativo ? "todos" : p.id)}
                            className={clsx(
                                "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0",
                                ativo
                                    ? "bg-[#255f4f] text-white"
                                    : "bg-white border border-[#e6efe9] text-[#6b8c7d]"
                            )}
                        >
                            <p.icon className="h-3.5 w-3.5" /> {p.label}
                        </button>
                    );
                })}
            </div>

            <div className="space-y-6">
                {PERIODOS.map((periodo) => {
                    const lista = agrupados[periodo.id];
                    if (!lista.length) return null;
                    return (
                        <section key={periodo.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                                <periodo.icon className="h-4 w-4 text-[#5ba58c]" />
                                <h2 className="text-base font-bold text-[#255f4f]">
                                    {periodo.label}
                                </h2>
                                <span className="text-xs text-[#9db4aa]">
                                    {lista.filter((i) => !i.feito).length} pendente(s)
                                </span>
                            </div>

                            <div className="space-y-2">
                                {lista.map((item) => {
                                    const info = tipoInfo(item.tipo);
                                    return (
                                        <MiCard key={item.id} className="p-4">
                                            <div className="flex items-start gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => alternar(item.id)}
                                                    className="shrink-0 mt-0.5"
                                                    aria-label={
                                                        item.feito
                                                            ? "Marcar como pendente"
                                                            : "Marcar como feito"
                                                    }
                                                >
                                                    {item.feito ? (
                                                        <CheckCircle2 className="h-6 w-6 text-[#5ba58c]" />
                                                    ) : (
                                                        <Circle className="h-6 w-6 text-[#c2e1d4]" />
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <info.icon
                                                            className={`h-4 w-4 ${info.cor}`}
                                                        />
                                                        <p
                                                            className={clsx(
                                                                "font-bold text-sm sm:text-base",
                                                                item.feito
                                                                    ? "text-[#9db4aa] line-through"
                                                                    : "text-[#255f4f]"
                                                            )}
                                                        >
                                                            {item.titulo}
                                                        </p>
                                                        <span className="text-[10px] font-bold text-[#5ba58c] bg-[#e3f1eb] px-2 py-0.5 rounded-full">
                                                            {item.hora}
                                                        </span>
                                                    </div>
                                                    {item.valorAlvo && (
                                                        <p className="text-xs text-[#4f665a] mt-1">
                                                            Meta: {item.valorAlvo}{" "}
                                                            {item.unidadeMedida}
                                                        </p>
                                                    )}
                                                    {item.descricao && (
                                                        <p className="text-xs sm:text-sm text-[#6b8c7d] mt-0.5">
                                                            {item.descricao}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => remover(item.id)}
                                                    className="shrink-0 text-[#c2e1d4] hover:text-rose-500 transition"
                                                    aria-label="Remover item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </MiCard>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                {filtrados.length === 0 && (
                    <MiCard variant="soft" className="p-8 text-center">
                        <p className="text-sm text-[#6b8c7d]">
                            Nenhum item na rotina ainda. Toque em “Novo item” para começar.
                        </p>
                    </MiCard>
                )}
            </div>

            <button
                type="button"
                onClick={() => setModalNovo(true)}
                className="sm:hidden fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-[#5ba58c] text-white shadow-lg flex items-center justify-center"
                aria-label="Novo item da rotina"
            >
                <Plus className="h-6 w-6" />
            </button>

            <Dialog open={modalNovo} onOpenChange={setModalNovo}>
                <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Novo item da rotina</DialogTitle>
                        <DialogDescription>
                            O que você precisa fazer e em que horário.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Horário
                                </label>
                                <Input
                                    type="time"
                                    value={form.hora}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, hora: e.target.value }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Período
                                </label>
                                <select
                                    value={form.periodo}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            periodo: e.target.value as RotinaPeriodo,
                                        }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {PERIODOS.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Tipo</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {TIPOS.map((t) => {
                                    const ativo = form.tipo === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => setForm((f) => ({ ...f, tipo: t.id }))}
                                            className={clsx(
                                                "flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition",
                                                ativo
                                                    ? "bg-[#e3f1eb] border-[#5ba58c] text-[#255f4f]"
                                                    : "bg-white border-[#e6efe9] text-[#6b8c7d]"
                                            )}
                                        >
                                            <t.icon className={`h-4 w-4 ${t.cor}`} />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                O que fazer
                            </label>
                            <Input
                                value={form.titulo}
                                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                                placeholder="Ex.: Caminhada leve"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Meta (opcional)
                                </label>
                                <Input
                                    value={form.valorAlvo}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, valorAlvo: e.target.value }))
                                    }
                                    placeholder="Ex.: 30"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Unidade (opcional)
                                </label>
                                <Input
                                    value={form.unidadeMedida}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, unidadeMedida: e.target.value }))
                                    }
                                    placeholder="minutos, ml, mmHg…"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Observação (opcional)
                            </label>
                            <Textarea
                                value={form.descricao}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, descricao: e.target.value }))
                                }
                                rows={2}
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalNovo(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-[#5ba58c] text-white"
                            >
                                {salvando ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
