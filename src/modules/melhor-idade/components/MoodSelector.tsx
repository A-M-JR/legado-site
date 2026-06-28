import { Smile, Meh, Heart } from "lucide-react";
import clsx from "clsx";
import type { HumorTipo } from "../types";

const OPCOES: { id: HumorTipo; label: string; icon: typeof Smile; bg: string; color: string }[] = [
    { id: "bem", label: "Bem", icon: Smile, bg: "bg-emerald-50", color: "text-emerald-600" },
    { id: "mais_ou_menos", label: "Mais ou menos", icon: Meh, bg: "bg-amber-50", color: "text-amber-600" },
    { id: "precisa_apoio", label: "Preciso de apoio", icon: Heart, bg: "bg-violet-50", color: "text-violet-600" },
];

interface MoodSelectorProps {
    value?: HumorTipo | null;
    onChange: (humor: HumorTipo) => void;
    size?: "sm" | "lg";
}

export function MoodSelector({ value, onChange, size = "lg" }: MoodSelectorProps) {
    const isLarge = size === "lg";

    return (
        <div className={clsx("grid gap-3", isLarge ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-3")}>
            {OPCOES.map((op) => {
                const Icon = op.icon;
                const active = value === op.id;
                return (
                    <button
                        key={op.id}
                        type="button"
                        onClick={() => onChange(op.id)}
                        className={clsx(
                            "flex flex-col items-center justify-center rounded-2xl border-2 transition-all",
                            isLarge ? "p-5 sm:p-6" : "p-3",
                            active
                                ? `border-[#5ba58c] ${op.bg} shadow-md scale-[1.02]`
                                : "border-transparent bg-white shadow-sm hover:shadow-md"
                        )}
                    >
                        <Icon className={clsx(isLarge ? "h-10 w-10 mb-2" : "h-7 w-7 mb-1", op.color)} />
                        <span className={clsx("font-semibold text-[#255f4f]", isLarge ? "text-sm" : "text-xs")}>
                            {op.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

export function moodLabel(humor?: HumorTipo | null): string {
    const map: Record<HumorTipo, string> = {
        bem: "Bem",
        mais_ou_menos: "Mais ou menos",
        precisa_apoio: "Preciso de apoio",
    };
    return humor ? map[humor] : "—";
}
