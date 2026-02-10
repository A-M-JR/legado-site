import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Heart,
    Activity,
    Thermometer,
    Smile,
    Meh,
    Frown,
    Plus,
    X,
    Calendar
} from "lucide-react";
import clsx from "clsx";

/**
 * SaudePage - responsivo e corrigido para mobile
 */
export default function SaudePage(): JSX.Element {
    const [humorSelecionado, setHumorSelecionado] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // histórico inicial (mock)
    const [historico, setHistorico] = useState<Array<any>>([
        {
            id: 1,
            tipo: "Pressão Arterial",
            value: "12/8",
            unit: "mmHg",
            timeLabel: "2026-02-09T10:12:00",
            note: "Medida após caminhada leve"
        },
        {
            id: 2,
            tipo: "Batimentos",
            value: "72",
            unit: "BPM",
            timeLabel: "2026-02-09T08:30:00",
            note: "Em repouso"
        },
        {
            id: 3,
            tipo: "Temperatura",
            value: "36.5",
            unit: "°C",
            timeLabel: "2026-02-08T19:20:00",
            note: "Rotina noturna"
        }
    ]);

    // campos do modal (visual)
    const [form, setForm] = useState({
        tipo: "Pressão Arterial",
        value: "",
        unit: "",
        note: ""
    });

    const tiposDisponiveis = [
        { key: "pressao", label: "Pressão Arterial", unit: "mmHg", icon: Activity },
        { key: "temperatura", label: "Temperatura", unit: "°C", icon: Thermometer },
        { key: "batimentos", label: "Batimentos", unit: "BPM", icon: Heart }
    ];

    function openModal(prefillTipo?: string) {
        if (prefillTipo) {
            const tipo = tiposDisponiveis.find((t) => t.key === prefillTipo);
            setForm((f) => ({ ...f, tipo: tipo?.label || f.tipo, unit: tipo?.unit || f.unit }));
        }
        setShowModal(true);
        if (typeof document !== "undefined") document.body.style.overflow = "hidden";
    }

    function closeModal() {
        setShowModal(false);
        if (typeof document !== "undefined") document.body.style.overflow = "";
        setForm({ tipo: "Pressão Arterial", value: "", unit: "", note: "" });
    }

    // adiciona registro ao histórico (visual only)
    function handleAddRecord(e: React.FormEvent) {
        e.preventDefault();
        const novo = {
            id: Date.now(),
            tipo: form.tipo,
            value: form.value || "—",
            unit: form.unit || "",
            timeLabel: new Date().toISOString(),
            note: form.note || ""
        };
        setHistorico((prev) => [novo, ...prev]);
        closeModal();
    }

    // agrupa por data (YYYY-MM-DD) e ordena datas desc
    function groupByDate(list: any[]) {
        const grouped = list.reduce((acc: Record<string, any[]>, item) => {
            const date = item.timeLabel.slice(0, 10); // simple date key
            acc[date] = acc[date] || [];
            acc[date].push(item);
            return acc;
        }, {});
        const orderedKeys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1)); // desc
        const ordered: Record<string, any[]> = {};
        orderedKeys.forEach((k) => (ordered[k] = grouped[k]));
        return ordered;
    }

    const grouped = groupByDate(historico);

    const humores = [
        { id: "feliz", label: "Bem", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-50" },
        { id: "mais-ou-menos", label: "Mais ou menos", icon: Meh, color: "text-amber-500", bg: "bg-amber-50" },
        { id: "triste", label: "Incomodado", icon: Frown, color: "text-rose-500", bg: "bg-rose-50" }
    ];

    return (
        <div className="space-y-6 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
            {/* Cabeçalho */}
            <section>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#255f4f]">Saúde e Bem‑estar</h1>
                <p className="text-sm sm:text-base text-[#6b8c7d]">Como você está se sentindo agora?</p>
            </section>

            {/* Seleção de Humor */}
            <section className="grid grid-cols-3 sm:grid-cols-3 gap-3">
                {humores.map((h) => (
                    <button
                        key={h.id}
                        onClick={() => setHumorSelecionado(h.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 transition-all min-h-[88px]",
                            humorSelecionado === h.id
                                ? `border-[#5ba58c] ${h.bg} scale-105 shadow`
                                : "border-transparent bg-white shadow-sm"
                        )}
                        aria-pressed={humorSelecionado === h.id}
                    >
                        <h.icon className={`h-8 w-8 mb-1 ${h.color}`} />
                        <span className="font-medium text-[#255f4f] text-xs sm:text-sm">{h.label}</span>
                    </button>
                ))}
            </section>

            {/* Registros Rápidos (cards) */}
            <section className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#5ba58c]" />
                    Meus Registros
                </h2>

                <div className="grid grid-cols-1 gap-3">
                    {/* cards rápidos */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <QuickCard
                            icon={Activity}
                            label="Pressão Arterial"
                            value="12/8"
                            time="Hoje, 10:12"
                            unit="mmHg"
                            color="text-blue-600"
                            onAdd={() => openModal("pressao")}
                        />
                        <QuickCard
                            icon={Thermometer}
                            label="Temperatura"
                            value="36.5"
                            time="Hoje, 08:30"
                            unit="°C"
                            color="text-orange-500"
                            onAdd={() => openModal("temperatura")}
                        />
                        <QuickCard
                            icon={Heart}
                            label="Batimentos"
                            value="72"
                            time="Hoje, 10:12"
                            unit="BPM"
                            color="text-rose-500"
                            onAdd={() => openModal("batimentos")}
                        />
                    </div>

                    {/* Histórico em blocos (por data) */}
                    <div className="space-y-5">
                        {Object.keys(grouped).map((date) => (
                            <div key={date}>
                                <div className="flex items-center gap-3 mb-2">
                                    <Calendar className="h-4 w-4 text-[#9db4aa]" />
                                    <h4 className="font-semibold text-[#255f4f] text-sm">
                                        {new Date(date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
                                    </h4>
                                </div>

                                <div className="grid gap-3">
                                    {grouped[date].map((item) => (
                                        <Card key={item.id} className="rounded-xl overflow-hidden">
                                            <CardContent className="p-3 sm:p-4 flex items-center justify-between gap-3">
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="p-2 sm:p-3 rounded-lg bg-gray-50 text-[#5ba58c]">
                                                        <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm sm:text-base font-semibold text-[#255f4f] truncate">{item.tipo}</p>
                                                        <p className="text-xs sm:text-sm text-[#9db4aa] truncate">
                                                            {new Date(item.timeLabel).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                                                            {" — "}
                                                            {item.note}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-lg sm:text-2xl font-black text-[#255f4f]">{item.value}</span>
                                                    <div className="text-xs sm:text-sm font-bold text-[#6b8c7d] ml-1 uppercase">{item.unit}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Floating button via Portal (garante visibilidade em mobile) */}
            <FloatingButton onClick={() => openModal()} visible={!showModal} />

            {/* Modal (visual) - bottom sheet on mobile, centered on md+ */}
            {showModal && (
                <ModalBottom onClose={closeModal}>
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-[#255f4f]">Novo Registro</h3>
                                <span className="text-xs text-[#9db4aa]">{new Date().toLocaleDateString()}</span>
                            </div>
                            <button onClick={closeModal} className="p-2 rounded-md hover:bg-gray-100">
                                <X className="h-5 w-5 text-[#255f4f]" />
                            </button>
                        </div>

                        <form onSubmit={handleAddRecord} className="space-y-3">
                            <label className="block text-sm font-medium text-[#255f4f]">Tipo de registro</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {tiposDisponiveis.map((t) => {
                                    const Icon = t.icon;
                                    const active = form.tipo === t.label;
                                    return (
                                        <button
                                            type="button"
                                            key={t.key}
                                            onClick={() => setForm((f) => ({ ...f, tipo: t.label, unit: t.unit }))}
                                            className={clsx(
                                                "flex items-center gap-2 p-2 rounded-lg border transition text-left",
                                                active ? "border-[#5ba58c] bg-[#f0fbf7] shadow-sm" : "border-transparent bg-gray-50"
                                            )}
                                        >
                                            <div className="p-2 rounded-md bg-white border">
                                                <Icon className="h-4 w-4 text-[#5ba58c]" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-semibold text-[#255f4f] truncate">{t.label}</div>
                                                <div className="text-xs text-[#9db4aa]">{t.unit}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#255f4f]">Valor</label>
                                <input
                                    value={form.value}
                                    onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                                    placeholder="Ex: 12/8 ou 36.5"
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-[#255f4f]">Unidade (opcional)</label>
                                    <input
                                        value={form.unit}
                                        onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                                        placeholder="mmHg, °C, BPM..."
                                        className="w-full p-3 border border-gray-200 rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[#255f4f]">Horário (opcional)</label>
                                    <input
                                        type="time"
                                        onChange={(e) => {
                                            const time = e.target.value;
                                            setForm((f) => ({ ...f, note: time ? `Horário: ${time}` : f.note }));
                                        }}
                                        className="w-full p-3 border border-gray-200 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[#255f4f]">Observação (opcional)</label>
                                <textarea
                                    value={form.note}
                                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                                    placeholder="Anotações rápidas"
                                    className="w-full p-3 border border-gray-200 rounded-lg"
                                    rows={3}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <Button type="button" onClick={() => closeModal()} className="w-full sm:w-1/2 bg-white border border-gray-200 text-[#255f4f]">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="w-full sm:w-1/2 bg-[#5ba58c] text-white">
                                    Salvar (Visual)
                                </Button>
                            </div>
                        </form>
                    </div>
                </ModalBottom>
            )}
        </div>
    );
}

function FloatingButton({ onClick, visible }: { onClick: () => void; visible?: boolean }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || (visible !== undefined && !visible)) return null; // Não renderiza se o modal estiver aberto

    return ReactDOM.createPortal(
        <div
            className="fixed left-4 right-4 md:left-1/2 md:right-auto md:w-full md:max-w-md md:-translate-x-1/2 z-[100] pointer-events-auto"
            style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
        >
            <Button
                onClick={onClick}
                className="w-full py-6 rounded-2xl bg-[#5ba58c] hover:bg-[#4a8a75] text-white text-lg font-bold shadow-2xl border-2 border-white/20"
            >
                <Plus className="mr-2 h-6 w-6" />
                Novo Registro
            </Button>
        </div>,
        document.body
    );
}

/* ---------- Modal container (bottom-sheet on mobile) ---------- */
function ModalBottom({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && onClose) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[900] flex items-end md:items-center justify-center">
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
                aria-hidden
            />
            <div
                role="dialog"
                aria-modal="true"
                className="relative w-full md:max-w-3xl bg-white md:rounded-3xl rounded-t-3xl shadow-2xl max-h-[85vh] overflow-auto transform transition"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}

/* ---------- Subcomponentes ---------- */

function QuickCard({ icon: Icon, label, value, time, unit, color, onAdd }: any) {
    return (
        <Card className="border-[#d1e5dc] rounded-xl overflow-hidden">
            <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#255f4f] truncate">{label}</p>
                        <p className="text-xs text-[#9db4aa] truncate">{time}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="text-lg font-black text-[#255f4f]">{value}</span>
                        <div className="text-xs font-bold text-[#6b8c7d] ml-1 uppercase">{unit}</div>
                    </div>
                    <button
                        onClick={onAdd}
                        className="p-2 rounded-md bg-[#f4fbf8] text-[#255f4f] hover:bg-[#eaf7f1] transition"
                        aria-label={`Adicionar ${label}`}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}