import { useMemo, useState } from "react";
import {
    Activity,
    Thermometer,
    Heart,
    Plus,
    Calendar,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import clsx from "clsx";
import { MiCard } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { MoodSelector } from "../components/MoodSelector";
import { useMelhorIdade } from "../context/MelhorIdadeContext";
import { saudeService } from "../services/saudeService";
import type { HumorTipo } from "../types";

const TIPOS = [
    { key: "pressao", label: "Pressão Arterial", unit: "mmHg", icon: Activity, color: "text-blue-600 bg-blue-50" },
    { key: "temperatura", label: "Temperatura", unit: "°C", icon: Thermometer, color: "text-orange-600 bg-orange-50" },
    { key: "batimentos", label: "Batimentos", unit: "BPM", icon: Heart, color: "text-rose-600 bg-rose-50" },
] as const;

const FORM_INICIAL = { tipo: "Pressão Arterial", value: "", unit: "mmHg", note: "" };

export default function SaudePage() {
    const { profile, updateHumor } = useMelhorIdade();
    const [historico, setHistorico] = useState(() => saudeService.list());
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);

    const grouped = useMemo(() => saudeService.groupByDate(historico), [historico]);

    function openModal(prefillKey?: string) {
        const t = TIPOS.find((x) => x.key === prefillKey);
        setForm({
            tipo: t?.label || "Pressão Arterial",
            value: "",
            unit: t?.unit || "mmHg",
            note: "",
        });
        setModalOpen(true);
    }

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        setHistorico(
            saudeService.add({
                tipo: form.tipo,
                value: form.value || "—",
                unit: form.unit,
                note: form.note,
            })
        );
        setForm(FORM_INICIAL);
        setModalOpen(false);
        toast({ title: "Registro salvo", description: "Demonstração — salvo localmente." });
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                eyebrow="Saúde"
                title="Saúde e Bem-estar"
                subtitle="Como você está se sentindo agora?"
            />

            <MiCard variant="soft" className="p-4 sm:p-5 space-y-3">
                <MoodSelector
                    value={profile.humorAtual}
                    onChange={(h: HumorTipo) => updateHumor(h)}
                />
            </MiCard>

            <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#5ba58c]" />
                    Registros rápidos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                    {TIPOS.map((t) => {
                        const ultimo = historico.find((r) => r.tipo === t.label);
                        return (
                            <QuickStatCard
                                key={t.key}
                                icon={t.icon}
                                label={t.label}
                                value={ultimo?.value || "—"}
                                unit={ultimo?.unit || t.unit}
                                time={
                                    ultimo
                                        ? new Date(ultimo.timeLabel).toLocaleTimeString("pt-BR", {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                          })
                                        : "Sem registro"
                                }
                                colorClass={t.color}
                                onAdd={() => openModal(t.key)}
                            />
                        );
                    })}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Histórico</h2>
                {Object.keys(grouped).length === 0 ? (
                    <p className="text-sm text-[#9db4aa] text-center py-8">Nenhum registro ainda.</p>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <div key={date}>
                            <div className="flex items-center gap-2 mb-2.5">
                                <Calendar className="h-4 w-4 text-[#9db4aa]" />
                                <h4 className="font-semibold text-[#255f4f] text-xs sm:text-sm capitalize">
                                    {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                                        weekday: "long",
                                        day: "2-digit",
                                        month: "long",
                                    })}
                                </h4>
                            </div>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <MiCard key={item.id} className="p-3 sm:p-4">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2.5 rounded-xl bg-[#f4fbf8] text-[#5ba58c] shrink-0">
                                                    <Activity className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-[#255f4f] text-sm truncate">
                                                        {item.tipo}
                                                    </p>
                                                    <p className="text-xs text-[#9db4aa] truncate">
                                                        {new Date(item.timeLabel).toLocaleTimeString("pt-BR", {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                        {item.note ? ` — ${item.note}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-lg sm:text-xl font-black text-[#255f4f]">
                                                    {item.value}
                                                </span>
                                                <p className="text-[10px] font-bold text-[#6b8c7d] uppercase">
                                                    {item.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </MiCard>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </section>

            <div className="fixed left-4 right-4 bottom-24 md:bottom-8 md:left-auto md:right-8 md:max-w-xs z-40">
                <Button
                    onClick={() => openModal()}
                    className="w-full py-5 sm:py-6 rounded-2xl bg-[#5ba58c] hover:bg-[#4a8a75] text-white font-bold shadow-xl"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Novo registro
                </Button>
            </div>

            <MiDemoModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title="Novo registro de saúde"
                description="Demonstração — dados salvos neste navegador."
            >
                <form onSubmit={salvar} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {TIPOS.map((t) => {
                            const Icon = t.icon;
                            const active = form.tipo === t.label;
                            return (
                                <button
                                    key={t.key}
                                    type="button"
                                    onClick={() =>
                                        setForm({ ...form, tipo: t.label, unit: t.unit })
                                    }
                                    className={clsx(
                                        "flex items-center gap-2 p-3 rounded-xl border-2 text-left transition",
                                        active
                                            ? "border-[#5ba58c] bg-[#f0fbf7]"
                                            : "border-[#e6efe9] bg-white"
                                    )}
                                >
                                    <Icon className="h-4 w-4 text-[#5ba58c] shrink-0" />
                                    <span className="text-xs font-semibold text-[#255f4f]">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-[#6b8c7d]">Valor</span>
                        <Input
                            value={form.value}
                            onChange={(e) => setForm({ ...form, value: e.target.value })}
                            placeholder="Ex: 12/8 ou 36.5"
                            className="rounded-xl h-12"
                        />
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-[#6b8c7d]">Unidade</span>
                            <Input
                                value={form.unit}
                                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                                className="rounded-xl h-12"
                            />
                        </label>
                        <label className="block space-y-1.5">
                            <span className="text-xs font-semibold text-[#6b8c7d]">Horário</span>
                            <Input
                                type="time"
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        note: e.target.value ? `Horário: ${e.target.value}` : form.note,
                                    })
                                }
                                className="rounded-xl h-12"
                            />
                        </label>
                    </div>
                    <label className="block space-y-1.5">
                        <span className="text-xs font-semibold text-[#6b8c7d]">Observação</span>
                        <Textarea
                            value={form.note}
                            onChange={(e) => setForm({ ...form, note: e.target.value })}
                            rows={3}
                            className="rounded-xl resize-none"
                        />
                    </label>
                    <div className="flex flex-col-reverse sm:flex-row gap-2">
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
                            className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                        >
                            Salvar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>
        </div>
    );
}

function QuickStatCard({
    icon: Icon,
    label,
    value,
    unit,
    time,
    colorClass,
    onAdd,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    unit: string;
    time: string;
    colorClass: string;
    onAdd: () => void;
}) {
    return (
        <MiCard variant="accent" className="p-3 sm:p-4">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={clsx("p-2.5 rounded-xl shrink-0", colorClass)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-[#255f4f] truncate">{label}</p>
                        <p className="text-[10px] sm:text-xs text-[#9db4aa]">{time}</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className="p-2 rounded-lg bg-white border border-[#e6efe9] hover:bg-[#f4fbf8] shrink-0"
                    aria-label={`Adicionar ${label}`}
                >
                    <Plus className="h-4 w-4 text-[#5ba58c]" />
                </button>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#255f4f]">{value}</span>
                <span className="text-xs font-bold text-[#6b8c7d] uppercase">{unit}</span>
            </div>
        </MiCard>
    );
}
