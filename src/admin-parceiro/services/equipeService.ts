import { supabase } from "@/lib/supabaseClient";
import { getParceiroScope } from "./parceiroScope";

export type MembroEquipe = {
    id: string;
    authId: string;
    nome: string;
    email: string;
    role: string;
    status: string;
    criadoEm: string;
};

export const equipeService = {
    async list(): Promise<MembroEquipe[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("usuarios_app")
            .select("id, auth_id, role, status, criado_em, nome, email")
            .eq("parceiro_id", scope.parceiroId)
            .in("role", ["parceiro_admin", "parceiro_operador"])
            .order("criado_em", { ascending: false });

        if (error || !data) return [];

        return data.map((row: Record<string, unknown>) => ({
            id: String(row.id),
            authId: String(row.auth_id ?? ""),
            nome: String(row.nome ?? ""),
            email: String(row.email ?? ""),
            role: String(row.role ?? ""),
            status: String(row.status ?? "ativo"),
            criadoEm: String(row.criado_em ?? ""),
        }));
    },

    /**
     * Cria a conta da operadora. O signUp troca a sessão ativa do navegador,
     * por isso a sessão do admin é restaurada no final (mesmo padrão do
     * NovoTitularDialog).
     */
    async criarOperador(input: {
        nome: string;
        email: string;
        senha: string;
    }): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const {
            data: { session: sessaoAdmin },
        } = await supabase.auth.getSession();

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: input.email,
                password: input.senha,
                options: { data: { full_name: input.nome } },
            });

            if (authError) throw new Error(authError.message);
            const authId = authData.user?.id;
            if (!authId) throw new Error("Não foi possível criar o acesso.");

            const { error: vinculoError } = await supabase.from("usuarios_app").insert({
                auth_id: authId,
                parceiro_id: scope.parceiroId,
                titular_id: null,
                role: "parceiro_operador",
                status: "ativo",
                nome: input.nome,
                email: input.email,
            });

            if (vinculoError) throw new Error(vinculoError.message);
        } finally {
            if (sessaoAdmin) {
                await supabase.auth.setSession({
                    access_token: sessaoAdmin.access_token,
                    refresh_token: sessaoAdmin.refresh_token,
                });
            }
        }
    },

    async setStatus(id: string, status: "ativo" | "inativo"): Promise<void> {
        const { error } = await supabase.from("usuarios_app").update({ status }).eq("id", id);
        if (error) throw new Error(error.message);
    },
};
