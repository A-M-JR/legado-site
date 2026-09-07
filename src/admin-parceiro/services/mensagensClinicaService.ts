import { supabase } from "@/lib/supabaseClient";

/**
 * Mensagens da clínica para o paciente. Usa a RPC SECURITY DEFINER
 * mp_enviar_mensagem_clinica (016) — o paciente lê no mural "Minha família"
 * (pessoa_id='clinica').
 */
export const mensagensClinicaService = {
    async enviar(params: {
        titularId: string;
        mensagem: string;
        remetente: string;
        mediaUrl?: string | null;
        mediaTipo?: "foto" | "video" | null;
    }): Promise<void> {
        const { error } = await supabase.rpc("mp_enviar_mensagem_clinica", {
            p_titular_id: params.titularId,
            p_mensagem: params.mensagem,
            p_remetente: params.remetente,
            p_media_url: params.mediaUrl ?? null,
            p_media_tipo: params.mediaTipo ?? null,
        });
        if (error) throw new Error(error.message);
    },
};
