import { supabase } from "@/lib/supabaseClient";
import type { CuidadoPeriodo, CuidadoTarefa, CuidadoTipo } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";
import { notificacoesService } from "./notificacoesService";

function mapRow(row: Record<string, unknown>): CuidadoTarefa {
    return {
        id: String(row.id),
        hora: String(row.hora),
        titulo: String(row.titulo),
        desc: row.descricao ? String(row.descricao) : undefined,
        tipo: row.tipo as CuidadoTipo,
        feito: Boolean(row.feito),
        periodo: row.periodo as CuidadoPeriodo,
        responsavel: row.responsavel ? String(row.responsavel) : undefined,
    };
}

export const cuidadoService = {
    async list(): Promise<CuidadoTarefa[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_cuidados").select("*").order("hora", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async toggleFeito(id: string): Promise<CuidadoTarefa[]> {
        const current = (await this.list()).find((t) => t.id === id);
        if (!current) return this.list();

        const marcandoFeito = !current.feito;
        await supabase.from("mi_cuidados").update({ feito: marcandoFeito }).eq("id", id);

        if (marcandoFeito) {
            const quem = current.responsavel ? `${current.responsavel} concluiu` : "Concluído";
            await notificacoesService.create({
                titulo: "Cuidado concluído",
                descricao: `${quem}: ${current.titulo}${current.hora ? ` (${current.hora})` : ""}`,
                tipo: "cuidado",
                link: "/melhor-idade/minha-rotina",
            });
        }

        return this.list();
    },

    async add(data: {
        hora: string;
        titulo: string;
        desc?: string;
        tipo: CuidadoTipo;
        periodo: CuidadoPeriodo;
        responsavel?: string;
    }): Promise<CuidadoTarefa[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        await supabase.from("mi_cuidados").insert({
            ...scopePayload(scope),
            hora: data.hora,
            titulo: data.titulo,
            descricao: data.desc ?? null,
            tipo: data.tipo,
            periodo: data.periodo,
            responsavel: data.responsavel ?? null,
            feito: false,
        });

        return this.list();
    },

    groupByPeriodo(list: CuidadoTarefa[]): Record<CuidadoPeriodo, CuidadoTarefa[]> {
        const map: Record<CuidadoPeriodo, CuidadoTarefa[]> = {
            manha: [],
            tarde: [],
            noite: [],
        };
        list.forEach((it) => map[it.periodo].push(it));
        (Object.keys(map) as CuidadoPeriodo[]).forEach((k) =>
            map[k].sort((a, b) => (a.hora < b.hora ? -1 : 1))
        );
        return map;
    },
};
