import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Stethoscope } from "lucide-react";
import clsx from "clsx";
import type { ConsultaMedica } from "../types";
import {
    consultasFuturas,
    consultasPorDia,
    consultaParaDate,
    formatarDiaConsulta,
    isoFromDate,
} from "../lib/consultaDates";
import { MiCard } from "./MiCard";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES_CURTOS = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

type Props = {
    consultas: ConsultaMedica[];
    onVerTodas?: () => void;
};

function buildGrid(ano: number, mes: number): (number | null)[] {
    const primeiro = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    const cells: (number | null)[] = Array(primeiro.getDay()).fill(null);
    for (let d = 1; d <= ultimoDia; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

export function MiConsultasResumo({ consultas, onVerTodas }: Props) {
    const hoje = new Date();
    const [mesRef, setMesRef] = useState(() => new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    const [calendarioAberto, setCalendarioAberto] = useState(false);

    const porDia = useMemo(() => consultasPorDia(consultas), [consultas]);
    const proximas = useMemo(() => consultasFuturas(consultas, 3), [consultas]);
    const grid = useMemo(
        () => buildGrid(mesRef.getFullYear(), mesRef.getMonth()),
        [mesRef]
    );

    const hojeISO = isoFromDate(hoje);
    const mesAtual =
        mesRef.getMonth() === hoje.getMonth() && mesRef.getFullYear() === hoje.getFullYear();

    function isoDoDia(dia: number): string {
        const y = mesRef.getFullYear();
        const m = String(mesRef.getMonth() + 1).padStart(2, "0");
        const d = String(dia).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    return (
        <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Consultas</h2>
                {onVerTodas && (
                    <button
                        type="button"
                        onClick={onVerTodas}
                        className="text-xs font-semibold text-[#5ba58c] hover:underline shrink-0"
                    >
                        Ver todas
                    </button>
                )}
            </div>

            <MiCard variant="soft" className="p-3 sm:p-4 space-y-2.5">
                {proximas.length === 0 ? (
                    <p className="text-sm text-[#6b8c7d] py-1">Nenhuma consulta agendada.</p>
                ) : (
                    <div className="space-y-1.5">
                        {proximas.map((c) => (
                            <div
                                key={c.id}
                                className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2 border border-[#e6efe9]"
                            >
                                <div className="shrink-0 w-11 text-center leading-tight">
                                    <p className="text-[9px] font-bold uppercase text-[#5ba58c]">
                                        {formatarDiaConsulta(c.data)}
                                    </p>
                                    <p className="text-xs font-bold text-[#255f4f]">
                                        {consultaParaDate(c.data)?.toLocaleDateString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                        }) ?? c.data}
                                    </p>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-[#255f4f] truncate">{c.medico}</p>
                                    <p className="text-[11px] text-[#6b8c7d] truncate">
                                        {[c.tipo, c.local].filter(Boolean).join(" • ")}
                                    </p>
                                </div>
                                <Stethoscope className="h-4 w-4 text-[#5ba58c]/60 shrink-0" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Calendário compacto — desktop sempre visível */}
                <div className="hidden sm:block border-t border-[#e6efe9] pt-2.5 space-y-2">
                    <CalendarioCompacto
                        mesRef={mesRef}
                        mesAtual={mesAtual}
                        hojeISO={hojeISO}
                        grid={grid}
                        porDia={porDia}
                        isoDoDia={isoDoDia}
                        onMudarMes={(d) => setMesRef((p) => new Date(p.getFullYear(), p.getMonth() + d, 1))}
                    />
                </div>

                {/* Mobile — calendário colapsável */}
                <div className="sm:hidden border-t border-[#e6efe9] pt-2">
                    <button
                        type="button"
                        onClick={() => setCalendarioAberto((v) => !v)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-[#5ba58c] py-1"
                    >
                        {calendarioAberto ? "Ocultar calendário" : "Ver calendário do mês"}
                        {calendarioAberto ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </button>
                    {calendarioAberto && (
                        <div className="pt-2">
                            <CalendarioCompacto
                                mesRef={mesRef}
                                mesAtual={mesAtual}
                                hojeISO={hojeISO}
                                grid={grid}
                                porDia={porDia}
                                isoDoDia={isoDoDia}
                                onMudarMes={(d) =>
                                    setMesRef((p) => new Date(p.getFullYear(), p.getMonth() + d, 1))
                                }
                            />
                        </div>
                    )}
                </div>
            </MiCard>
        </section>
    );
}

function CalendarioCompacto({
    mesRef,
    mesAtual,
    hojeISO,
    grid,
    porDia,
    isoDoDia,
    onMudarMes,
}: {
    mesRef: Date;
    mesAtual: boolean;
    hojeISO: string;
    grid: (number | null)[];
    porDia: Map<string, ConsultaMedica[]>;
    isoDoDia: (dia: number) => string;
    onMudarMes: (delta: number) => void;
}) {
    return (
        <>
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={() => onMudarMes(-1)}
                    className="p-1 rounded-lg hover:bg-white text-[#9db4aa]"
                    aria-label="Mês anterior"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <p className="text-xs font-bold text-[#255f4f]">
                    {MESES_CURTOS[mesRef.getMonth()]} {mesRef.getFullYear()}
                </p>
                <button
                    type="button"
                    onClick={() => onMudarMes(1)}
                    className="p-1 rounded-lg hover:bg-white text-[#9db4aa]"
                    aria-label="Próximo mês"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 text-center">
                {DIAS_SEMANA.map((d, i) => (
                    <span key={`${d}-${i}`} className="text-[9px] font-bold text-[#9db4aa] py-0.5">
                        {d}
                    </span>
                ))}
                {grid.map((dia, i) => {
                    if (dia == null) return <span key={`e-${i}`} className="h-7" />;
                    const iso = isoDoDia(dia);
                    const temConsulta = porDia.has(iso);
                    const isHoje = mesAtual && iso === hojeISO;

                    return (
                        <div
                            key={iso}
                            className={clsx(
                                "relative h-7 flex items-center justify-center rounded-lg text-[11px] font-semibold",
                                isHoje
                                    ? "bg-[#e3f1eb] text-[#255f4f] ring-1 ring-[#5ba58c]/50"
                                    : temConsulta
                                      ? "bg-[#5ba58c]/15 text-[#255f4f]"
                                      : "text-[#6b8c7d]"
                            )}
                        >
                            {dia}
                            {temConsulta && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#5ba58c]" />
                            )}
                        </div>
                    );
                })}
            </div>
        </>
    );
}

// compat — HomePage importa só MiConsultasResumo
export { MiConsultasResumo as MiConsultasCalendario };
