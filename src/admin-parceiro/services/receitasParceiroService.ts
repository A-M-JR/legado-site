import { supabase } from "@/lib/supabaseClient";
import type { ReceitaMp } from "@/modules/medicina-preventiva/types";

function mapRow(row: Record<string, unknown>): ReceitaMp {
    return {
        id: String(row.id),
        medicamento: String(row.medicamento ?? ""),
        dosagem: String(row.dosagem ?? ""),
        frequencia: String(row.frequencia ?? ""),
        inicio: row.inicio ? String(row.inicio) : "",
        validade: row.validade ? String(row.validade) : "",
        medico: String(row.medico ?? ""),
        especialidade: String(row.especialidade ?? ""),
        dataConsulta: String(row.data_consulta ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
        ativa: row.ativa !== false,
        observacoes: String(row.observacoes ?? ""),
    };
}

/**
 * Receitas do paciente vistas pela clínica. A RLS (mp_receitas_select =
 * mp_can_access) já libera a leitura para a equipe do parceiro do titular.
 */
export const receitasParceiroService = {
    async list(titularId: string): Promise<ReceitaMp[]> {
        if (!titularId) return [];

        const { data, error } = await supabase
            .from("mp_receitas")
            .select("*")
            .eq("titular_id", titularId)
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data.map(mapRow);
    },
};
