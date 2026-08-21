import { supabase } from "@/lib/supabaseClient";

export type ParceiroRole = "parceiro_admin" | "parceiro_operador";

export type ParceiroScope = {
    parceiroId: string | null;
    authId: string;
    role: ParceiroRole | string;
};

export type PacienteResumo = {
    titularId: string;
    nome: string;
    email: string;
    authId: string | null;
};

let cache: ParceiroScope | null = null;

export function limparParceiroScope() {
    cache = null;
}

export async function getParceiroScope(): Promise<ParceiroScope | null> {
    if (cache) return cache;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("usuarios_app")
        .select("parceiro_id, role")
        .eq("auth_id", user.id)
        .maybeSingle();

    cache = {
        parceiroId: data?.parceiro_id ?? null,
        authId: user.id,
        role: String(data?.role ?? ""),
    };
    return cache;
}

export function isParceiroAdmin(role?: string | null): boolean {
    return role === "parceiro_admin";
}

/** Pacientes (titulares) da carteira do parceiro logado. */
export async function listPacientes(parceiroId: string): Promise<PacienteResumo[]> {
    const { data: vinculos, error } = await supabase
        .from("usuarios_app")
        .select("titular_id, auth_id, role")
        .eq("parceiro_id", parceiroId)
        .eq("role", "titular");

    if (error || !vinculos?.length) return [];

    const ids = vinculos.map((v) => v.titular_id).filter(Boolean) as string[];
    if (!ids.length) return [];

    const { data: titulares } = await supabase
        .from("titulares")
        .select("id, nome, email")
        .in("id", ids)
        .order("nome");

    const authPorTitular = new Map<string, string | null>();
    vinculos.forEach((v) => {
        if (v.titular_id) authPorTitular.set(v.titular_id, v.auth_id ?? null);
    });

    return (titulares ?? []).map((t) => ({
        titularId: String(t.id),
        nome: String(t.nome ?? ""),
        email: String(t.email ?? ""),
        authId: authPorTitular.get(String(t.id)) ?? null,
    }));
}

export async function mapaNomesPacientes(parceiroId: string): Promise<Map<string, string>> {
    const pacientes = await listPacientes(parceiroId);
    return new Map(pacientes.map((p) => [p.titularId, p.nome]));
}
