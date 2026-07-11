import { supabase } from "@/lib/supabaseClient";
import { uploadImagem } from "@/lib/uploadImage";
import { v4 as uuidv4 } from "uuid";
import type { FamiliaMemoria } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";
import { MI_MEMORIAS_FOLDER, MI_STORAGE_BUCKET } from "../lib/storage";

function mapRow(row: Record<string, unknown>): FamiliaMemoria {
    return {
        id: String(row.id),
        pessoaId: String(row.pessoa_id),
        mensagem: String(row.mensagem),
        remetente: String(row.remetente),
        anonimo: Boolean(row.anonimo),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        mediaTipo: row.media_tipo as FamiliaMemoria["mediaTipo"],
        criadoEm: String(row.criado_em),
    };
}

async function uploadMedia(file: File): Promise<{ url: string; tipo: "foto" | "video" } | null> {
    if (file.type.startsWith("video/")) {
        const ext = file.name.split(".").pop() || "mp4";
        const path = `${MI_MEMORIAS_FOLDER}/${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from(MI_STORAGE_BUCKET).upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
        });
        if (error) return null;
        const { data } = supabase.storage.from(MI_STORAGE_BUCKET).getPublicUrl(path);
        return data?.publicUrl ? { url: data.publicUrl, tipo: "video" } : null;
    }

    const url = await uploadImagem({
        file,
        folder: MI_MEMORIAS_FOLDER,
        bucket: MI_STORAGE_BUCKET,
    });
    return url ? { url, tipo: "foto" } : null;
}

async function uploadMediaPublica(file: File): Promise<{ url: string; tipo: "foto" | "video" } | null> {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${MI_MEMORIAS_FOLDER}/public/${Date.now()}-${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from("recordacoes").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("recordacoes").getPublicUrl(path);
    if (!data?.publicUrl) return null;
    return {
        url: data.publicUrl,
        tipo: file.type.startsWith("video/") ? "video" : "foto",
    };
}

export const familiaMemoriasService = {
    async list(pessoaId?: string): Promise<FamiliaMemoria[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase
            .from("mi_familia_memorias")
            .select("*")
            .order("criado_em", { ascending: false });
        query = applyScope(query, scope);

        if (pessoaId) query = query.eq("pessoa_id", pessoaId);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(
        data: Omit<FamiliaMemoria, "id" | "criadoEm">,
        file?: File | null
    ): Promise<FamiliaMemoria[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let mediaUrl = data.mediaUrl;
        let mediaTipo = data.mediaTipo;

        if (file) {
            const uploaded = await uploadMedia(file);
            if (!uploaded) throw new Error("Erro ao enviar mídia.");
            mediaUrl = uploaded.url;
            mediaTipo = uploaded.tipo;
        }

        await supabase.from("mi_familia_memorias").insert({
            ...scopePayload(scope),
            pessoa_id: data.pessoaId,
            mensagem: data.mensagem,
            remetente: data.remetente,
            anonimo: data.anonimo,
            media_url: mediaUrl ?? null,
            media_tipo: mediaTipo ?? null,
        });

        return this.list(data.pessoaId);
    },

    async enviarPublica({
        titularId,
        pessoaId,
        mensagem,
        remetente,
        anonimo,
        file,
    }: {
        titularId: string;
        pessoaId: string;
        mensagem: string;
        remetente: string;
        anonimo: boolean;
        file?: File | null;
    }): Promise<boolean> {
        let mediaUrl: string | null = null;
        let mediaTipo: "foto" | "video" | null = null;

        if (file) {
            const uploaded = await uploadMediaPublica(file);
            if (!uploaded) return false;
            mediaUrl = uploaded.url;
            mediaTipo = uploaded.tipo;
        }

        const { error } = await supabase.rpc("mi_enviar_memoria_publica", {
            p_titular_id: titularId,
            p_pessoa_id: pessoaId,
            p_mensagem: mensagem,
            p_remetente: remetente,
            p_anonimo: anonimo,
            p_media_url: mediaUrl,
            p_media_tipo: mediaTipo,
        });

        return !error;
    },

    async remove(id: string, pessoaId?: string): Promise<FamiliaMemoria[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        const { data: row } = await supabase
            .from("mi_familia_memorias")
            .select("pessoa_id")
            .eq("id", id)
            .maybeSingle();

        await supabase.from("mi_familia_memorias").delete().eq("id", id);
        return this.list(row?.pessoa_id ?? pessoaId);
    },
};
