import { supabase } from "@/lib/supabaseClient";
import type { Momento } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";

function mapRow(row: Record<string, unknown>): Momento {
    return {
        id: String(row.id),
        tipo: row.tipo as Momento["tipo"],
        url: String(row.url),
        favorito: Boolean(row.favorito),
        criadoEm: String(row.criado_em).slice(0, 10),
    };
}

export const momentosService = {
    async list(): Promise<Momento[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase.from("mi_momentos").select("*").order("criado_em", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async listByFiltro(filtro: "fotos" | "videos" | "favoritos"): Promise<Momento[]> {
        const all = await this.list();
        if (filtro === "favoritos") return all.filter((m) => m.favorito);
        if (filtro === "videos") return all.filter((m) => m.tipo === "video");
        return all.filter((m) => m.tipo === "foto");
    },

    async toggleFavorito(id: string): Promise<Momento[]> {
        const current = (await this.list()).find((m) => m.id === id);
        if (!current) return this.list();

        await supabase.from("mi_momentos").update({ favorito: !current.favorito }).eq("id", id);
        return this.list();
    },

    async add(data: { tipo: "foto" | "video"; url: string }): Promise<Momento[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        await supabase.from("mi_momentos").insert({
            ...scopePayload(scope),
            tipo: data.tipo,
            url: data.url,
            favorito: false,
        });

        return this.list();
    },
};
