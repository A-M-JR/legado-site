import { supabase } from "@/lib/supabaseClient";
import type { RotinaItem, RotinaPeriodo } from "../types";
import { applyScope, getMpScope, scopePayload } from "./mpScope";

function mapRow(row: Record<string, unknown>): RotinaItem {
    return {
        id: String(row.id),
        hora: String(row.hora ?? ""),
        titulo: String(row.titulo ?? ""),
        descricao: String(row.descricao ?? ""),
        tipo: row.tipo as RotinaItem["tipo"],
        periodo: row.periodo as RotinaPeriodo,
        valorAlvo: String(row.valor_alvo ?? ""),
        unidadeMedida: String(row.unidade_medida ?? ""),
        responsavel: row.responsavel ? String(row.responsavel) : undefined,
        feito: Boolean(row.feito),
    };
}

export const rotinaService = {
    async list(): Promise<RotinaItem[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase.from("mp_rotina").select("*").order("hora", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(item: Omit<RotinaItem, "id" | "feito">): Promise<RotinaItem[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        const { error } = await supabase.from("mp_rotina").insert({
            ...scopePayload(scope),
            hora: item.hora,
            titulo: item.titulo,
            descricao: item.descricao,
            tipo: item.tipo,
            periodo: item.periodo,
            valor_alvo: item.valorAlvo,
            unidade_medida: item.unidadeMedida,
            responsavel: item.responsavel ?? null,
            feito: false,
        });
        if (error) throw new Error(error.message);

        return this.list();
    },

    async update(id: string, item: Partial<Omit<RotinaItem, "id">>): Promise<RotinaItem[]> {
        const payload: Record<string, unknown> = {};
        if (item.hora !== undefined) payload.hora = item.hora;
        if (item.titulo !== undefined) payload.titulo = item.titulo;
        if (item.descricao !== undefined) payload.descricao = item.descricao;
        if (item.tipo !== undefined) payload.tipo = item.tipo;
        if (item.periodo !== undefined) payload.periodo = item.periodo;
        if (item.valorAlvo !== undefined) payload.valor_alvo = item.valorAlvo;
        if (item.unidadeMedida !== undefined) payload.unidade_medida = item.unidadeMedida;
        if (item.responsavel !== undefined) payload.responsavel = item.responsavel ?? null;
        if (item.feito !== undefined) payload.feito = item.feito;

        const { error } = await supabase.from("mp_rotina").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.list();
    },

    async toggleFeito(id: string): Promise<RotinaItem[]> {
        const atual = (await this.list()).find((r) => r.id === id);
        if (!atual) return this.list();
        return this.update(id, { feito: !atual.feito });
    },

    async remove(id: string): Promise<RotinaItem[]> {
        const { error } = await supabase.from("mp_rotina").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return this.list();
    },

    groupByPeriodo(list: RotinaItem[]): Record<RotinaPeriodo, RotinaItem[]> {
        return {
            manha: list.filter((i) => i.periodo === "manha"),
            tarde: list.filter((i) => i.periodo === "tarde"),
            noite: list.filter((i) => i.periodo === "noite"),
        };
    },
};
