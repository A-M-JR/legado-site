import { supabase } from "@/lib/supabaseClient";
import type { ConsultaMedica, ReceitaMedica } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";
import { notificacoesService } from "./notificacoesService";
import { formatarDiaConsulta } from "../lib/consultaDates";

function isMissingExtraColumn(error: { message?: string } | null): boolean {
    if (!error?.message) return false;
    const msg = error.message.toLowerCase();
    return (
        (msg.includes("observacoes") || msg.includes("ativa")) &&
        (msg.includes("schema cache") || msg.includes("could not find"))
    );
}

function stripExtraCols(payload: Record<string, unknown>): Record<string, unknown> {
    const { ativa: _a, observacoes: _o, ...rest } = payload;
    return rest;
}

function hadExtraCols(payload: Record<string, unknown>): boolean {
    return "ativa" in payload || "observacoes" in payload;
}

function mapReceita(row: Record<string, unknown>): ReceitaMedica {
    return {
        id: String(row.id),
        medicamento: String(row.medicamento),
        dosagem: String(row.dosagem ?? ""),
        frequencia: String(row.frequencia ?? ""),
        inicio: row.inicio ? String(row.inicio) : "",
        validade: row.validade ? String(row.validade) : "",
        medico: String(row.medico ?? ""),
        especialidade: String(row.especialidade ?? ""),
        data_consulta: String(row.data_consulta ?? ""),
        foto_url: row.foto_url ? String(row.foto_url) : undefined,
        ativa: row.ativa !== undefined ? Boolean(row.ativa) : true,
        observacoes: row.observacoes ? String(row.observacoes) : "",
    };
}

function mapConsulta(row: Record<string, unknown>): ConsultaMedica {
    return {
        id: String(row.id),
        data: String(row.data),
        medico: String(row.medico),
        local: row.local ? String(row.local) : undefined,
        tipo: row.tipo ? String(row.tipo) : undefined,
    };
}

export function fmtDataBR(d: string): string {
    if (!d) return "";
    if (d.includes("/")) return d;
    try {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(d));
    } catch {
        return d;
    }
}

export const receitasService = {
    async listReceitas(): Promise<ReceitaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_receitas").select("*").order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapReceita);
    },

    async listConsultas(): Promise<ConsultaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_consultas").select("*").order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapConsulta);
    },

    async addReceita(data: Omit<ReceitaMedica, "id">): Promise<ReceitaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const basePayload = {
            ...scopePayload(scope),
            medicamento: data.medicamento,
            dosagem: data.dosagem,
            frequencia: data.frequencia,
            inicio: data.inicio || null,
            validade: data.validade || null,
            medico: data.medico,
            especialidade: data.especialidade,
            data_consulta: data.data_consulta,
            foto_url: data.foto_url ?? null,
            ativa: data.ativa ?? true,
            observacoes: data.observacoes ?? "",
        };

        let { error } = await supabase.from("mi_receitas").insert(basePayload);
        if (error && isMissingExtraColumn(error)) {
            ({ error } = await supabase.from("mi_receitas").insert(stripExtraCols(basePayload)));
            if (!error) {
                throw new Error(
                    "Rode no Supabase: supabase/migrations/004_mi_receitas_campos.sql (observações e inativar)."
                );
            }
        }
        if (error) throw new Error(error.message);

        return this.listReceitas();
    },

    async updateReceita(
        id: string,
        data: Partial<Omit<ReceitaMedica, "id">>
    ): Promise<ReceitaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const payload: Record<string, unknown> = {};
        if (data.medicamento !== undefined) payload.medicamento = data.medicamento;
        if (data.dosagem !== undefined) payload.dosagem = data.dosagem;
        if (data.frequencia !== undefined) payload.frequencia = data.frequencia;
        if (data.inicio !== undefined) payload.inicio = data.inicio || null;
        if (data.validade !== undefined) payload.validade = data.validade || null;
        if (data.medico !== undefined) payload.medico = data.medico;
        if (data.especialidade !== undefined) payload.especialidade = data.especialidade;
        if (data.data_consulta !== undefined) payload.data_consulta = data.data_consulta;
        if (data.foto_url !== undefined) payload.foto_url = data.foto_url ?? null;
        if (data.ativa !== undefined) payload.ativa = data.ativa;
        if (data.observacoes !== undefined) payload.observacoes = data.observacoes;

        let { error } = await supabase.from("mi_receitas").update(payload).eq("id", id);

        if (error && isMissingExtraColumn(error)) {
            const extra = hadExtraCols(payload);
            const stripped = stripExtraCols(payload);
            if (Object.keys(stripped).length === 0) {
                throw new Error(
                    "Rode no Supabase: supabase/migrations/004_mi_receitas_campos.sql (observações e inativar)."
                );
            }
            ({ error } = await supabase.from("mi_receitas").update(stripped).eq("id", id));
            if (!error && extra) {
                throw new Error(
                    "Rode no Supabase: supabase/migrations/004_mi_receitas_campos.sql (observações e inativar)."
                );
            }
        }

        if (error) throw new Error(error.message);

        return this.listReceitas();
    },

    async setAtiva(id: string, ativa: boolean): Promise<ReceitaMedica[]> {
        return this.updateReceita(id, { ativa });
    },

    async addConsulta(data: Omit<ConsultaMedica, "id">): Promise<ConsultaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const { error } = await supabase.from("mi_consultas").insert({
            ...scopePayload(scope),
            data: data.data,
            medico: data.medico,
            local: data.local ?? null,
            tipo: data.tipo ?? null,
        });
        if (error) throw new Error(error.message);

        const quando = data.data ? formatarDiaConsulta(data.data) : "";
        await notificacoesService.create({
            titulo: "Nova consulta agendada",
            descricao: [data.medico, data.local, quando].filter(Boolean).join(" · "),
            tipo: "consulta",
            link: "/melhor-idade/meu-cuidado",
        });

        return this.listConsultas();
    },

    async updateConsulta(
        id: string,
        data: Partial<Omit<ConsultaMedica, "id">>
    ): Promise<ConsultaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const payload: Record<string, unknown> = {};
        if (data.data !== undefined) payload.data = data.data;
        if (data.medico !== undefined) payload.medico = data.medico;
        if (data.local !== undefined) payload.local = data.local ?? null;
        if (data.tipo !== undefined) payload.tipo = data.tipo ?? null;

        const { error } = await supabase.from("mi_consultas").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.listConsultas();
    },

    async deleteConsulta(id: string): Promise<ConsultaMedica[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const { error } = await supabase.from("mi_consultas").delete().eq("id", id);
        if (error) throw new Error(error.message);

        return this.listConsultas();
    },
};
