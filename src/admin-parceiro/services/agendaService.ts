import { supabase } from "@/lib/supabaseClient";
import { mapConsulta } from "@/modules/medicina-preventiva/services/consultasService";
import type { ConsultaMp, ConsultaStatus, ConsultaTipo } from "@/modules/medicina-preventiva/types";
import { getParceiroScope, mapaNomesPacientes } from "./parceiroScope";

export type ConsultaInput = {
    titularId: string;
    authId?: string | null;
    unidadeId?: string | null;
    dataHora: string;
    profissional: string;
    especialidade: string;
    local: string;
    tipo: ConsultaTipo;
    observacoes: string;
    status?: ConsultaStatus;
};

export type FiltroAgenda = {
    titularId?: string;
    status?: ConsultaStatus | "todos";
    de?: string;
    ate?: string;
};

export const agendaParceiroService = {
    async list(filtro: FiltroAgenda = {}): Promise<ConsultaMp[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        let query = supabase
            .from("mp_consultas")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("data_hora", { ascending: true });

        if (filtro.titularId) query = query.eq("titular_id", filtro.titularId);
        if (filtro.status && filtro.status !== "todos") query = query.eq("status", filtro.status);
        if (filtro.de) query = query.gte("data_hora", filtro.de);
        if (filtro.ate) query = query.lte("data_hora", filtro.ate);

        const { data, error } = await query;
        if (error || !data) return [];

        const nomes = await mapaNomesPacientes(scope.parceiroId);
        return data.map((row) => {
            const consulta = mapConsulta(row);
            return { ...consulta, pacienteNome: nomes.get(consulta.titularId) ?? "" };
        });
    },

    async create(input: ConsultaInput): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_consultas").insert({
            titular_id: input.titularId,
            auth_id: input.authId ?? null,
            parceiro_id: scope.parceiroId,
            unidade_id: input.unidadeId ?? null,
            data_hora: input.dataHora,
            profissional: input.profissional,
            especialidade: input.especialidade,
            local: input.local,
            tipo: input.tipo,
            observacoes: input.observacoes,
            origem: "clinica",
            status: input.status ?? "agendada",
            criado_por: scope.authId,
        });

        if (error) throw new Error(error.message);
    },

    async update(id: string, input: Partial<ConsultaInput>): Promise<void> {
        const payload: Record<string, unknown> = {};
        if (input.dataHora !== undefined) payload.data_hora = input.dataHora;
        if (input.profissional !== undefined) payload.profissional = input.profissional;
        if (input.especialidade !== undefined) payload.especialidade = input.especialidade;
        if (input.local !== undefined) payload.local = input.local;
        if (input.tipo !== undefined) payload.tipo = input.tipo;
        if (input.observacoes !== undefined) payload.observacoes = input.observacoes;
        if (input.status !== undefined) payload.status = input.status;
        if (input.unidadeId !== undefined) payload.unidade_id = input.unidadeId ?? null;

        const { error } = await supabase.from("mp_consultas").update(payload).eq("id", id);
        if (error) throw new Error(error.message);
    },

    async setStatus(id: string, status: ConsultaStatus): Promise<void> {
        return this.update(id, { status });
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("mp_consultas").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },
};
