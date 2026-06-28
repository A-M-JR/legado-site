import { useState } from "react";
import { Pill, Calendar, Sparkles, Sun, CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { MiCard } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { agendaService } from "../services/agendaService";
import type { TarefaDia, TarefaDiaTipo } from "../types";
import clsx from "clsx";

const ICONS: Record<TarefaDiaTipo, typeof Pill> = {
    medicacao: Pill,
    compromisso: Calendar,
    cuidado: Sparkles,
    momento: Sun,
};

const CORES: Record<TarefaDiaTipo, string> = {
    medicacao: "bg-blue-50 text-blue-600 ring-blue-100",
    compromisso: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    cuidado: "bg-amber-50 text-amber-600 ring-amber-100",
    momento: "bg-orange-50 text-orange-600 ring-orange-100",
};

const FORM_INICIAL = {
    titulo: "",
    descricao: "",
    horario: "",
    tipo: "medicacao" as TarefaDiaTipo,
};

export default function MeuDiaPage() {
    const [tarefas, setTarefas] = useState<TarefaDia[]>(() => agendaService.list());
    const [modalOpen, setModalOpen] = useState(false);
    const [detalhe, setDetalhe] = useState<TarefaDia | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);

    function toggle(id: string) {
        setTarefas(agendaService.toggleFeito(id));
    }

    function abrirDetalhe(t: TarefaDia) {
        setDetalhe(t);
    }

    function salvarNovo(e: React.FormEvent) {
        e.preventDefault();
        if (!form.titulo.trim()) return;
        const desc =
            form.descricao.trim() ||
            (form.horario ? `Horário: ${form.horario}` : "Novo cuidado registrado");
        setTarefas(
            agendaService.add({
                titulo: form.titulo.trim(),
                descricao: desc,
                horario: form.horario || undefined,
                tipo: form.tipo,
                feito: false,
            })
        );
        setForm(FORM_INICIAL);
        setModalOpen(false);
        toast({ title: "Cuidado adicionado", description: "Demonstração — salvo localmente." });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                title="Seu dia, com leveza"
                subtitle="Acompanhe seus compromissos e cuidados de hoje."
            />

            <div className="space-y-3">
                {tarefas.map((t) => {
                    const Icon = ICONS[t.tipo];
                    return (
                        <MiCard
                            key={t.id}
                            onClick={() => abrirDetalhe(t)}
                            className={clsx(
                                "p-4 sm:p-5",
                                t.feito && "opacity-80 bg-[#f8fcfb]"
                            )}
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div
                                    className={clsx(
                                        "p-3 rounded-2xl shrink-0 ring-2 ring-inset",
                                        CORES[t.tipo]
                                    )}
                                >
                                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p
                                            className={clsx(
                                                "font-bold text-base sm:text-lg text-[#255f4f]",
                                                t.feito && "line-through text-[#9db4aa]"
                                            )}
                                        >
                                            {t.titulo}
                                        </p>
                                        {t.horario && (
                                            <span className="text-xs font-bold text-[#5ba58c] bg-[#e3f1eb] px-2 py-0.5 rounded-full">
                                                {t.horario}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-[#6b8c7d] mt-1 line-clamp-2">
                                        {t.descricao}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(t.id);
                                    }}
                                    className="shrink-0 pt-0.5"
                                    aria-label={t.feito ? "Marcar pendente" : "Marcar feito"}
                                >
                                    {t.feito ? (
                                        <CheckCircle2 className="h-7 w-7 sm:h-8 sm:w-8 text-[#5ba58c]" />
                                    ) : (
                                        <Circle className="h-7 w-7 sm:h-8 sm:w-8 text-[#dbe9e0]" />
                                    )}
                                </button>
                            </div>
                        </MiCard>
                    );
                })}
            </div>

            <div className="fixed left-4 right-4 bottom-24 md:bottom-8 md:left-auto md:right-8 md:max-w-xs z-40">
                <Button
                    onClick={() => setModalOpen(true)}
                    className="w-full py-5 sm:py-6 rounded-2xl bg-[#255f4f] hover:bg-[#1d4d42] text-white font-bold shadow-xl text-sm sm:text-base"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo cuidado
                </Button>
            </div>

            <MiDemoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Registrar cuidado"
                description="Preencha para demonstração. Os dados ficam salvos neste navegador."
            >
                <form onSubmit={salvarNovo} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="space-y-1.5 block">
                            <span className="text-xs font-semibold text-[#6b8c7d]">Título</span>
                            <Input
                                value={form.titulo}
                                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                placeholder="Ex: Medicação da tarde"
                                className="rounded-xl h-12"
                                required
                            />
                        </label>
                        <label className="space-y-1.5 block">
                            <span className="text-xs font-semibold text-[#6b8c7d]">Horário</span>
                            <Input
                                type="time"
                                value={form.horario}
                                onChange={(e) => setForm({ ...form, horario: e.target.value })}
                                className="rounded-xl h-12"
                            />
                        </label>
                    </div>
                    <label className="space-y-1.5 block">
                        <span className="text-xs font-semibold text-[#6b8c7d]">Tipo</span>
                        <select
                            value={form.tipo}
                            onChange={(e) =>
                                setForm({ ...form, tipo: e.target.value as TarefaDiaTipo })
                            }
                            className="w-full h-12 rounded-xl border border-input bg-background px-3 text-sm"
                        >
                            <option value="medicacao">Medicação</option>
                            <option value="compromisso">Compromisso</option>
                            <option value="cuidado">Cuidado do dia</option>
                            <option value="momento">Pequeno momento</option>
                        </select>
                    </label>
                    <label className="space-y-1.5 block">
                        <span className="text-xs font-semibold text-[#6b8c7d]">Observação</span>
                        <Textarea
                            value={form.descricao}
                            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                            placeholder="Detalhes opcionais..."
                            rows={3}
                            className="rounded-xl resize-none"
                        />
                    </label>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={() => setModalOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 rounded-xl h-12 bg-[#5ba58c] hover:bg-[#4a8a75] text-white"
                        >
                            Salvar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={!!detalhe}
                onOpenChange={(open) => !open && setDetalhe(null)}
                title={detalhe?.titulo || ""}
                description={detalhe?.horario ? `Hoje às ${detalhe.horario}` : "Detalhes do cuidado"}
            >
                {detalhe && (
                    <div className="space-y-4">
                        <p className="text-[#4f665a] leading-relaxed">{detalhe.descricao}</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                                className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                                onClick={() => {
                                    toggle(detalhe.id);
                                    setDetalhe({ ...detalhe, feito: !detalhe.feito });
                                }}
                            >
                                {detalhe.feito ? "Marcar pendente" : "Marcar como feito"}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 rounded-xl h-12"
                                onClick={() => setDetalhe(null)}
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                )}
            </MiDemoModal>
        </div>
    );
}
