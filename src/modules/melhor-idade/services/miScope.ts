import { supabase } from "@/lib/supabaseClient";

export type MiScope = {
    titularId: string | null;
    authId: string;
};

export async function getMiScope(): Promise<MiScope | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: ua } = await supabase
        .from("usuarios_app")
        .select("titular_id")
        .eq("auth_id", user.id)
        .maybeSingle();

    let titularId = ua?.titular_id ?? null;

    if (!titularId) {
        const { data: titular } = await supabase
            .from("titulares")
            .select("id")
            .eq("auth_id", user.id)
            .maybeSingle();
        titularId = titular?.id ?? null;
    }

    return { titularId, authId: user.id };
}

export type TitularConta = {
    nome: string;
    fotoUrl?: string;
};

export type ContaDados = {
    titularId: string | null;
    podeEditar: boolean;
    email: string;
    nome: string;
    telefone: string;
    cpf: string;
    dataNascimento: string;
    fotoUrl?: string;
};

function formatDataBR(iso: string | null | undefined): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("T")[0].split("-");
    if (!y || !m || !d) return iso;
    return `${d}/${m}/${y}`;
}

function formatDataISO(br: string): string {
    const [d, m, y] = br.split("/");
    if (!d || !m || !y) return br;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

async function fetchTitularRow(scope: MiScope) {
    if (scope.titularId) {
        const { data } = await supabase
            .from("titulares")
            .select("id, nome, telefone, cpf, data_nascimento, email, imagem_url, auth_id")
            .eq("id", scope.titularId)
            .maybeSingle();
        return data;
    }

    const { data } = await supabase
        .from("titulares")
        .select("id, nome, telefone, cpf, data_nascimento, email, imagem_url, auth_id")
        .eq("auth_id", scope.authId)
        .maybeSingle();
    return data;
}

export async function getTitularConta(): Promise<TitularConta | null> {
    const scope = await getMiScope();
    if (!scope) return null;

    const data = await fetchTitularRow(scope);
    if (!data?.nome) return null;
    return {
        nome: String(data.nome),
        fotoUrl: data.imagem_url ? String(data.imagem_url) : undefined,
    };
}

export async function getContaDados(): Promise<ContaDados | null> {
    const scope = await getMiScope();
    if (!scope) return null;

    const {
        data: { user },
    } = await supabase.auth.getUser();
    const data = await fetchTitularRow(scope);

    if (!data) {
        return {
            titularId: null,
            podeEditar: false,
            email: user?.email ?? "",
            nome: "",
            telefone: "",
            cpf: "",
            dataNascimento: "",
        };
    }

    return {
        titularId: String(data.id),
        podeEditar: data.auth_id === scope.authId,
        email: String(data.email || user?.email || ""),
        nome: String(data.nome ?? ""),
        telefone: String(data.telefone ?? ""),
        cpf: String(data.cpf ?? ""),
        dataNascimento: formatDataBR(data.data_nascimento),
        fotoUrl: data.imagem_url ? String(data.imagem_url) : undefined,
    };
}

export async function updateContaDados(dados: {
    telefone: string;
    cpf: string;
    dataNascimento: string;
}): Promise<void> {
    const scope = await getMiScope();
    if (!scope) throw new Error("Sessão inválida.");

    const row = await fetchTitularRow(scope);
    if (!row?.id) throw new Error("Conta não encontrada.");
    if (row.auth_id !== scope.authId) {
        throw new Error("Você não tem permissão para alterar estes dados.");
    }

    const { error } = await supabase
        .from("titulares")
        .update({
            telefone: dados.telefone,
            cpf: dados.cpf || null,
            data_nascimento: formatDataISO(dados.dataNascimento),
        })
        .eq("id", row.id);

    if (error) throw new Error(error.message);
}

export function scopePayload(scope: MiScope) {
    return {
        titular_id: scope.titularId,
        auth_id: scope.authId,
    };
}

type ScopedQuery = {
    eq: (column: string, value: string) => ScopedQuery;
};

export function applyScope<T extends ScopedQuery>(query: T, scope: MiScope): T {
    if (scope.titularId) return query.eq("titular_id", scope.titularId);
    return query.eq("auth_id", scope.authId);
}
