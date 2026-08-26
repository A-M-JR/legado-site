import { supabase } from "@/lib/supabaseClient";
import { mapConsulta } from "@/modules/medicina-preventiva/services/consultasService";
import type { ConsultaMp } from "@/modules/medicina-preventiva/types";
import { getParceiroScope, listPacientes } from "./parceiroScope";

export type LembreteConfig = {
    ativo: boolean;
    dias: number[];
    hora: string; // HH:MM
    mensagem: string;
};

export const LEMBRETE_CONFIG_PADRAO: LembreteConfig = {
    ativo: true,
    dias: [1],
    hora: "09:00",
    mensagem:
        "Olá {paciente}! Passando para lembrar da sua consulta {quando}{profissional}{local}. Qualquer dúvida, é só chamar por aqui.",
};

/** Uma consulta dentro da janela de aviso, já com o que foi e o que falta enviar. */
export type LembretePendente = {
    consulta: ConsultaMp;
    pacienteNome: string;
    telefone: string;
    diasAntes: number;
    avisadoNoApp: boolean;
    avisadoNoWhatsapp: boolean;
};

function soDigitos(valor: string): string {
    return (valor ?? "").replace(/\D/g, "");
}

/** wa.me exige DDI; telefone brasileiro salvo sem o 55 recebe o prefixo. */
export function numeroWhatsapp(telefone: string): string | null {
    const digitos = soDigitos(telefone);
    if (digitos.length < 10) return null;
    return digitos.length <= 11 ? `55${digitos}` : digitos;
}

/** Dias inteiros entre hoje e a data da consulta, no fuso de São Paulo. */
function diasAte(dataHoraIso: string): number {
    const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const hoje = new Date(`${fmt.format(new Date())}T00:00:00`);
    const alvo = new Date(`${fmt.format(new Date(dataHoraIso))}T00:00:00`);
    return Math.round((alvo.getTime() - hoje.getTime()) / 86400000);
}

export function montarMensagem(
    modelo: string,
    dados: { paciente: string; consulta: ConsultaMp; diasAntes: number }
): string {
    const quando = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(dados.consulta.dataHora));

    const prefixo =
        dados.diasAntes <= 0 ? "hoje" : dados.diasAntes === 1 ? "amanhã" : `em ${dados.diasAntes} dias`;

    return modelo
        .replaceAll("{paciente}", dados.paciente.split(" ")[0] || dados.paciente)
        .replaceAll("{quando}", `${prefixo}, dia ${quando}`)
        .replaceAll(
            "{profissional}",
            dados.consulta.profissional ? ` com ${dados.consulta.profissional}` : ""
        )
        .replaceAll("{local}", dados.consulta.local ? ` em ${dados.consulta.local}` : "")
        .trim();
}

