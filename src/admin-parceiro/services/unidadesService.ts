import { supabase } from "@/lib/supabaseClient";
import type { Unidade } from "@/modules/medicina-preventiva/types";
import { getParceiroScope } from "./parceiroScope";

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

export type ParceiroConfig = {
    mensagemPadrao: string;
    unidadePadraoId: string | null;
};

export const unidadesService = {
    async list(): Promise<Unidade[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("mp_unidades")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("ordem")
            .order("nome");

        if (error || !data) return [];
        return data.map(mapUnidade);
    },

    async create(input: {
        nome: string;
        whatsappNumero: string;
        telefone: string;
        endereco: string;
    }): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_unidades").insert({
            parceiro_id: scope.parceiroId,
            nome: input.nome,
            whatsapp_numero: input.whatsappNumero,
            telefone: input.telefone,
            endereco: input.endereco,
        });

        if (error) throw new Error(error.message);
    },

    async update(id: string, input: Partial<Unidade>): Promise<void> {
        const payload: Record<string, unknown> = {};
        if (input.nome !== undefined) payload.nome = input.nome;
        if (input.whatsappNumero !== undefined) payload.whatsapp_numero = input.whatsappNumero;
        if (input.telefone !== undefined) payload.telefone = input.telefone;
        if (input.endereco !== undefined) payload.endereco = input.endereco;
        if (input.ativo !== undefined) payload.ativo = input.ativo;
        if (input.ordem !== undefined) payload.ordem = input.ordem;

        const { error } = await supabase.from("mp_unidades").update(payload).eq("id", id);
        if (error) throw new Error(error.message);
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("mp_unidades").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },

    async getConfig(): Promise<ParceiroConfig> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return { mensagemPadrao: "", unidadePadraoId: null };

        const { data } = await supabase
            .from("mp_parceiro_config")
            .select("whatsapp_mensagem_padrao, unidade_padrao_id")
            .eq("parceiro_id", scope.parceiroId)
            .maybeSingle();

        return {
            mensagemPadrao: String(data?.whatsapp_mensagem_padrao ?? ""),
            unidadePadraoId: data?.unidade_padrao_id ?? null,
        };
    },

    async salvarConfig(config: ParceiroConfig): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_parceiro_config").upsert(
            {
                parceiro_id: scope.parceiroId,
                whatsapp_mensagem_padrao: config.mensagemPadrao,
                unidade_padrao_id: config.unidadePadraoId,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "parceiro_id" }
        );

        if (error) throw new Error(error.message);
    },

    async getUnidadeDoPaciente(titularId: string): Promise<string | null> {
        const { data } = await supabase
            .from("mp_paciente_unidade")
            .select("unidade_id")
            .eq("titular_id", titularId)
            .maybeSingle();
        return data?.unidade_id ?? null;
    },

    async vincularPaciente(titularId: string, unidadeId: string | null): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_paciente_unidade").upsert(
            {
                titular_id: titularId,
                parceiro_id: scope.parceiroId,
                unidade_id: unidadeId,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "titular_id" }
        );

        if (error) throw new Error(error.message);
    },
};
