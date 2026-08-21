import { supabase } from "@/lib/supabaseClient";
import type { ConsultaMp } from "../types";
import { applyScope, getMpScope } from "./mpScope";

export function mapConsulta(row: Record<string, unknown>): ConsultaMp {
    return {
        id: String(row.id),
        titularId: String(row.titular_id ?? ""),
        dataHora: String(row.data_hora ?? ""),
        profissional: String(row.profissional ?? ""),
        especialidade: String(row.especialidade ?? ""),
        local: String(row.local ?? ""),
        tipo: (row.tipo as ConsultaMp["tipo"]) ?? "presencial",
        observacoes: String(row.observacoes ?? ""),
        status: (row.status as ConsultaMp["status"]) ?? "agendada",
        origem: (row.origem as ConsultaMp["origem"]) ?? "clinica",
        unidadeId: row.unidade_id ? String(row.unidade_id) : null,
    };
}

const ATIVAS: ConsultaMp["status"][] = ["agendada", "confirmada"];

/** Consultas do paciente — leitura apenas: quem agenda é a clínica. */
export const consultasService = {
    async list(): Promise<ConsultaMp[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_consultas")
            .select("*")
            .order("data_hora", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapConsulta);
    },

    proxima(list: ConsultaMp[]): ConsultaMp | null {
        const agora = Date.now();
        const futuras = list
            .filter((c) => ATIVAS.includes(c.status))
            .filter((c) => new Date(c.dataHora).getTime() >= agora)
            .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
        return futuras[0] ?? null;
    },

    futuras(list: ConsultaMp[]): ConsultaMp[] {
        const agora = Date.now();
        return list
            .filter((c) => ATIVAS.includes(c.status))
            .filter((c) => new Date(c.dataHora).getTime() >= agora)
            .sort((a, b) => a.dataHora.localeCompare(b.dataHora));
    },

    passadas(list: ConsultaMp[]): ConsultaMp[] {
        const agora = Date.now();
        return list
            .filter((c) => !ATIVAS.includes(c.status) || new Date(c.dataHora).getTime() < agora)
            .sort((a, b) => b.dataHora.localeCompare(a.dataHora));
    },
};
