import { supabase } from "@/lib/supabaseClient";
import type { MpNotificacao, MpNotificacaoTipo } from "../types";
import { horaLabelAgora } from "../lib/datas";
import { applyScope, getMpScope, scopePayload } from "./mpScope";

function mapRow(row: Record<string, unknown>): MpNotificacao {
    return {
        id: String(row.id),
        titulo: String(row.titulo ?? ""),
        descricao: String(row.descricao ?? ""),
        horaLabel: String(row.hora_label ?? ""),
        tipo: row.tipo as MpNotificacaoTipo,
        lida: Boolean(row.lida),
        link: row.link ? String(row.link) : undefined,
    };
}

export const notificacoesService = {
    async list(): Promise<MpNotificacao[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_notificacoes")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(50);
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async create(input: {
        titulo: string;
        descricao?: string;
        tipo: MpNotificacaoTipo;
        link?: string;
    }): Promise<void> {
        const scope = await getMpScope();
        if (!scope) return;

        const { error } = await supabase.from("mp_notificacoes").insert({
            ...scopePayload(scope),
            titulo: input.titulo,
            descricao: input.descricao ?? "",
            hora_label: horaLabelAgora(),
            tipo: input.tipo,
            link: input.link ?? null,
            lida: false,
        });

        if (error) console.warn("mp_notificacoes create:", error.message);
    },

    async marcarLida(id: string): Promise<MpNotificacao[]> {
        await supabase.from("mp_notificacoes").update({ lida: true }).eq("id", id);
        return this.list();
    },

    async marcarTodasLidas(): Promise<MpNotificacao[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase.from("mp_notificacoes").select("id").eq("lida", false);
        query = applyScope(query, scope);
        const { data } = await query;

        if (data?.length) {
            await supabase
                .from("mp_notificacoes")
                .update({ lida: true })
                .in("id", data.map((r) => r.id));
        }

        return this.list();
    },
};
