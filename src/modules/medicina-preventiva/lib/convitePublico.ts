export function buildMpMensagemPublicUrl(titularId: string, pessoaId: string): string {
    const base =
        import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        (typeof window !== "undefined" ? window.location.origin : "https://legadoeconforto.com.br");
    return `${base}/medicina-preventiva/mensagem/${titularId}/${pessoaId}`;
}

export function buildConviteWhatsAppUrl(link: string, pessoaNome: string): string {
    const texto =
        `Olá! Deixe uma mensagem para ${pessoaNome} no aplicativo de acompanhamento.\n\n` +
        `É rapidinho, pelo link: ${link}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
}
