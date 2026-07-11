import { supabase } from "@/lib/supabaseClient";
import type { Notificacao, NotificacaoTipo } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";

function horaLabelAgora(): string {
    const agora = new Date();
    const hora = agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `Hoje — ${hora}`;
}

function mapRow(row: Record<string, unknown>): Notificacao {
    return {
        id: String(row.id),
        titulo: String(row.titulo),
        descricao: String(row.descricao ?? ""),
        horaLabel: String(row.hora_label ?? ""),
        tipo: row.tipo as Notificacao["tipo"],
        lida: Boolean(row.lida),
        link: row.link ? String(row.link) : undefined,
    };
}

export const notificacoesService = {
    async list(): Promise<Notificacao[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase
            .from("mi_notificacoes")
            .select("*")
            .order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async create(input: {
        titulo: string;
        descricao?: string;
        tipo: NotificacaoTipo;
        link?: string;
        horaLabel?: string;
    }): Promise<void> {
        const scope = await getMiScope();
        if (!scope) return;

        const { error } = await supabase.from("mi_notificacoes").insert({
            ...scopePayload(scope),
            titulo: input.titulo,
            descricao: input.descricao ?? "",
            hora_label: input.horaLabel ?? horaLabelAgora(),
            tipo: input.tipo,
            link: input.link ?? null,
            lida: false,
        });

        if (error) console.warn("mi_notificacoes create:", error.message);
    },

    async countNaoLidas(): Promise<number> {
        const all = await this.list();
        return all.filter((n) => !n.lida).length;
    },

    async marcarLida(id: string): Promise<Notificacao[]> {
        await supabase.from("mi_notificacoes").update({ lida: true }).eq("id", id);
        return this.list();
    },

    async marcarTodasLidas(): Promise<Notificacao[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_notificacoes").select("id");
        query = applyScope(query, scope);
        const { data } = await query;

        if (data?.length) {
            const ids = data.map((r) => r.id);
            await supabase.from("mi_notificacoes").update({ lida: true }).in("id", ids);
        }

        return this.list();
    },
};
