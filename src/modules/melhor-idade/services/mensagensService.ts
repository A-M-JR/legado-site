import { MENSAGENS_MOCK } from "../mocks/data";
import type { Mensagem, MensagemTipo } from "../types";
import { readStorage, writeStorage } from "./storage";

const MENSAGENS_KEY = "mensagens";

export const mensagensService = {
    list(): Mensagem[] {
        return readStorage(MENSAGENS_KEY, MENSAGENS_MOCK);
    },

    listByTipo(tipo?: MensagemTipo | "todas"): Mensagem[] {
        const all = this.list();
        if (!tipo || tipo === "todas") return all;
        return all.filter((m) => m.tipo === tipo);
    },

    countNaoLidas(): number {
        return this.list().filter((m) => !m.lida).length;
    },

    marcarLida(id: string): Mensagem[] {
        const updated = this.list().map((m) =>
            m.id === id ? { ...m, lida: true } : m
        );
        writeStorage(MENSAGENS_KEY, updated);
        return updated;
    },
};
