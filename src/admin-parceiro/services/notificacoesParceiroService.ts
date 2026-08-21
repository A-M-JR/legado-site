import { supabase } from "@/lib/supabaseClient";
import { getParceiroScope } from "./parceiroScope";

export type ParceiroNotificacao = {
    id: string;
    tipo: "sintoma" | "consulta" | "exame" | "sistema";
    titulo: string;
    descricao: string;
    link?: string;
    lida: boolean;
    criadoEm: string;
};

function mapRow(row: Record<string, unknown>): ParceiroNotificacao {
    return {
        id: String(row.id),
        tipo: (row.tipo as ParceiroNotificacao["tipo"]) ?? "sistema",
        titulo: String(row.titulo ?? ""),
        descricao: String(row.descricao ?? ""),
        link: row.link ? String(row.link) : undefined,
        lida: Boolean(row.lida),
        criadoEm: String(row.created_at ?? ""),
    };
}

export const notificacoesParceiroService = {
    async list(): Promise<ParceiroNotificacao[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("parceiro_notificacoes")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("created_at", { ascending: false })
            .limit(50);

        if (error || !data) return [];
        return data.map(mapRow);
    },

    async marcarLida(id: string): Promise<void> {
        await supabase.from("parceiro_notificacoes").update({ lida: true }).eq("id", id);
    },

    async marcarTodasLidas(): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return;

        await supabase
            .from("parceiro_notificacoes")
            .update({ lida: true })
            .eq("parceiro_id", scope.parceiroId)
            .eq("lida", false);
    },
};
