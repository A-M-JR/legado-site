import { supabase } from "@/lib/supabaseClient";
import { assinarArquivo } from "@/lib/uploadArquivo";
import type {
    RegistroSintoma,
    SintomaCatalogo,
    SintomaIntensidade,
    SintomaSelecionado,
    Unidade,
} from "../types";
import { fmtDataHora } from "../lib/datas";
import {
    applyScope,
    getMensagemPadrao,
    getMpScope,
    getNomePaciente,
    getUnidadeDoPaciente,
} from "./mpScope";

const INTENSIDADE_LABEL: Record<SintomaIntensidade, string> = {
    leve: "Leve",
    media: "Moderada",
    forte: "Forte",
};

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

export function mapRegistro(row: Record<string, unknown>): RegistroSintoma {
    const sintomas = Array.isArray(row.sintomas) ? (row.sintomas as SintomaSelecionado[]) : [];
    return {
        id: String(row.id),
        titularId: String(row.titular_id ?? ""),
        sintomas,
        intensidade: (row.intensidade as SintomaIntensidade) ?? "media",
        observacao: String(row.observacao ?? ""),
        fotoUrl: row.foto_url ? String(row.foto_url) : undefined,
        status: (row.status as RegistroSintoma["status"]) ?? "novo",
        whatsappEnviado: Boolean(row.whatsapp_enviado),
        unidadeId: row.unidade_id ? String(row.unidade_id) : null,
        criadoEm: String(row.created_at ?? ""),
    };
}

export const sintomasService = {
    async listCatalogo(): Promise<SintomaCatalogo[]> {
        const scope = await getMpScope();
        if (!scope?.parceiroId) return [];

        const { data, error } = await supabase
            .from("mp_sintomas_catalogo")
            .select("*")
            .eq("parceiro_id", scope.parceiroId)
            .eq("ativo", true)
            .order("ordem")
            .order("nome");

        if (error || !data) return [];
        return data.map(mapCatalogo);
    },

    async listRegistros(): Promise<RegistroSintoma[]> {
        const scope = await getMpScope();
        if (!scope) return [];

        let query = supabase
            .from("mp_registros_sintomas")
            .select("*")
            .order("created_at", { ascending: false });
        query = applyScope(query, scope);

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapRegistro);
    },

    async registrar(input: {
        sintomas: SintomaSelecionado[];
        intensidade: SintomaIntensidade;
        observacao: string;
        fotoPath?: string;
    }): Promise<RegistroSintoma> {
        const scope = await getMpScope();
        if (!scope?.titularId) throw new Error("Conta sem paciente vinculado.");

        const unidade = await getUnidadeDoPaciente();

        const { data, error } = await supabase
            .from("mp_registros_sintomas")
            .insert({
                titular_id: scope.titularId,
                auth_id: scope.authId,
                parceiro_id: scope.parceiroId,
                unidade_id: unidade?.id ?? null,
                sintomas: input.sintomas,
                intensidade: input.intensidade,
                observacao: input.observacao,
                foto_url: input.fotoPath ?? null,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return mapRegistro(data);
    },

    async marcarWhatsappEnviado(id: string): Promise<void> {
        await supabase
            .from("mp_registros_sintomas")
            .update({ whatsapp_enviado: true })
            .eq("id", id);
    },

    async unidadeAtual(): Promise<Unidade | null> {
        return getUnidadeDoPaciente();
    },

    /**
     * Monta o link do WhatsApp da unidade com o resumo do registro.
     * A foto entra como link assinado de 7 dias (o bucket é privado).
     */
    async montarLinkWhatsapp(registro: RegistroSintoma): Promise<string | null> {
        const unidade = await getUnidadeDoPaciente();
        const numero = (unidade?.whatsappNumero ?? "").replace(/\D/g, "");
        if (!numero) return null;

        const [nome, mensagemPadrao] = await Promise.all([
            getNomePaciente(),
            getMensagemPadrao(),
        ]);

        const linhas: string[] = [];
        if (mensagemPadrao) linhas.push(mensagemPadrao, "");
        if (nome) linhas.push(`Paciente: ${nome}`);
        linhas.push(`Data: ${fmtDataHora(registro.criadoEm)}`);
        linhas.push(
            `Sintomas: ${registro.sintomas.map((s) => s.nome).join(", ") || "não informados"}`
        );
        linhas.push(`Intensidade: ${INTENSIDADE_LABEL[registro.intensidade]}`);
        if (registro.observacao) linhas.push(`Observação: ${registro.observacao}`);

        if (registro.fotoUrl) {
            const link = await assinarArquivo(registro.fotoUrl, 60 * 60 * 24 * 7);
            if (link) linhas.push(`Foto: ${link}`);
        }

        const numeroCompleto = numero.length <= 11 ? `55${numero}` : numero;
        return `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(linhas.join("\n"))}`;
    },
};
