import type { FamiliaMemoria } from "../types";
import { readStorage, writeStorage } from "./storage";

const KEY = "familia_memorias";

const MOCK: FamiliaMemoria[] = [
    {
        id: "1",
        pessoaId: "eu",
        mensagem: "Te amo muito, vovó! 💙",
        remetente: "Ana",
        anonimo: false,
        criadoEm: new Date(Date.now() - 172800000).toISOString(),
    },
];

export const familiaMemoriasService = {
    list(pessoaId?: string): FamiliaMemoria[] {
        const all = readStorage(KEY, MOCK).sort(
            (a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime()
        );
        if (!pessoaId) return all;
        return all.filter((m) => m.pessoaId === pessoaId);
    },

    add(data: Omit<FamiliaMemoria, "id" | "criadoEm">): FamiliaMemoria[] {
        const novo: FamiliaMemoria = {
            ...data,
            id: String(Date.now()),
            criadoEm: new Date().toISOString(),
        };
        const updated = [novo, ...readStorage(KEY, MOCK)];
        writeStorage(KEY, updated);
        return this.list(data.pessoaId);
    },

    remove(id: string): FamiliaMemoria[] {
        const updated = readStorage(KEY, MOCK).filter((m) => m.id !== id);
        writeStorage(KEY, updated);
        return updated;
    },
};
