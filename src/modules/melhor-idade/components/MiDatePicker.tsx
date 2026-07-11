import { useRef } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDataLonga } from "@/lib/masks";

type MiDatePickerProps = {
    value: string;
    onChange: (iso: string) => void;
    min?: string;
    max?: string;
    className?: string;
    id?: string;
    disabled?: boolean;
};

export function MiDatePicker({
    value,
    onChange,
    min,
    max,
    className,
    id,
    disabled,
}: MiDatePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    function abrirCalendario() {
        const input = inputRef.current;
        if (!input) return;
        if (typeof input.showPicker === "function") {
            input.showPicker();
        } else {
            input.focus();
            input.click();
        }
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="relative">
                <input
                    ref={inputRef}
                    id={id}
                    type="date"
                    value={value}
                    min={min}
                    max={max}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        "flex w-full h-14 rounded-xl border border-[#d1e5dc] bg-white",
                        "px-4 pr-14 text-lg font-semibold text-[#255f4f]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5ba58c]",
                        "[color-scheme:light]"
                    )}
                />
                <button
                    type="button"
                    onClick={abrirCalendario}
                    disabled={disabled}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl bg-[#e3f1eb] flex items-center justify-center text-[#5ba58c] hover:bg-[#d4ebe3] transition disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Abrir calendário"
                >
                    <CalendarDays className="h-6 w-6" />
                </button>
            </div>
            {value ? (
                <p className="text-sm font-medium text-[#5ba58c] text-center">{formatDataLonga(value)}</p>
            ) : (
                <p className="text-xs text-[#9db4aa] text-center">Toque para escolher a data</p>
            )}
        </div>
    );
}
