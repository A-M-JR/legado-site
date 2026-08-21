import { supabase } from "@/lib/supabaseClient";
import type { PessoaRede } from "../types";
import { applyScope, getMpScope, scopePayload } from "./mpScope";

function mapRow(row: Record<string, unknown>): PessoaRede {
    return {
        id: String(row.id),
        nome: String(row.nome ?? ""),
        relacao: String(row.relacao ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
        ordem: Number(row.ordem ?? 0),
    };
}

export const redeService = {
    async list(): Promise<PessoaRede[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase.from("mp_rede").select("*").order("ordem", { ascending: true });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(pessoa: { nome: string; relacao: string; fotoUrl?: string }): Promise<PessoaRede[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        const atuais = await this.list();

        const { error } = await supabase.from("mp_rede").insert({
            ...scopePayload(scope),
            nome: pessoa.nome,
            relacao: pessoa.relacao,
            foto_url: pessoa.fotoUrl ?? null,
            ordem: atuais.length,
        });
        if (error) throw new Error(error.message);

        return this.list();
    },

    async update(
        id: string,
        pessoa: Partial<Pick<PessoaRede, "nome" | "relacao" | "fotoUrl" | "ordem">>
    ): Promise<PessoaRede[]> {
        const payload: Record<string, unknown> = {};
        if (pessoa.nome !== undefined) payload.nome = pessoa.nome;
        if (pessoa.relacao !== undefined) payload.relacao = pessoa.relacao;
        if (pessoa.fotoUrl !== undefined) payload.foto_url = pessoa.fotoUrl ?? null;
        if (pessoa.ordem !== undefined) payload.ordem = pessoa.ordem;

        const { error } = await supabase.from("mp_rede").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.list();
    },

    async remove(id: string): Promise<PessoaRede[]> {
        const { error } = await supabase.from("mp_rede").delete().eq("id", id);
        if (error) throw new Error(error.message);

        // As mensagens da pessoa deixam de fazer sentido sem ela.
        await supabase.from("mp_familia_mensagens").delete().eq("pessoa_id", id);

        return this.list();
    },
};
