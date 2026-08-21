import { supabase } from "@/lib/supabaseClient";
import { mapExame } from "@/modules/medicina-preventiva/services/examesService";
import type {
    ExameArquivo,
    ExameMp,
    ExameStatus,
    ExameTipo,
} from "@/modules/medicina-preventiva/types";
import { getParceiroScope, mapaNomesPacientes } from "./parceiroScope";

export type ExameInput = {
    titularId: string;
    authId?: string | null;
    unidadeId?: string | null;
    nomeExame: string;
    tipo: ExameTipo;
    medicoSolicitante: string;
    especialidade: string;
    laboratorio: string;
    dataSolicitacao: string;
    dataHoraAgendada: string;
    dataRealizacao: string;
    status: ExameStatus;
    resultadoResumo: string;
    observacoes: string;
};

export const examesParceiroService = {
    async list(filtro: { titularId?: string; status?: ExameStatus | "todos" } = {}): Promise<
        ExameMp[]
    > {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return [];

        let query = supabase
            .from("mp_exames")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .order("created_at", { ascending: false });

        if (filtro.titularId) query = query.eq("titular_id", filtro.titularId);
        if (filtro.status && filtro.status !== "todos") query = query.eq("status", filtro.status);

        const { data, error } = await query;
        if (error || !data) return [];

        const nomes = await mapaNomesPacientes(scope.parceiroId);
        return data.map((row) => {
            const exame = mapExame(row);
            return { ...exame, pacienteNome: nomes.get(exame.titularId) ?? "" };
        });
    },

    async create(input: ExameInput): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_exames").insert({
            titular_id: input.titularId,
            auth_id: input.authId ?? null,
            parceiro_id: scope.parceiroId,
            unidade_id: input.unidadeId ?? null,
            nome_exame: input.nomeExame,
            tipo: input.tipo,
            medico_solicitante: input.medicoSolicitante,
            especialidade: input.especialidade,
            laboratorio: input.laboratorio,
            data_solicitacao: input.dataSolicitacao || null,
            data_hora_agendada: input.dataHoraAgendada || null,
            data_realizacao: input.dataRealizacao || null,
            status: input.status,
            resultado_resumo: input.resultadoResumo,
            observacoes: input.observacoes,
            arquivos: [],
            origem: "clinica",
            criado_por: scope.authId,
        });

        if (error) throw new Error(error.message);
    },

    async update(id: string, input: Partial<ExameInput>): Promise<void> {
        const payload: Record<string, unknown> = {};
        if (input.nomeExame !== undefined) payload.nome_exame = input.nomeExame;
        if (input.tipo !== undefined) payload.tipo = input.tipo;
        if (input.medicoSolicitante !== undefined)
            payload.medico_solicitante = input.medicoSolicitante;
        if (input.especialidade !== undefined) payload.especialidade = input.especialidade;
        if (input.laboratorio !== undefined) payload.laboratorio = input.laboratorio;
        if (input.dataSolicitacao !== undefined)
            payload.data_solicitacao = input.dataSolicitacao || null;
        if (input.dataHoraAgendada !== undefined)
            payload.data_hora_agendada = input.dataHoraAgendada || null;
        if (input.dataRealizacao !== undefined)
            payload.data_realizacao = input.dataRealizacao || null;
        if (input.status !== undefined) payload.status = input.status;
        if (input.resultadoResumo !== undefined) payload.resultado_resumo = input.resultadoResumo;
        if (input.observacoes !== undefined) payload.observacoes = input.observacoes;
        if (input.unidadeId !== undefined) payload.unidade_id = input.unidadeId ?? null;

        const { error } = await supabase.from("mp_exames").update(payload).eq("id", id);
        if (error) throw new Error(error.message);
    },

    async anexar(id: string, arquivo: ExameArquivo): Promise<void> {
        const { data } = await supabase.from("mp_exames").select("arquivos").eq("id", id).single();
        const atuais = Array.isArray(data?.arquivos) ? (data!.arquivos as ExameArquivo[]) : [];

        const { error } = await supabase
            .from("mp_exames")
            .update({ arquivos: [...atuais, arquivo] })
            .eq("id", id);

        if (error) throw new Error(error.message);
    },

    async remove(id: string): Promise<void> {
        const { error } = await supabase.from("mp_exames").delete().eq("id", id);
        if (error) throw new Error(error.message);
    },
};
