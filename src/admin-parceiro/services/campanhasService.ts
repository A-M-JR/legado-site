import { supabase } from "@/lib/supabaseClient";
import { getParceiroScope } from "./parceiroScope";

export type Campanha = {
    id: string;
    titulo: string;
    texto: string;
    mediaUrl?: string;
    mediaTipo?: "foto" | "video" | "pdf";
    link?: string;
    ativo: boolean;
    criadoEm: string;
};

export type CampanhaInput = {
    titulo: string;
    texto: string;
    mediaUrl?: string | null;
    mediaTipo?: "foto" | "video" | "pdf" | null;
    link?: string | null;
    ativo?: boolean;
};

export type PacienteWhatsapp = {
    titularId: string;
    nome: string;
    telefone: string;
};

function mapRow(row: Record<string, unknown>): Campanha {
    return {
        id: String(row.id),
        titulo: String(row.titulo ?? ""),
        texto: String(row.texto ?? ""),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        mediaTipo: (row.media_tipo as Campanha["mediaTipo"]) ?? undefined,
        link: row.link ? String(row.link) : undefined,
        ativo: row.ativo !== false,
        criadoEm: String(row.created_at ?? ""),
    };
}

export const campanhasService = {
    async list(): Promise<Campanha[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("mp_campanhas")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data.map(mapRow);
    },

    async create(input: CampanhaInput): Promise<Campanha> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { data, error } = await supabase
            .from("mp_campanhas")
            .insert({
                parceiro_id: scope.parceiroId,
                titulo: input.titulo,
                texto: input.texto,
                media_url: input.mediaUrl ?? null,
                media_tipo: input.mediaTipo ?? null,
                link: input.link ?? null,
                ativo: input.ativo ?? true,
                criado_por: scope.authId,
            })
            .select("*")
            .single();

        if (error || !data) throw new Error(error?.message ?? "Erro ao criar campanha.");
        return mapRow(data);
    },

    async setAtivo(id: string, ativo: boolean): Promise<void> {
        const { error } = await supabase.from("mp_campanhas").update({ ativo }).eq("id", id);
        if (error) throw new Error(error.message);
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("mp_campanhas").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },

    /** Dispara a campanha para a carteira nos canais escolhidos. Retorna nº de pacientes. */
    async disparar(id: string, canais: string[]): Promise<number> {
        const { data, error } = await supabase.rpc("mp_disparar_campanha", {
            p_campanha_id: id,
            p_canais: canais,
        });
        if (error) throw new Error(error.message);
        return Number(data ?? 0);
    },

    /** Pacientes com telefone, para montar os links de WhatsApp. */
    async pacientesComTelefone(): Promise<PacienteWhatsapp[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data: vinculos } = await supabase
            .from("usuarios_app")
            .select("titular_id")
            .eq("parceiro_id", scope.parceiroId)
            .eq("role", "titular");

        const ids = (vinculos ?? []).map((v) => v.titular_id).filter(Boolean) as string[];
        if (!ids.length) return [];

        const { data: titulares } = await supabase
            .from("titulares")
            .select("id, nome, telefone")
            .in("id", ids)
            .order("nome");

        return (titulares ?? [])
            .map((t) => ({
                titularId: String(t.id),
                nome: String(t.nome ?? ""),
                telefone: String(t.telefone ?? ""),
            }))
            .filter((p) => p.telefone.replace(/\D/g, "").length >= 10);
    },
};
