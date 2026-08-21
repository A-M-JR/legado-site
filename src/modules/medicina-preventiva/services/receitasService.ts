import { supabase } from "@/lib/supabaseClient";
import type { ReceitaMp } from "../types";
import { applyScope, getMpScope, scopePayload } from "./mpScope";

function mapRow(row: Record<string, unknown>): ReceitaMp {
    return {
        id: String(row.id),
        medicamento: String(row.medicamento ?? ""),
        dosagem: String(row.dosagem ?? ""),
        frequencia: String(row.frequencia ?? ""),
        inicio: row.inicio ? String(row.inicio) : "",
        validade: row.validade ? String(row.validade) : "",
        medico: String(row.medico ?? ""),
        especialidade: String(row.especialidade ?? ""),
        dataConsulta: String(row.data_consulta ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
        ativa: row.ativa !== false,
        observacoes: String(row.observacoes ?? ""),
    };
}

export const receitasService = {
    async list(): Promise<ReceitaMp[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_receitas")
            .select("*")
            .order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(receita: Omit<ReceitaMp, "id">): Promise<ReceitaMp[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        const { error } = await supabase.from("mp_receitas").insert({
            ...scopePayload(scope),
            medicamento: receita.medicamento,
            dosagem: receita.dosagem,
            frequencia: receita.frequencia,
            inicio: receita.inicio || null,
            validade: receita.validade || null,
            medico: receita.medico,
            especialidade: receita.especialidade,
            data_consulta: receita.dataConsulta,
            foto_url: receita.fotoUrl ?? null,
            ativa: receita.ativa,
            observacoes: receita.observacoes,
        });
        if (error) throw new Error(error.message);

        return this.list();
    },

    async update(id: string, receita: Partial<Omit<ReceitaMp, "id">>): Promise<ReceitaMp[]> {
        const payload: Record<string, unknown> = {};
        if (receita.medicamento !== undefined) payload.medicamento = receita.medicamento;
        if (receita.dosagem !== undefined) payload.dosagem = receita.dosagem;
        if (receita.frequencia !== undefined) payload.frequencia = receita.frequencia;
        if (receita.inicio !== undefined) payload.inicio = receita.inicio || null;
        if (receita.validade !== undefined) payload.validade = receita.validade || null;
        if (receita.medico !== undefined) payload.medico = receita.medico;
        if (receita.especialidade !== undefined) payload.especialidade = receita.especialidade;
        if (receita.dataConsulta !== undefined) payload.data_consulta = receita.dataConsulta;
        if (receita.fotoUrl !== undefined) payload.foto_url = receita.fotoUrl ?? null;
        if (receita.ativa !== undefined) payload.ativa = receita.ativa;
        if (receita.observacoes !== undefined) payload.observacoes = receita.observacoes;

        const { error } = await supabase.from("mp_receitas").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.list();
    },

    async setAtiva(id: string, ativa: boolean): Promise<ReceitaMp[]> {
        return this.update(id, { ativa });
    },

    async remove(id: string): Promise<ReceitaMp[]> {
        const { error } = await supabase.from("mp_receitas").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return this.list();
    },
};
