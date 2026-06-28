import { NOTIFICACOES_MOCK } from "../mocks/data";
import type { Notificacao } from "../types";
import { readStorage, writeStorage } from "./storage";

const KEY = "notificacoes";

export const notificacoesService = {
    list(): Notificacao[] {
        return readStorage(KEY, NOTIFICACOES_MOCK);
    },

    countNaoLidas(): number {
        return this.list().filter((n) => !n.lida).length;
    },

    marcarLida(id: string): Notificacao[] {
        const updated = this.list().map((n) => (n.id === id ? { ...n, lida: true } : n));
        writeStorage(KEY, updated);
        return updated;
    },

    marcarTodasLidas(): Notificacao[] {
        const updated = this.list().map((n) => ({ ...n, lida: true }));
        writeStorage(KEY, updated);
        return updated;
    },
};
