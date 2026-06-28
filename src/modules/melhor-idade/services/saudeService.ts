import type { RegistroSaude } from "../types";
import { readStorage, writeStorage } from "./storage";

const KEY = "registros_saude";

const MOCK: RegistroSaude[] = [
    {
        id: "1",
        tipo: "Pressão Arterial",
        value: "12/8",
        unit: "mmHg",
        timeLabel: "2026-02-09T10:12:00",
        note: "Medida após caminhada leve",
    },
    {
        id: "2",
        tipo: "Batimentos",
        value: "72",
        unit: "BPM",
        timeLabel: "2026-02-09T08:30:00",
        note: "Em repouso",
    },
    {
        id: "3",
        tipo: "Temperatura",
        value: "36.5",
        unit: "°C",
        timeLabel: "2026-02-08T19:20:00",
        note: "Rotina noturna",
    },
];

export const saudeService = {
    list(): RegistroSaude[] {
        return readStorage(KEY, MOCK);
    },

    add(data: Omit<RegistroSaude, "id" | "timeLabel"> & { timeLabel?: string }): RegistroSaude[] {
        const novo: RegistroSaude = {
            ...data,
            id: String(Date.now()),
            timeLabel: data.timeLabel || new Date().toISOString(),
        };
        const updated = [novo, ...this.list()];
        writeStorage(KEY, updated);
        return updated;
    },

    ultimoPorTipo(tipo: string): RegistroSaude | undefined {
        return this.list().find((r) => r.tipo === tipo);
    },

    groupByDate(list: RegistroSaude[]): Record<string, RegistroSaude[]> {
        const grouped = list.reduce<Record<string, RegistroSaude[]>>((acc, item) => {
            const date = item.timeLabel.slice(0, 10);
            acc[date] = acc[date] || [];
            acc[date].push(item);
            return acc;
        }, {});
        const keys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));
        return Object.fromEntries(keys.map((k) => [k, grouped[k]]));
    },
};
