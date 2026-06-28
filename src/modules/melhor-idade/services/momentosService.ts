import { MOMENTOS_MOCK } from "../mocks/data";
import type { Momento } from "../types";
import { readStorage, writeStorage } from "./storage";

const MOMENTOS_KEY = "momentos";

export const momentosService = {
    list(): Momento[] {
        return readStorage(MOMENTOS_KEY, MOMENTOS_MOCK);
    },

    listByFiltro(filtro: "fotos" | "videos" | "favoritos"): Momento[] {
        const all = this.list();
        if (filtro === "favoritos") return all.filter((m) => m.favorito);
        if (filtro === "videos") return all.filter((m) => m.tipo === "video");
        return all.filter((m) => m.tipo === "foto");
    },

    toggleFavorito(id: string): Momento[] {
        const updated = this.list().map((m) =>
            m.id === id ? { ...m, favorito: !m.favorito } : m
        );
        writeStorage(MOMENTOS_KEY, updated);
        return updated;
    },

    add(data: { tipo: "foto" | "video"; url: string; legenda?: string }): Momento[] {
        const novo: Momento = {
            id: String(Date.now()),
            tipo: data.tipo,
            url: data.url,
            favorito: false,
            criadoEm: new Date().toISOString().slice(0, 10),
        };
        const updated = [novo, ...this.list()];
        writeStorage(MOMENTOS_KEY, updated);
        return updated;
    },
};
