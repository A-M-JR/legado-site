import type { PessoaRede } from "../types";

export const RELACOES = [
    "Filho(a)",
    "Filha",
    "Filho",
    "Neta",
    "Neto",
    "Amigo(a)",
    "Cuidador(a)",
    "Familiar",
] as const;

const RELACAO_ALIASES: Record<string, string> = {
    Amigo: "Amigo(a)",
    Amiga: "Amigo(a)",
    Cuidador: "Cuidador(a)",
    Cuidadora: "Cuidador(a)",
};

export function normalizeRelacao(relacao: string | undefined): string {
    const t = (relacao ?? "").trim();
    if (!t) return RELACOES[0];
    if (RELACAO_ALIASES[t]) return RELACAO_ALIASES[t];
    if ((RELACOES as readonly string[]).includes(t)) return t;
    return t;
}

export function normalizePessoaRede(p: PessoaRede): PessoaRede {
    return {
        ...p,
        nome: p.nome.trim(),
        relacao: normalizeRelacao(p.relacao),
    };
}

/** Uma pessoa por nome — última entrada vence (evita Henrique Amigo + Henrique Filho). */
export function dedupeRede(rede: PessoaRede[]): PessoaRede[] {
    const map = new Map<string, PessoaRede>();
    for (const raw of rede) {
        const p = normalizePessoaRede(raw);
        if (!p.nome) continue;
        map.set(p.nome.toLowerCase(), p);
    }
    return Array.from(map.values());
}

export function relacaoValida(relacao: string): boolean {
    return (RELACOES as readonly string[]).includes(normalizeRelacao(relacao));
}
