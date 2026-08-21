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

    /**
     * Sincroniza a rede de forma diferencial: atualiza quem já existe, insere
     * quem é novo e apaga só quem saiu da lista.
     *
     * A versão anterior apagava tudo e reinseria com os MESMOS ids — se o delete
     * falhasse (linha legada sem titular_id, RLS), o insert seguinte batia em
     * chave duplicada e derrubava adicionar, editar e remover de uma vez.
     */
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
        if (listError) throw new Error(listError.message);

        const idsExistentes = new Set((existing ?? []).map((r) => String(r.id)));
        const idsMantidos = new Set<string>();

        for (const [ordem, pessoa] of validas.entries()) {
            const norm = normalizePessoaRede(pessoa);
            const dados: Record<string, unknown> = {
                nome: norm.nome,
                relacao: norm.relacao,
                foto_url: norm.fotoUrl ?? null,
                ordem,
            };

            if (isUuid(norm.id) && idsExistentes.has(norm.id)) {
                // Cura linhas antigas que ficaram sem titular_id.
                if (scope.titularId) dados.titular_id = scope.titularId;

                const { error } = await supabase.from("mi_rede").update(dados).eq("id", norm.id);

                if (error) {
                    if (isDbUnavailable(error)) {
                        writeStorage(REDE_KEY, validas);
                        return validas;
                    }
                    throw new Error(error.message);
                }

                idsMantidos.add(norm.id);
                continue;
            }

            const { data: criada, error } = await supabase
                .from("mi_rede")
                .insert({ ...scopePayload(scope), ...dados })
                .select("id")
                .single();

            if (error) {
                if (isDbUnavailable(error)) {
                    writeStorage(REDE_KEY, validas);
                    return validas;
                }
                throw new Error(error.message);
            }

            if (criada?.id) idsMantidos.add(String(criada.id));
        }

        const idsRemovidos = [...idsExistentes].filter((id) => !idsMantidos.has(id));

        if (idsRemovidos.length) {
            const { error } = await supabase.from("mi_rede").delete().in("id", idsRemovidos);
            if (error && !isDbUnavailable(error)) {
                throw new Error("Não foi possível remover: " + error.message);
            }
        }

        const saved = await this.list();

        // Delete sem erro mas sem efeito (RLS) faria a pessoa reaparecer calada.
        const sobrou = saved.find((p) => idsRemovidos.includes(p.id));
        if (sobrou) {
            throw new Error(
                `Sem permissão para remover ${sobrou.nome}. Entre com a conta do titular e tente de novo.`
            );
        }

        writeStorage(REDE_KEY, saved);

        // Espelho legado em mi_perfis.rede (telas antigas ainda leem daí).
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
