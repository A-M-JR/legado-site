import { dataBRParaISO } from "@/lib/masks";
import type { ConsultaMedica } from "../types";

export function consultaParaISO(data: string): string {
    if (!data) return "";
    if (data.includes("/")) return dataBRParaISO(data);
    return data.slice(0, 10);
}

export function consultaParaDate(data: string): Date | null {
    const iso = consultaParaISO(data);
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

export function isoFromDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function inicioDoDia(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function consultasPorDia(consultas: ConsultaMedica[]): Map<string, ConsultaMedica[]> {
    const map = new Map<string, ConsultaMedica[]>();
    for (const c of consultas) {
        const iso = consultaParaISO(c.data);
        if (!iso) continue;
        const list = map.get(iso) ?? [];
        list.push(c);
        map.set(iso, list);
    }
    return map;
}

export function consultasFuturas(consultas: ConsultaMedica[], limite?: number): ConsultaMedica[] {
    const hoje = inicioDoDia(new Date());
    const futuras = consultas
        .filter((c) => {
            const d = consultaParaDate(c.data);
            return d && d >= hoje;
        })
        .sort((a, b) => consultaParaISO(a.data).localeCompare(consultaParaISO(b.data)));
    return limite ? futuras.slice(0, limite) : futuras;
}

export function consultasNoMes(
    consultas: ConsultaMedica[],
    ano: number,
    mes: number
): ConsultaMedica[] {
    return consultas.filter((c) => {
        const d = consultaParaDate(c.data);
        return d && d.getFullYear() === ano && d.getMonth() === mes;
    });
}

export function formatarDiaConsulta(data: string): string {
    const d = consultaParaDate(data);
    if (!d) return data;
    const hoje = inicioDoDia(new Date());
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    if (d.getTime() === hoje.getTime()) return "Hoje";
    if (d.getTime() === amanha.getTime()) return "Amanhã";
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}
