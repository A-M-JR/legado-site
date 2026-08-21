import { supabase } from "@/lib/supabaseClient";
import type { Unidade } from "../types";

export type MpScope = {
    titularId: string | null;
    authId: string;
    parceiroId: string | null;
};

let scopeCache: MpScope | null = null;

export function limparMpScope() {
    scopeCache = null;
}

export async function getMpScope(): Promise<MpScope | null> {
    if (scopeCache) return scopeCache;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: ua } = await supabase
        .from("usuarios_app")
        .select("titular_id, parceiro_id")
        .eq("auth_id", user.id)
        .maybeSingle();

    let titularId = ua?.titular_id ?? null;
    let parceiroId = ua?.parceiro_id ?? null;

    if (!titularId) {
        const { data: titular } = await supabase
            .from("titulares")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();
        titularId = titular?.id ?? null;
    }

    // O vínculo com a clínica fica em usuarios_app — titulares não tem parceiro_id.
    // Conta de familiar pode não ter o parceiro no próprio registro; nesse caso
    // buscamos pelo registro do titular.
    if (!parceiroId && titularId) {
        const { data: vinculo } = await supabase
            .from("usuarios_app")
            .select("parceiro_id")
            .eq("titular_id", titularId)
            .not("parceiro_id", "is", null)
            .limit(1)
            .maybeSingle();
        parceiroId = vinculo?.parceiro_id ?? null;
    }

    scopeCache = { titularId, authId: user.id, parceiroId };
    return scopeCache;
}

export function scopePayload(scope: MpScope) {
    return {
        titular_id: scope.titularId,
        auth_id: scope.authId,
    };
}

type ScopedQuery = {
    eq: (column: string, value: string) => ScopedQuery;
};

export function applyScope<T extends ScopedQuery>(query: T, scope: MpScope): T {
    if (scope.titularId) return query.eq("titular_id", scope.titularId) as T;
    return query.eq("auth_id", scope.authId) as T;
}

function mapUnidade(row: Record<string, unknown>): Unidade {
    return {
        id: String(row.id),
        parceiroId: String(row.parceiro_id ?? ""),
        nome: String(row.nome ?? ""),
        whatsappNumero: String(row.whatsapp_numero ?? ""),
        telefone: String(row.telefone ?? ""),
        endereco: String(row.endereco ?? ""),
        ativo: row.ativo !== false,
        ordem: Number(row.ordem ?? 0),
    };
}

/**
 * Unidade de referência do paciente: vínculo explícito -> unidade padrão do
 * parceiro -> primeira unidade ativa.
 */
export async function getUnidadeDoPaciente(): Promise<Unidade | null> {
    const scope = await getMpScope();
    if (!scope) return null;

    if (scope.titularId) {
        const { data: vinculo } = await supabase
            .from("mp_paciente_unidade")
            .select("unidade_id")
            .eq("titular_id", scope.titularId)
            .maybeSingle();

        if (vinculo?.unidade_id) {
            const { data } = await supabase
                .from("mp_unidades")
                .select("*")
                .eq("id", vinculo.unidade_id)
                .maybeSingle();
            if (data) return mapUnidade(data);
        }
    }

    if (!scope.parceiroId) return null;

    const { data: config } = await supabase
        .from("mp_parceiro_config")
        .select("unidade_padrao_id")
        .eq("parceiro_id", scope.parceiroId)
        .maybeSingle();

    if (config?.unidade_padrao_id) {
        const { data } = await supabase
            .from("mp_unidades")
            .select("*")
            .eq("id", config.unidade_padrao_id)
            .maybeSingle();
        if (data) return mapUnidade(data);
    }

    const { data: primeira } = await supabase
        .from("mp_unidades")
        .select("*")
        .eq("parceiro_id", scope.parceiroId)
        .eq("ativo", true)
        .order("ordem")
        .limit(1)
        .maybeSingle();

    return primeira ? mapUnidade(primeira) : null;
}

export async function getMensagemPadrao(): Promise<string> {
    const scope = await getMpScope();
    if (!scope?.parceiroId) return "";

    const { data } = await supabase
        .from("mp_parceiro_config")
        .select("whatsapp_mensagem_padrao")
        .eq("parceiro_id", scope.parceiroId)
        .maybeSingle();

    return String(data?.whatsapp_mensagem_padrao ?? "");
}

export type PacienteCard = {
    titularId: string | null;
    nome: string;
    fotoUrl?: string;
};

/** Dados do próprio paciente para exibir como pessoa na tela de família. */
export async function getPacienteCard(): Promise<PacienteCard> {
    const scope = await getMpScope();
    if (!scope) return { titularId: null, nome: "" };

    if (scope.titularId) {
        const { data } = await supabase
            .from("titulares")
            .select("nome, imagem_url")
            .eq("id", scope.titularId)
            .maybeSingle();

        if (data) {
            return {
                titularId: scope.titularId,
                nome: String(data.nome ?? ""),
                fotoUrl: data.imagem_url ? String(data.imagem_url) : undefined,
            };
        }
    }

    return { titularId: scope.titularId, nome: await getNomePaciente() };
}

export async function getNomePaciente(): Promise<string> {
    const scope = await getMpScope();
    if (!scope) return "";

    if (scope.titularId) {
        const { data } = await supabase
            .from("titulares")
            .select("nome")
            .eq("id", scope.titularId)
            .maybeSingle();
        if (data?.nome) return String(data.nome);
    }

    const {
        data: { user },
    } = await supabase.auth.getUser();
    return (user?.user_metadata?.full_name as string) || user?.email || "";
}
