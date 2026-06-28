import { TAREFAS_DIA_MOCK } from "../mocks/data";
import type { TarefaDia } from "../types";
import { readStorage, writeStorage } from "./storage";

const TAREFAS_KEY = "tarefas_dia";

export const agendaService = {
    list(): TarefaDia[] {
        return readStorage(TAREFAS_KEY, TAREFAS_DIA_MOCK);
    },

    save(tarefas: TarefaDia[]): TarefaDia[] {
        writeStorage(TAREFAS_KEY, tarefas);
        return tarefas;
    },

    toggleFeito(id: string): TarefaDia[] {
        const updated = this.list().map((t) =>
            t.id === id ? { ...t, feito: !t.feito } : t
        );
        return this.save(updated);
    },

    add(tarefa: Omit<TarefaDia, "id">): TarefaDia[] {
        const novo: TarefaDia = { ...tarefa, id: String(Date.now()) };
        return this.save([novo, ...this.list()]);
    },
};
