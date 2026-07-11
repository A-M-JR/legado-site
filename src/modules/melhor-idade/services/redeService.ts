import { supabase } from "@/lib/supabaseClient";
import type { PessoaRede } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";
import { readStorage, writeStorage } from "./storage";
import { dedupeRede, normalizeRelacao, normalizePessoaRede } from "../lib/redeUtils";

const REDE_KEY = "rede";

function isDbUnavailable(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    const msg = error.message?.toLowerCase() ?? "";
    return (
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        msg.includes("mi_rede") ||
        msg.includes("mi_perfis") ||
        msg.includes("does not exist") ||
        msg.includes("could not find")
    );
}

function isUuid(id: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

function mapRow(row: Record<string, unknown>): PessoaRede {
    return normalizePessoaRede({
        id: String(row.id),
        nome: String(row.nome),
        relacao: String(row.relacao ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
    });
}

async function loadLegacyRede(): Promise<PessoaRede[]> {
    const scope = await getMiScope();
    if (!scope) return readStorage(REDE_KEY, []);

    let query = supabase.from("mi_perfis").select("rede");
    query = applyScope(query, scope);
    const { data } = await query.maybeSingle();

    const jsonRede = Array.isArray(data?.rede) ? dedupeRede(data.rede as PessoaRede[]) : [];
    if (jsonRede.length) return jsonRede;

    const localProfile = readStorage<{ rede?: PessoaRede[] }>("profile", { rede: [] });
    if (localProfile.rede?.length) return dedupeRede(localProfile.rede);

    return dedupeRede(readStorage(REDE_KEY, []));
}

export const redeService = {
    async list(): Promise<PessoaRede[]> {
        const scope = await getMiScope();
        if (!scope) {
            const stored = readStorage(REDE_KEY, [] as PessoaRede[]);
            if (stored.length > 0) return dedupeRede(stored);
            return dedupeRede(await loadLegacyRede());
        }

        let query = supabase.from("mi_rede").select("*").order("ordem", { ascending: true });
        query = applyScope(query, scope);
        const { data, error } = await query;

        if (!error && data && data.length > 0) {
            const rede = dedupeRede(data.map(mapRow));
            writeStorage(REDE_KEY, rede);
            const needsSync =
                rede.length !== data.length ||
                data.some((row) => normalizeRelacao(String(row.relacao ?? "")) !== String(row.relacao ?? "").trim());
            if (needsSync) {
                void this.sync(rede);
            }
            return rede;
        }

        if (error && !isDbUnavailable(error)) {
            console.warn("mi_rede list:", error.message);
        }

        const legacy = dedupeRede(await loadLegacyRede());

        if (legacy.length > 0 && !isDbUnavailable(error)) {
            return this.sync(legacy);
        }

        if (isDbUnavailable(error)) {
            const stored = readStorage(REDE_KEY, [] as PessoaRede[]);
            if (stored.length > 0) return dedupeRede(stored);
            return legacy;
        }

        return legacy;
    },

    async sync(rede: PessoaRede[]): Promise<PessoaRede[]> {
        const scope = await getMiScope();
        const validas = dedupeRede(rede.filter((p) => p.nome.trim()));

        if (!scope) {
            writeStorage(REDE_KEY, validas);
            return validas;
        }

        let existingQuery = supabase.from("mi_rede").select("id");
        existingQuery = applyScope(existingQuery, scope);
        const { data: existing, error: listError } = await existingQuery;

        if (isDbUnavailable(listError)) {
            writeStorage(REDE_KEY, validas);
            return validas;
        }

        if (existing?.length) {
            await supabase
                .from("mi_rede")
                .delete()
                .in(
                    "id",
                    existing.map((r) => r.id)
                );
        }

        if (!validas.length) {
            writeStorage(REDE_KEY, []);
            let perfilQuery = supabase.from("mi_perfis").select("id");
            perfilQuery = applyScope(perfilQuery, scope);
            const { data: perfil } = await perfilQuery.maybeSingle();
            if (perfil?.id) {
                await supabase
                    .from("mi_perfis")
                    .update({ rede: [], updated_at: new Date().toISOString() })
                    .eq("id", perfil.id);
            }
            return [];
        }

        const rows = validas.map((p, ordem) => {
            const norm = normalizePessoaRede(p);
            const row: Record<string, unknown> = {
                ...scopePayload(scope),
                nome: norm.nome,
                relacao: norm.relacao,
                foto_url: norm.fotoUrl ?? null,
                ordem,
            };
            if (isUuid(norm.id)) row.id = norm.id;
            return row;
        });

        const { data, error } = await supabase.from("mi_rede").insert(rows).select("*");

        if (error) {
            if (isDbUnavailable(error)) {
                writeStorage(REDE_KEY, validas);
                return validas;
            }
            throw new Error(error.message);
        }

        const saved = (data ?? []).map(mapRow);
        writeStorage(REDE_KEY, saved);

        let perfilQuery = supabase.from("mi_perfis").select("id");
        perfilQuery = applyScope(perfilQuery, scope);
        const { data: perfil } = await perfilQuery.maybeSingle();
        if (perfil?.id) {
            await supabase
                .from("mi_perfis")
                .update({ rede: saved, updated_at: new Date().toISOString() })
                .eq("id", perfil.id);
        }

        return saved;
    },
};
