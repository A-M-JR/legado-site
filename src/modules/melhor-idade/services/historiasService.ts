import { supabase } from "@/lib/supabaseClient";
import { uploadImagem } from "@/lib/uploadImage";
import { v4 as uuidv4 } from "uuid";
import type { HistoriaEntrada } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";
import { MI_HISTORIAS_FOLDER, MI_STORAGE_BUCKET } from "../lib/storage";

function mapRow(row: Record<string, unknown>): HistoriaEntrada {
    return {
        id: String(row.id),
        titulo: String(row.titulo),
        conteudo: String(row.conteudo ?? ""),
        privado: Boolean(row.privado),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        mediaTipo: row.media_tipo as HistoriaEntrada["mediaTipo"],
        criadoEm: String(row.criado_em),
    };
}

async function uploadMedia(file: File): Promise<{ url: string; tipo: "foto" | "video" } | null> {
    if (file.type.startsWith("video/")) {
        const ext = file.name.split(".").pop() || "mp4";
        const path = `${MI_HISTORIAS_FOLDER}/${uuidv4()}.${ext}`;
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
        folder: MI_HISTORIAS_FOLDER,
        bucket: MI_STORAGE_BUCKET,
    });
    return url ? { url, tipo: "foto" } : null;
}

export const historiasService = {
    async list(): Promise<HistoriaEntrada[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_historias").select("*").order("criado_em", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(
        data: Omit<HistoriaEntrada, "id" | "criadoEm">,
        file?: File | null
    ): Promise<HistoriaEntrada[]> {
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

        await supabase.from("mi_historias").insert({
            ...scopePayload(scope),
            titulo: data.titulo,
            conteudo: data.conteudo,
            privado: data.privado,
            media_url: mediaUrl ?? null,
            media_tipo: mediaTipo ?? null,
        });

        return this.list();
    },

    async update(
        id: string,
        data: Partial<Omit<HistoriaEntrada, "id" | "criadoEm">>,
        file?: File | null
    ): Promise<HistoriaEntrada[]> {
        const payload: Record<string, unknown> = {};
        if (data.titulo !== undefined) payload.titulo = data.titulo;
        if (data.conteudo !== undefined) payload.conteudo = data.conteudo;
        if (data.privado !== undefined) payload.privado = data.privado;

        if (file) {
            const uploaded = await uploadMedia(file);
            if (!uploaded) throw new Error("Erro ao enviar mídia.");
            payload.media_url = uploaded.url;
            payload.media_tipo = uploaded.tipo;
        } else if (data.mediaUrl !== undefined) {
            payload.media_url = data.mediaUrl;
            payload.media_tipo = data.mediaTipo ?? null;
        }

        await supabase.from("mi_historias").update(payload).eq("id", id);
        return this.list();
    },

    async remove(id: string): Promise<HistoriaEntrada[]> {
        await supabase.from("mi_historias").delete().eq("id", id);
        return this.list();
    },
};
