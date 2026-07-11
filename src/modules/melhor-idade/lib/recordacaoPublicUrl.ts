export function buildMiRecordacaoPublicUrl(titularId: string, pessoaId: string): string {
    const base =
        import.meta.env.VITE_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        (typeof window !== "undefined" ? window.location.origin : "https://legadoeconforto.com.br");
    return `${base}/melhor-idade/memoria/${titularId}/${pessoaId}`;
}

export function buildWhatsAppShareUrl(link: string, pessoaNome: string): string {
    const text = `💙 Olá! Gostaria de convidar você para deixar uma recordação especial para ${pessoaNome}.\n\nAcesse pelo link: ${link}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
