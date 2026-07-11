import { supabase } from "@/lib/supabaseClient";
import type { TarefaDia } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";

function mapRow(row: Record<string, unknown>): TarefaDia {
    return {
        id: String(row.id),
        tipo: row.tipo as TarefaDia["tipo"],
        titulo: String(row.titulo),
        descricao: String(row.descricao ?? ""),
        horario: row.horario ? String(row.horario) : undefined,
        feito: Boolean(row.feito),
    };
}

export const agendaService = {
    async list(): Promise<TarefaDia[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_tarefas").select("*").order("created_at", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async toggleFeito(id: string): Promise<TarefaDia[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const current = (await this.list()).find((t) => t.id === id);
        if (!current) return this.list();

        await supabase
            .from("mi_tarefas")
            .update({ feito: !current.feito })
            .eq("id", id);

        return this.list();
    },

    async add(tarefa: Omit<TarefaDia, "id">): Promise<TarefaDia[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        await supabase.from("mi_tarefas").insert({
            ...scopePayload(scope),
            tipo: tarefa.tipo,
            titulo: tarefa.titulo,
            descricao: tarefa.descricao,
            horario: tarefa.horario ?? null,
            feito: tarefa.feito ?? false,
        });

        return this.list();
    },
};
