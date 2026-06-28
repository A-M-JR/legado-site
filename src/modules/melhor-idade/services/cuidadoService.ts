import type { CuidadoPeriodo, CuidadoTarefa, CuidadoTipo } from "../types";
import { readStorage, writeStorage } from "./storage";

const KEY = "cuidado_tarefas";

const MOCK: CuidadoTarefa[] = [
    { id: "1", hora: "08:00", titulo: "Remédio Pressão", desc: "1 comprimido branco", tipo: "remedio", feito: true, periodo: "manha", responsavel: "Maria" },
    { id: "2", hora: "08:30", titulo: "Café da Manhã", desc: "Frutas e torradas", tipo: "comida", feito: true, periodo: "manha", responsavel: "Maria" },
    { id: "3", hora: "12:00", titulo: "Almoço", desc: "Rico em fibras", tipo: "comida", feito: false, periodo: "tarde", responsavel: "João" },
    { id: "4", hora: "14:00", titulo: "Vitaminas", desc: "Cápsula gelatina", tipo: "remedio", feito: false, periodo: "tarde", responsavel: "João" },
    { id: "5", hora: "20:00", titulo: "Preparar para Dormir", desc: "Higiene e relaxamento", tipo: "higiene", feito: false, periodo: "noite", responsavel: "Maria" },
];

export const cuidadoService = {
    list(): CuidadoTarefa[] {
        return readStorage(KEY, MOCK);
    },

    save(tarefas: CuidadoTarefa[]): CuidadoTarefa[] {
        writeStorage(KEY, tarefas);
        return tarefas;
    },

    toggleFeito(id: string): CuidadoTarefa[] {
        const updated = this.list().map((t) =>
            t.id === id ? { ...t, feito: !t.feito } : t
        );
        return this.save(updated);
    },

    add(data: {
        hora: string;
        titulo: string;
        desc?: string;
        tipo: CuidadoTipo;
        periodo: CuidadoPeriodo;
        responsavel?: string;
    }): CuidadoTarefa[] {
        const novo: CuidadoTarefa = {
            id: String(Date.now()),
            ...data,
            feito: false,
        };
        const updated = [...this.list(), novo].sort((a, b) =>
            a.hora < b.hora ? -1 : 1
        );
        return this.save(updated);
    },

    groupByPeriodo(list: CuidadoTarefa[]): Record<CuidadoPeriodo, CuidadoTarefa[]> {
        const map: Record<CuidadoPeriodo, CuidadoTarefa[]> = {
            manha: [],
            tarde: [],
            noite: [],
        };
        list.forEach((it) => map[it.periodo].push(it));
        (Object.keys(map) as CuidadoPeriodo[]).forEach((k) =>
            map[k].sort((a, b) => (a.hora < b.hora ? -1 : 1))
        );
        return map;
    },
};
