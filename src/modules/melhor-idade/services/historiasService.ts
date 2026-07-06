import type { HistoriaEntrada } from "../types";
import { readStorage, writeStorage } from "./storage";

const KEY = "historias";

const MOCK: HistoriaEntrada[] = [
    {
        id: "1",
        titulo: "Um dia especial",
        conteudo: "Hoje recebi a visita da minha neta. Foi um momento muito feliz.",
        privado: false,
        mediaTipo: "foto",
        mediaUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80",
        criadoEm: new Date(Date.now() - 86400000).toISOString(),
    },
];

export const historiasService = {
    list(): HistoriaEntrada[] {
        return readStorage(KEY, MOCK).sort(
            (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
    },

    add(data: Omit<HistoriaEntrada, "id" | "criadoEm">): HistoriaEntrada[] {
        const novo: HistoriaEntrada = {
            ...data,
            id: String(Date.now()),
            criadoEm: new Date().toISOString(),
        };
        const updated = [novo, ...this.list()];
        writeStorage(KEY, updated);
        return updated;
    },

    update(id: string, data: Partial<Omit<HistoriaEntrada, "id" | "criadoEm">>): HistoriaEntrada[] {
        const updated = this.list().map((h) => (h.id === id ? { ...h, ...data } : h));
        writeStorage(KEY, updated);
        return updated;
    },

    remove(id: string): HistoriaEntrada[] {
        const updated = this.list().filter((h) => h.id !== id);
        writeStorage(KEY, updated);
        return updated;
    },
};
