import { supabase } from "@/lib/supabaseClient";
import { getMpScope } from "./mpScope";

export type CampanhaPaciente = {
    id: string;
    titulo: string;
    texto: string;
    mediaUrl?: string;
    link?: string;
    criadoEm: string;
};

function mapRow(row: Record<string, unknown>): CampanhaPaciente {
    return {
        id: String(row.id),
        titulo: String(row.titulo ?? ""),
        texto: String(row.texto ?? ""),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        link: row.link ? String(row.link) : undefined,
        criadoEm: String(row.created_at ?? ""),
    };
}

/** Campanhas ativas da clínica do paciente (banner no Início). RLS já filtra. */
export const campanhasService = {
    async listAtivas(): Promise<CampanhaPaciente[]> {
        const scope = await getMpScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("mp_campanhas")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .eq("ativo", true)
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data.map(mapRow);
    },
};
