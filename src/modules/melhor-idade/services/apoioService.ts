import { supabase } from "@/lib/supabaseClient";
import type { ContatoApoio } from "../types";
import { OPCOES_APOIO_MOCK } from "../mocks/data";
import { applyScope, getMiScope } from "./miScope";

function mapRow(row: Record<string, unknown>): ContatoApoio {
    return {
        id: String(row.id),
        nome: String(row.nome),
        relacao: String(row.relacao ?? ""),
        fotoUrl: String(row.foto_url ?? ""),
        telefone: row.telefone ? String(row.telefone) : undefined,
        emergencia: Boolean(row.emergencia),
    };
}

export const apoioService = {
    async listContatos(): Promise<ContatoApoio[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_contatos_apoio").select("*").order("created_at", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    listOpcoes() {
        return OPCOES_APOIO_MOCK;
    },
};
