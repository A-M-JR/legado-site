import { ChevronRight } from "lucide-react";
import clsx from "clsx";
import type { ReactNode } from "react";

type MiCardVariant = "default" | "soft" | "accent" | "alert";

interface MiCardProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: MiCardVariant;
}

const VARIANTS: Record<MiCardVariant, string> = {
    default: "bg-white border-[#e6efe9] hover:border-[#c2e1d4]",
    soft: "bg-[#f8fcfb] border-[#e9f3ee]",
    accent: "bg-gradient-to-br from-[#f4fbf8] to-white border-[#c2e1d4]",
    alert: "bg-orange-50 border-orange-100 hover:border-orange-200",
};

export function MiCard({ children, onClick, className, variant = "default" }: MiCardProps) {
    const classes = clsx(
        "w-full text-left rounded-[20px] sm:rounded-2xl border shadow-sm transition-all duration-200",
        VARIANTS[variant],
        onClick && "hover:shadow-md active:scale-[0.99] cursor-pointer",
        className
    );

    if (onClick) {
        return (
            <div
                role="button"
                tabIndex={0}
                onClick={onClick}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onClick();
                    }
                }}
                className={classes}
            >
                {children}
            </div>
        );
    }

    return <div className={classes}>{children}</div>;
}

interface MiListItemProps {
    icon: ReactNode;
    titulo: string;
    descricao: string;
    horario?: string;
    onClick?: () => void;
    iconClassName?: string;
}

export function MiListItem({
    icon,
    titulo,
    descricao,
    horario,
    onClick,
    iconClassName,
}: MiListItemProps) {
    return (
        <MiCard onClick={onClick} variant="accent" className="p-4 sm:p-5">
            <div className="flex items-center gap-3 sm:gap-4">
                <div
                    className={clsx(
                        "shrink-0 p-3 sm:p-3.5 rounded-2xl bg-white shadow-sm text-[#5ba58c]",
                        iconClassName
                    )}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-[#255f4f] text-sm sm:text-base">{titulo}</p>
                        {horario && (
                            <span className="text-[10px] sm:text-xs font-bold text-[#5ba58c] bg-[#e3f1eb] px-2 py-0.5 rounded-full">
                                {horario}
                            </span>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#6b8c7d] mt-0.5 line-clamp-2">
                        {descricao}
                    </p>
                </div>
                <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
            </div>
        </MiCard>
    );
}

interface MiFilterPillsProps {
    options: { id: string; label: string }[];
    value: string;
    onChange: (id: string) => void;
}

export function MiFilterPills({ options, value, onChange }: MiFilterPillsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {options.map((opt) => (
                <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChange(opt.id)}
                    className={clsx(
                        "px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition shrink-0",
                        value === opt.id
                            ? "bg-[#255f4f] text-white shadow-sm"
                            : "bg-white text-[#6b8c7d] border border-[#e6efe9] hover:bg-[#f8fcfb]"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
