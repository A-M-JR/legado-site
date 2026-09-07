import { supabase } from "@/lib/supabaseClient";
import { getMpScope, scopePayload } from "./mpScope";

/**
 * Consentimento LGPD do módulo Medicina Preventiva. Um aceite por versão do
 * termo; ao mudar MP_TERMO_VERSAO, o paciente precisa aceitar de novo.
 */
export const consentimentoService = {
    async jaAceitou(versao: string): Promise<boolean> {
        const scope = await getMpScope();
        if (!scope) return false;

        let query = supabase
            .from("mp_consentimentos")
            .select("id", { count: "exact", head: true })
            .eq("versao", versao);

        query = scope.titularId
            ? query.eq("titular_id", scope.titularId)
            : query.eq("auth_id", scope.authId);

        const { count } = await query;
        return (count ?? 0) > 0;
    },

    async registrarAceite(versao: string): Promise<void> {
        const scope = await getMpScope();
        if (!scope) throw new Error("Sessão não identificada.");

        const { error } = await supabase.from("mp_consentimentos").insert({
            ...scopePayload(scope),
            versao,
        });
        if (error) throw new Error(error.message);
    },
};
