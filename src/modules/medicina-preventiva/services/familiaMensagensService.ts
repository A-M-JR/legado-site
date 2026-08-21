import { supabase } from "@/lib/supabaseClient";
import { uploadImagem } from "@/lib/uploadImage";
import { v4 as uuidv4 } from "uuid";
import type { FamiliaMensagem } from "../types";
import { applyScope, getMpScope, scopePayload } from "./mpScope";
import { MP_MEMORIAS_FOLDER, MP_STORAGE_BUCKET } from "../lib/storage";

function mapRow(row: Record<string, unknown>): FamiliaMensagem {
    return {
        id: String(row.id),
        pessoaId: String(row.pessoa_id),
        mensagem: String(row.mensagem ?? ""),
        remetente: String(row.remetente ?? ""),
        anonimo: Boolean(row.anonimo),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        mediaTipo: row.media_tipo as FamiliaMensagem["mediaTipo"],
        criadoEm: String(row.criado_em),
    };
}

async function uploadMedia(file: File): Promise<{ url: string; tipo: "foto" | "video" } | null> {
    if (file.type.startsWith("video/")) {
        const ext = file.name.split(".").pop() || "mp4";
        const path = `${MP_MEMORIAS_FOLDER}/${uuidv4()}.${ext}`;
        const { error } = await supabase.storage.from(MP_STORAGE_BUCKET).upload(path, file, {
            cacheControl: "3600",
            contentType: file.type,
        });
        if (error) return null;
        const { data } = supabase.storage.from(MP_STORAGE_BUCKET).getPublicUrl(path);
        return data?.publicUrl ? { url: data.publicUrl, tipo: "video" } : null;
    }

    const url = await uploadImagem({
        file,
        folder: MP_MEMORIAS_FOLDER,
        bucket: MP_STORAGE_BUCKET,
    });
    return url ? { url, tipo: "foto" } : null;
}

/** Quem chega pelo link do convite não tem sessão: sobe no bucket público. */
async function uploadMediaPublica(
    file: File
): Promise<{ url: string; tipo: "foto" | "video" } | null> {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${MP_MEMORIAS_FOLDER}/public/${Date.now()}-${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from("recordacoes").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("recordacoes").getPublicUrl(path);
    if (!data?.publicUrl) return null;
    return {
        url: data.publicUrl,
        tipo: file.type.startsWith("video/") ? "video" : "foto",
    };
}

export const familiaMensagensService = {
    async list(pessoaId?: string): Promise<FamiliaMensagem[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_familia_mensagens")
            .select("*")
            .order("criado_em", { ascending: false });
        query = applyScope(query, scope);

        if (pessoaId) query = query.eq("pessoa_id", pessoaId);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async contarPorPessoa(): Promise<Record<string, number>> {
        const todas = await this.list();
        return todas.reduce<Record<string, number>>((acc, m) => {
            acc[m.pessoaId] = (acc[m.pessoaId] ?? 0) + 1;
            return acc;
        }, {});
    },

    async add(
        dados: { pessoaId: string; mensagem: string; remetente: string; anonimo: boolean },
        file?: File | null
    ): Promise<FamiliaMensagem[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let mediaUrl: string | null = null;
        let mediaTipo: "foto" | "video" | null = null;

        if (file) {
            const enviado = await uploadMedia(file);
            if (!enviado) throw new Error("Erro ao enviar a mídia.");
            mediaUrl = enviado.url;
            mediaTipo = enviado.tipo;
        }

        const { error } = await supabase.from("mp_familia_mensagens").insert({
            ...scopePayload(scope),
            pessoa_id: dados.pessoaId,
            mensagem: dados.mensagem,
            remetente: dados.remetente,
            anonimo: dados.anonimo,
            media_url: mediaUrl,
            media_tipo: mediaTipo,
        });
        if (error) throw new Error(error.message);

        return this.list(dados.pessoaId);
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
            const enviado = await uploadMediaPublica(file);
            if (!enviado) return false;
            mediaUrl = enviado.url;
            mediaTipo = enviado.tipo;
        }

        const { error } = await supabase.rpc("mp_enviar_mensagem_publica", {
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

    async remove(id: string, pessoaId?: string): Promise<FamiliaMensagem[]> {
        const { error } = await supabase.from("mp_familia_mensagens").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return this.list(pessoaId);
    },
};