export const lembretesService = {
    async getConfig(): Promise<LembreteConfig> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) return LEMBRETE_CONFIG_PADRAO;

        const { data } = await supabase
            .from("mp_parceiro_config")
            .select("lembrete_ativo, lembrete_dias, lembrete_hora, lembrete_whatsapp_mensagem")
            .eq("parceiro_id", scope.parceiroId)
            .maybeSingle();

        if (!data) return LEMBRETE_CONFIG_PADRAO;

        const dias = Array.isArray(data.lembrete_dias)
            ? (data.lembrete_dias as number[]).map(Number).sort((a, b) => b - a)
            : LEMBRETE_CONFIG_PADRAO.dias;

        return {
            ativo: data.lembrete_ativo !== false,
            dias,
            hora: String(data.lembrete_hora ?? "09:00").slice(0, 5),
            mensagem: String(
                data.lembrete_whatsapp_mensagem || LEMBRETE_CONFIG_PADRAO.mensagem
            ),
        };
    },

    async salvarConfig(config: LembreteConfig): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_parceiro_config").upsert(
            {
                parceiro_id: scope.parceiroId,
                lembrete_ativo: config.ativo,
                lembrete_dias: config.dias,
                lembrete_hora: `${config.hora}:00`,
                lembrete_whatsapp_mensagem: config.mensagem,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "parceiro_id" }
        );

        if (error) throw new Error(error.message);
    },

    /**
     * Gera no banco as notificações que estão vencidas na janela desta clínica.
     * É o mesmo trabalho do cron — serve de rede de segurança quando o pg_cron
     * não está habilitado e para o botão "gerar agora".
     */
    async gerarAgora(): Promise<number> {
        const { data, error } = await supabase.rpc("mp_gerar_lembretes_do_parceiro");
        if (error) throw new Error(error.message);
        return Number(data ?? 0);
    },

    /** Consultas que caem na janela configurada, com o status de cada canal. */
    async listPendentes(config: LembreteConfig): Promise<LembretePendente[]> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId || config.dias.length === 0) return [];

        // Janela folgada de um dia para cada lado — quem decide de fato é o
        // diasAte() abaixo, que conta no fuso de São Paulo e não no do navegador.
        const maiorJanela = Math.max(...config.dias);
        const hoje = new Date();
        const inicio = new Date(hoje);
        inicio.setDate(inicio.getDate() - 1);
        inicio.setHours(0, 0, 0, 0);
        const fim = new Date(hoje);
        fim.setDate(fim.getDate() + maiorJanela + 1);
        fim.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
            .from("mp_consultas")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .in("status", ["agendada", "confirmada"])
            .gte("data_hora", inicio.toISOString())
            .lte("data_hora", fim.toISOString())
            .order("data_hora", { ascending: true });

        if (error || !data?.length) return [];

        const consultas = data
            .map(mapConsulta)
            .map((consulta) => ({ consulta, diasAntes: diasAte(consulta.dataHora) }))
            .filter(({ diasAntes }) => config.dias.includes(diasAntes));

        if (consultas.length === 0) return [];

        const [pacientes, telefones, enviados] = await Promise.all([
            listPacientes(scope.parceiroId),
            this.telefonesDosPacientes(consultas.map((c) => c.consulta.titularId)),
            this.enviados(consultas.map((c) => c.consulta.id)),
        ]);

        const nomes = new Map(pacientes.map((p) => [p.titularId, p.nome]));

        return consultas.map(({ consulta, diasAntes }) => ({
            consulta,
            diasAntes,
            pacienteNome: nomes.get(consulta.titularId) ?? "",
            telefone: telefones.get(consulta.titularId) ?? "",
            avisadoNoApp: enviados.has(`${consulta.id}|${diasAntes}|app`),
            avisadoNoWhatsapp: enviados.has(`${consulta.id}|${diasAntes}|whatsapp`),
        }));
    },

    async telefonesDosPacientes(titularIds: string[]): Promise<Map<string, string>> {
        const ids = [...new Set(titularIds)].filter(Boolean);
        if (!ids.length) return new Map();

        const { data } = await supabase.from("titulares").select("id, telefone").in("id", ids);
        return new Map((data ?? []).map((t) => [String(t.id), String(t.telefone ?? "")]));
    },

    /** Chaves `consultaId|diasAntes|canal` do que já foi avisado. */
    async enviados(consultaIds: string[]): Promise<Set<string>> {
        if (!consultaIds.length) return new Set();

        const { data } = await supabase
            .from("mp_consulta_lembretes")
            .select("consulta_id, dias_antes, canal")
            .in("consulta_id", consultaIds);

        return new Set(
            (data ?? []).map((l) => `${l.consulta_id}|${l.dias_antes}|${l.canal}`)
        );
    },

    async marcarWhatsapp(item: LembretePendente): Promise<void> {
        const scope = await getParceiroScope();
        if (!scope?.parceiroId) throw new Error("Parceiro não identificado.");

        const { error } = await supabase.from("mp_consulta_lembretes").insert({
            consulta_id: item.consulta.id,
            parceiro_id: scope.parceiroId,
            titular_id: item.consulta.titularId,
            dias_antes: item.diasAntes,
            canal: "whatsapp",
            enviado_por: scope.authId,
        });

        // Corrida entre duas atendentes na mesma consulta: já está marcado, tudo bem.
        if (error && error.code !== "23505") throw new Error(error.message);
    },

    async desmarcarWhatsapp(item: LembretePendente): Promise<void> {
        const { error } = await supabase
            .from("mp_consulta_lembretes")
            .delete()
            .eq("consulta_id", item.consulta.id)
            .eq("dias_antes", item.diasAntes)
            .eq("canal", "whatsapp");

        if (error) throw new Error(error.message);
    },
};
