import { supabase } from "@/lib/supabaseClient";
import type { RegistroSaude } from "../types";
import { applyScope, getMiScope, scopePayload } from "./miScope";

function mapRow(row: Record<string, unknown>): RegistroSaude {
    return {
        id: String(row.id),
        tipo: String(row.tipo),
        value: String(row.value),
        unit: String(row.unit ?? ""),
        timeLabel: String(row.time_label),
        note: String(row.note ?? ""),
    };
}

export const saudeService = {
    async list(): Promise<RegistroSaude[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        let query = supabase
            .from("mi_registros_saude")
            .select("*")
            .order("time_label", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRow);
    },

    async add(
        data: Omit<RegistroSaude, "id" | "timeLabel"> & { timeLabel?: string }
    ): Promise<RegistroSaude[]> {
        const scope = await getMiScope();
        if (!scope) return [];

        await supabase.from("mi_registros_saude").insert({
            ...scopePayload(scope),
            tipo: data.tipo,
            value: data.value,
            unit: data.unit,
            time_label: data.timeLabel || new Date().toISOString(),
            note: data.note,
        });

        return this.list();
    },

    ultimoPorTipo(list: RegistroSaude[], tipo: string): RegistroSaude | undefined {
        return list.find((r) => r.tipo === tipo);
    },

    groupByDate(list: RegistroSaude[]): Record<string, RegistroSaude[]> {
        const grouped = list.reduce<Record<string, RegistroSaude[]>>((acc, item) => {
            const date = item.timeLabel.slice(0, 10);
            acc[date] = acc[date] || [];
            acc[date].push(item);
            return acc;
        }, {});
        const keys = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));
        return Object.fromEntries(keys.map((k) => [k, grouped[k]]));
    },
};
