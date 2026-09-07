import { supabase } from "@/lib/supabaseClient";
import type { ConsultaMp, ConsultaStatus, ConsultaTipo } from "../types";
import { applyScope, getMpScope, scopePayload } from "./mpScope";

export type ConsultaPacienteInput = {
    dataHora: string;
    profissional: string;
    especialidade: string;
    local: string;
    tipo: ConsultaTipo;
    observacoes: string;
    status?: ConsultaStatus;
};

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

/**
 * Consultas do paciente. Além de listar, o paciente também pode agendar as
 * próprias consultas (origem='paciente'); a clínica vê tudo na agenda.
 */
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

    async add(input: ConsultaPacienteInput): Promise<ConsultaMp[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        const { error } = await supabase.from("mp_consultas").insert({
            ...scopePayload(scope),
            parceiro_id: scope.parceiroId,
            data_hora: input.dataHora,
            profissional: input.profissional,
            especialidade: input.especialidade,
            local: input.local,
            tipo: input.tipo,
            observacoes: input.observacoes,
            origem: "paciente",
            status: input.status ?? "agendada",
            criado_por: scope.authId,
        });
        if (error) throw new Error(error.message);

        return this.list();
    },

    async update(id: string, input: Partial<ConsultaPacienteInput>): Promise<ConsultaMp[]> {
        const payload: Record<string, unknown> = {};
        if (input.dataHora !== undefined) payload.data_hora = input.dataHora;
        if (input.profissional !== undefined) payload.profissional = input.profissional;
        if (input.especialidade !== undefined) payload.especialidade = input.especialidade;
        if (input.local !== undefined) payload.local = input.local;
        if (input.tipo !== undefined) payload.tipo = input.tipo;
        if (input.observacoes !== undefined) payload.observacoes = input.observacoes;
        if (input.status !== undefined) payload.status = input.status;

        const { error } = await supabase.from("mp_consultas").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.list();
    },

    async remove(id: string): Promise<ConsultaMp[]> {
        const { error } = await supabase.from("mp_consultas").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return this.list();
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
