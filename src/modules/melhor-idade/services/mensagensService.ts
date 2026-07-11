import { supabase } from "@/lib/supabaseClient";
import type { Mensagem, MensagemTipo } from "../types";
import { applyScope, getMiScope } from "./miScope";

function mapRow(row: Record<string, unknown>): Mensagem {
    return {
        id: String(row.id),
        tipo: row.tipo as MensagemTipo,
        remetente: String(row.remetente),
        relacao: String(row.relacao ?? ""),
        horaLabel: String(row.hora_label ?? ""),
        conteudo: row.conteudo ? String(row.conteudo) : undefined,
        duracao: row.duracao ? String(row.duracao) : undefined,
        thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : undefined,
        audioUrl: row.audio_url ? String(row.audio_url) : undefined,
        lida: Boolean(row.lida),
    };
}

export const mensagensService = {
    async list(): Promise<Mensagem[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_mensagens").select("*").order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async listByTipo(tipo?: MensagemTipo | "todas"): Promise<Mensagem[]> {
        const all = await this.list();
        if (!tipo || tipo === "todas") return all;
        return all.filter((m) => m.tipo === tipo);
    },

    async countNaoLidas(): Promise<number> {
        const all = await this.list();
        return all.filter((m) => !m.lida).length;
    },

    async marcarLida(id: string): Promise<Mensagem[]> {
        await supabase.from("mi_mensagens").update({ lida: true }).eq("id", id);
        return this.list();
    },
};
