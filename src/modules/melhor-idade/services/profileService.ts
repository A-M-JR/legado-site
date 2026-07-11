import { supabase } from "@/lib/supabaseClient";
import type { HumorTipo, MiProfile, PessoaRede } from "../types";
import { applyScope, getMiScope, getTitularConta, scopePayload } from "./miScope";
import { redeService } from "./redeService";
import { dedupeRede } from "../lib/redeUtils";
import { readStorage, writeStorage } from "./storage";

const PROFILE_KEY = "profile";

const DEFAULT_PROFILE: MiProfile = {
    onboardingComplete: false,
    nome: "",
    rede: [],
};

function isDbUnavailable(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    const msg = error.message?.toLowerCase() ?? "";
    return (
        error.code === "PGRST205" ||
        error.code === "42P01" ||
        msg.includes("mi_perfis") ||
        msg.includes("does not exist") ||
        msg.includes("could not find")
    );
}

function mapRow(row: Record<string, unknown>): MiProfile {
    return {
        onboardingComplete: Boolean(row.onboarding_complete),
        nome: String(row.nome ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
        rede: Array.isArray(row.rede) ? dedupeRede(row.rede as PessoaRede[]) : [],
        humorAtual: row.humor_atual as HumorTipo | undefined,
        humorAtualizadoEm: row.humor_atualizado_em
            ? String(row.humor_atualizado_em)
            : undefined,
    };
}

function getLocal(): MiProfile {
    return readStorage(PROFILE_KEY, DEFAULT_PROFILE);
}

function saveLocal(profile: MiProfile): MiProfile {
    writeStorage(PROFILE_KEY, profile);
    if (profile.rede) writeStorage("rede", profile.rede);
    return profile;
}

async function enrichWithTitularFoto(profile: MiProfile): Promise<MiProfile> {
    if (profile.fotoUrl) return profile;

    const conta = await getTitularConta();
    let fotoUrl = conta?.fotoUrl;

    if (!fotoUrl) {
        const scope = await getMiScope();
        if (scope?.titularId) {
            const { data: dep } = await supabase
                .from("dependentes")
                .select("imagem_url")
                .eq("id_titular", scope.titularId)
                .not("imagem_url", "is", null)
                .order("created_at", { ascending: true })
                .limit(1)
                .maybeSingle();
            if (dep?.imagem_url) fotoUrl = String(dep.imagem_url);
        }
    }

    if (!fotoUrl) return profile;

    const enriched = { ...profile, fotoUrl };

    if (!profile.onboardingComplete) return enriched;

    const scope = await getMiScope();
    if (!scope) return saveLocal(enriched);

    let existingQuery = supabase.from("mi_perfis").select("id");
    existingQuery = applyScope(existingQuery, scope);
    const { data: existing, error } = await existingQuery.maybeSingle();

    if (isDbUnavailable(error) || !existing?.id) {
        return saveLocal(enriched);
    }

    await supabase
        .from("mi_perfis")
        .update({ foto_url: fotoUrl, updated_at: new Date().toISOString() })
        .eq("id", existing.id);

    return enriched;
}

async function attachRede(profile: MiProfile): Promise<MiProfile> {
    const rede = await redeService.list();
    return { ...profile, rede };
}

export const profileService = {
    async get(): Promise<MiProfile> {
        const scope = await getMiScope();
        if (!scope) return attachRede(await enrichWithTitularFoto(getLocal()));

        let query = supabase.from("mi_perfis").select("*");
        query = applyScope(query, scope);

        const { data, error } = await query.maybeSingle();
        if (!error && data) return attachRede(await enrichWithTitularFoto(mapRow(data)));
        if (isDbUnavailable(error)) return attachRede(await enrichWithTitularFoto(getLocal()));
        return attachRede(await enrichWithTitularFoto(getLocal()));
    },

    async completeOnboarding(data: {
        nome: string;
        rede: PessoaRede[];
        humor: HumorTipo;
        fotoUrl?: string;
    }): Promise<MiProfile> {
        const profile: MiProfile = {
            onboardingComplete: true,
            nome: data.nome,
            fotoUrl: data.fotoUrl,
            rede: data.rede,
            humorAtual: data.humor,
            humorAtualizadoEm: new Date().toISOString(),
        };

        const scope = await getMiScope();
        if (!scope) {
            const synced = await redeService.sync(data.rede);
            return saveLocal({ ...profile, rede: synced });
        }

        const payload = {
            ...scopePayload(scope),
            onboarding_complete: true,
            nome: data.nome,
            foto_url: data.fotoUrl ?? null,
            rede: data.rede,
            humor_atual: data.humor,
            humor_atualizado_em: profile.humorAtualizadoEm,
            updated_at: new Date().toISOString(),
        };

        let existingQuery = supabase.from("mi_perfis").select("id");
        existingQuery = applyScope(existingQuery, scope);
        const { data: existing, error: existingError } = await existingQuery.maybeSingle();

        if (isDbUnavailable(existingError)) {
            const synced = await redeService.sync(data.rede);
            return saveLocal({ ...profile, rede: synced });
        }

        if (existing?.id) {
            const { data: updated, error } = await supabase
                .from("mi_perfis")
                .update(payload)
                .eq("id", existing.id)
                .select("*")
                .single();
            if (!error && updated) {
                const saved = mapRow(updated);
                saved.rede = await redeService.sync(data.rede);
                return saved;
            }
            if (isDbUnavailable(error)) {
                const synced = await redeService.sync(data.rede);
                return saveLocal({ ...profile, rede: synced });
            }
            throw new Error(error?.message || "Não foi possível atualizar o perfil.");
        }

        const { data: created, error } = await supabase
            .from("mi_perfis")
            .insert(payload)
            .select("*")
            .single();

        if (!error && created) {
            const saved = mapRow(created);
            saved.rede = await redeService.sync(data.rede);
            return saved;
        }
        if (isDbUnavailable(error)) {
            const synced = await redeService.sync(data.rede);
            return saveLocal({ ...profile, rede: synced });
        }
        throw new Error(error?.message || "Não foi possível salvar o perfil.");
    },

    async updateHumor(humor: HumorTipo): Promise<MiProfile> {
        const scope = await getMiScope();
        const current = await this.get();
        const updated: MiProfile = {
            ...current,
            humorAtual: humor,
            humorAtualizadoEm: new Date().toISOString(),
        };

        if (!scope) return saveLocal(updated);

        const payload = {
            ...scopePayload(scope),
            onboarding_complete: current.onboardingComplete,
            nome: current.nome,
            foto_url: current.fotoUrl ?? null,
            rede: current.rede,
            humor_atual: humor,
            humor_atualizado_em: updated.humorAtualizadoEm,
            updated_at: new Date().toISOString(),
        };

        let existingQuery = supabase.from("mi_perfis").select("id");
        existingQuery = applyScope(existingQuery, scope);
        const { data: existing, error: existingError } = await existingQuery.maybeSingle();

        if (isDbUnavailable(existingError)) return saveLocal(updated);

        if (existing?.id) {
            const { data: row, error } = await supabase
                .from("mi_perfis")
                .update(payload)
                .eq("id", existing.id)
                .select("*")
                .single();
            if (!error && row) return mapRow(row);
            if (isDbUnavailable(error)) return saveLocal(updated);
            return saveLocal(updated);
        }

        const { data: created, error } = await supabase
            .from("mi_perfis")
            .insert({ ...payload, onboarding_complete: true })
            .select("*")
            .single();

        if (!error && created) return mapRow(created);
        if (isDbUnavailable(error)) return saveLocal(updated);
        return saveLocal(updated);
    },

    async updateProfile(data: {
        nome?: string;
        fotoUrl?: string;
        rede?: PessoaRede[];
    }): Promise<MiProfile> {
        const current = await this.get();
        const updated: MiProfile = {
            ...current,
            nome: data.nome?.trim() || current.nome,
            fotoUrl: data.fotoUrl !== undefined ? data.fotoUrl : current.fotoUrl,
            rede: data.rede ?? current.rede,
        };

        const scope = await getMiScope();
        if (!scope) {
            const synced = await redeService.sync(updated.rede);
            return saveLocal({ ...updated, rede: synced });
        }

        const payload = {
            ...scopePayload(scope),
            onboarding_complete: current.onboardingComplete,
            nome: updated.nome,
            foto_url: updated.fotoUrl ?? null,
            rede: updated.rede,
            humor_atual: current.humorAtual ?? null,
            humor_atualizado_em: current.humorAtualizadoEm ?? null,
            updated_at: new Date().toISOString(),
        };

        let existingQuery = supabase.from("mi_perfis").select("id");
        existingQuery = applyScope(existingQuery, scope);
        const { data: existing, error: existingError } = await existingQuery.maybeSingle();

        if (isDbUnavailable(existingError)) {
            const synced = data.rede
                ? await redeService.sync(updated.rede)
                : await redeService.list();
            return saveLocal({ ...updated, rede: synced });
        }

        if (existing?.id) {
            const { data: row, error } = await supabase
                .from("mi_perfis")
                .update(payload)
                .eq("id", existing.id)
                .select("*")
                .single();
            if (!error && row) {
                const saved = mapRow(row);
                if (data.rede) saved.rede = await redeService.sync(data.rede);
                else saved.rede = await redeService.list();
                return saved;
            }
            if (isDbUnavailable(error)) {
                const synced = data.rede
                    ? await redeService.sync(data.rede)
                    : await redeService.list();
                return saveLocal({ ...updated, rede: synced });
            }
            throw new Error(error?.message || "Não foi possível atualizar o perfil.");
        }

        const { data: created, error } = await supabase
            .from("mi_perfis")
            .insert({ ...payload, onboarding_complete: true })
            .select("*")
            .single();

        if (!error && created) {
            const saved = mapRow(created);
            if (data.rede) saved.rede = await redeService.sync(data.rede);
            return saved;
        }
        if (isDbUnavailable(error)) {
            const synced = data.rede
                ? await redeService.sync(data.rede)
                : await redeService.list();
            return saveLocal({ ...updated, rede: synced });
        }
        throw new Error(error?.message || "Não foi possível salvar o perfil.");
    },

    async isOnboardingComplete(): Promise<boolean> {
        const profile = await this.get();
        return profile.onboardingComplete;
    },
};
