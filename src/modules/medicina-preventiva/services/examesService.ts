import { supabase } from "@/lib/supabaseClient";
import type { ExameArquivo, ExameMp } from "../types";
import { applyScope, getMpScope } from "./mpScope";

export function mapExame(row: Record<string, unknown>): ExameMp {
    const arquivos = Array.isArray(row.arquivos) ? (row.arquivos as ExameArquivo[]) : [];
    return {
        id: String(row.id),
        titularId: String(row.titular_id ?? ""),
        nomeExame: String(row.nome_exame ?? ""),
        tipo: (row.tipo as ExameMp["tipo"]) ?? "laboratorial",
        medicoSolicitante: String(row.medico_solicitante ?? ""),
        especialidade: String(row.especialidade ?? ""),
        laboratorio: String(row.laboratorio ?? ""),
        dataSolicitacao: row.data_solicitacao ? String(row.data_solicitacao) : "",
        dataHoraAgendada: row.data_hora_agendada ? String(row.data_hora_agendada) : "",
        dataRealizacao: row.data_realizacao ? String(row.data_realizacao) : "",
        status: (row.status as ExameMp["status"]) ?? "solicitado",
        resultadoResumo: String(row.resultado_resumo ?? ""),
        observacoes: String(row.observacoes ?? ""),
        arquivos,
        origem: (row.origem as ExameMp["origem"]) ?? "paciente",
    };
}

export const examesService = {
    async list(): Promise<ExameMp[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_exames")
            .select("*")
            .order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapExame);
    },

    async add(exame: {
        nomeExame: string;
        tipo: ExameMp["tipo"];
        medicoSolicitante: string;
        especialidade: string;
        laboratorio: string;
        dataSolicitacao: string;
        dataRealizacao: string;
        status: ExameMp["status"];
        resultadoResumo: string;
        observacoes: string;
        arquivos: ExameArquivo[];
    }): Promise<ExameMp[]> {
        const scope = await getMpScope();
        if (!scope?.titularId) {
            throw new Error("Conta sem paciente vinculado.");
        }

        const { error } = await supabase.from("mp_exames").insert({
            titular_id: scope.titularId,
            auth_id: scope.authId,
            parceiro_id: scope.parceiroId,
            nome_exame: exame.nomeExame,
            tipo: exame.tipo,
            medico_solicitante: exame.medicoSolicitante,
            especialidade: exame.especialidade,
            laboratorio: exame.laboratorio,
            data_solicitacao: exame.dataSolicitacao || null,
            data_realizacao: exame.dataRealizacao || null,
            status: exame.status,
            resultado_resumo: exame.resultadoResumo,
            observacoes: exame.observacoes,
            arquivos: exame.arquivos,
            origem: "paciente",
            criado_por: scope.authId,
        });
        if (error) throw new Error(error.message);

        return this.list();
    },

    async update(id: string, exame: Partial<ExameMp>): Promise<ExameMp[]> {
        const payload: Record<string, unknown> = {};
        if (exame.nomeExame !== undefined) payload.nome_exame = exame.nomeExame;
        if (exame.tipo !== undefined) payload.tipo = exame.tipo;
        if (exame.medicoSolicitante !== undefined) payload.medico_solicitante = exame.medicoSolicitante;
        if (exame.especialidade !== undefined) payload.especialidade = exame.especialidade;
        if (exame.laboratorio !== undefined) payload.laboratorio = exame.laboratorio;
        if (exame.dataSolicitacao !== undefined) payload.data_solicitacao = exame.dataSolicitacao || null;
        if (exame.dataRealizacao !== undefined) payload.data_realizacao = exame.dataRealizacao || null;
        if (exame.status !== undefined) payload.status = exame.status;
        if (exame.resultadoResumo !== undefined) payload.resultado_resumo = exame.resultadoResumo;
        if (exame.observacoes !== undefined) payload.observacoes = exame.observacoes;
        if (exame.arquivos !== undefined) payload.arquivos = exame.arquivos;

        const { error } = await supabase.from("mp_exames").update(payload).eq("id", id);
        if (error) throw new Error(error.message);

        return this.list();
    },

    async anexar(id: string, arquivo: ExameArquivo): Promise<ExameMp[]> {
        const atual = (await this.list()).find((e) => e.id === id);
        const arquivos = [...(atual?.arquivos ?? []), arquivo];
        return this.update(id, { arquivos });
    },

    async removerAnexo(id: string, path: string): Promise<ExameMp[]> {
        const atual = (await this.list()).find((e) => e.id === id);
        const arquivos = (atual?.arquivos ?? []).filter((a) => a.path !== path);
        return this.update(id, { arquivos });
    },

    async remove(id: string): Promise<ExameMp[]> {
        const { error } = await supabase.from("mp_exames").delete().eq("id", id);
        if (error) throw new Error(error.message);
        return this.list();
    },

    pendentes(list: ExameMp[]): ExameMp[] {
        return list.filter((e) => e.status === "solicitado" || e.status === "agendado");
    },
};
