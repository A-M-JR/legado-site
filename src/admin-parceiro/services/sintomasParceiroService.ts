import { supabase } from "@/lib/supabaseClient";
import { mapRegistro } from "@/modules/medicina-preventiva/services/sintomasService";
import type {
    RegistroSintoma,
    SintomaCatalogo,
    SintomaStatus,
} from "@/modules/medicina-preventiva/types";
import { getParceiroScope, mapaNomesPacientes } from "./parceiroScope";

function mapCatalogo(row: Record<string, unknown>): SintomaCatalogo {
    return {
        id: String(row.id),
        nome: String(row.nome ?? ""),
        descricao: String(row.descricao ?? ""),
        categoria: String(row.categoria ?? ""),
        gravidadePadrao: (row.gravidade_padrao as SintomaCatalogo["gravidadePadrao"]) ?? "media",
        ativo: row.ativo !== false,
        ordem: Number(row.ordem ?? 0),
    };
}

export const sintomasParceiroService = {
    async listRegistros(filtro: { status?: SintomaStatus | "todos"; titularId?: string } = {}): Promise<
        RegistroSintoma[]
    > {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        let query = supabase
            .from("mp_registros_sintomas")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("created_at", { ascending: false });

        if (filtro.status && filtro.status !== "todos") query = query.eq("status", filtro.status);
        if (filtro.titularId) query = query.eq("titular_id", filtro.titularId);

        const { data, error } = await query;
        if (error || !data) return [];

        const nomes = await mapaNomesPacientes(scope.parceiroId);
        return data.map((row) => {
            const registro = mapRegistro(row);
            return { ...registro, pacienteNome: nomes.get(registro.titularId) ?? "" };
        });
    },

    async setStatus(id: string, status: SintomaStatus): Promise<void> {
        const { error } = await supabase
            .from("mp_registros_sintomas")
            .update({ status })
            .eq("id", id);
        if (error) throw new Error(error.message);
    },

    async contarNovos(): Promise<number> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return 0;

        const { count } = await supabase
            .from("mp_registros_sintomas")
            .select("*", { count: "exact", head: true })
            .eq("parceiro_id", scope.parceiroId)
            .eq("status", "novo");

        return count ?? 0;
    },
};

export const catalogoSintomasService = {
    async list(): Promise<SintomaCatalogo[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("mp_sintomas_catalogo")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("ordem")
            .order("nome");

        if (error || !data) return [];
        return data.map(mapCatalogo);
    },

    async create(input: {
        nome: string;
        categoria: string;
        gravidadePadrao: SintomaCatalogo["gravidadePadrao"];
        descricao: string;
    }): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_sintomas_catalogo").insert({
            parceiro_id: scope.parceiroId,
            nome: input.nome,
            categoria: input.categoria,
            gravidade_padrao: input.gravidadePadrao,
            descricao: input.descricao,
        });

        if (error) {
            throw new Error(
                error.message.includes("mp_sintomas_catalogo_nome_unico")
                    ? "Já existe um sintoma com esse nome."
                    : error.message
            );
        }
    },

    async update(id: string, input: Partial<SintomaCatalogo>): Promise<void> {
        const payload: Record<string, unknown> = {};
        if (input.nome !== undefined) payload.nome = input.nome;
        if (input.categoria !== undefined) payload.categoria = input.categoria;
        if (input.descricao !== undefined) payload.descricao = input.descricao;
        if (input.gravidadePadrao !== undefined) payload.gravidade_padrao = input.gravidadePadrao;
        if (input.ativo !== undefined) payload.ativo = input.ativo;
        if (input.ordem !== undefined) payload.ordem = input.ordem;

        const { error } = await supabase
            .from("mp_sintomas_catalogo")
            .update(payload)
            .eq("id", id);
        if (error) throw new Error(error.message);
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("mp_sintomas_catalogo").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },

    /** Carrega a lista sugerida de sintomas (função no banco). */
    async carregarSugeridos(): Promise<number> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { data, error } = await supabase.rpc("mp_seed_sintomas", {
            p_parceiro_id: scope.parceiroId,
        });

        if (error) throw new Error(error.message);
        return Number(data ?? 0);
    },
};
