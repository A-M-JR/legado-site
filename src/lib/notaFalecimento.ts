import { supabase } from "@/lib/supabaseClient";
import { formatBR } from "@/utils/formatDateToBR";
import { limparNome } from "@/lib/masks";

export const SITE_URL = "https://legadoeconforto.com.br";

export const TIPOS_CERIMONIA = ["Velório", "Sepultamento", "Cremação", "Missa de 7º dia", "Cerimônia"] as const;

export const FRASES_SUGERIDAS = [
    "A saudade é grande e o nosso amor é para sempre.",
    "Quem amamos nunca morre, apenas parte antes de nós.",
    "Viverá para sempre em nossos corações.",
    "Partiu deixando saudade e um legado de amor.",
    "Sua luz continuará a iluminar nossos caminhos.",
    "Obrigado por cada momento. Descanse em paz.",
] as const;

export type Cerimonia = {
    tipo: string;
    local: string;
    endereco?: string;
    data?: string; // yyyy-MM-dd
    hora?: string; // HH:mm
};

export type NotaFalecimento = {
    homenageado_id: string;
    frase: string | null;
    whatsapp_flores: string | null;
    cerimonias: Cerimonia[];
};

export type Homenageado = {
    id: string;
    nome: string;
    data_nascimento?: string;
    data_falecimento?: string;
    imagem_url?: string;
    falecido?: boolean;
};

const COLUNAS_HOMENAGEADO = "id, nome, data_nascimento, data_falecimento, imagem_url, falecido";

/** Nome sem espaços nas pontas/duplicados (há cadastros como "Maria Antonia "; quebra o *negrito* do WhatsApp). */
export const nomeLimpo = limparNome;

export async function buscarHomenageado(id: string): Promise<Homenageado | null> {
    const { data } = await supabase.from("dependentes").select(COLUNAS_HOMENAGEADO).eq("id", id).maybeSingle();
    const { data: titular } = data
        ? { data: null }
        : await supabase.from("titulares").select(COLUNAS_HOMENAGEADO).eq("id", id).maybeSingle();
    const pessoa = (data ?? titular) as Homenageado | null;
    return pessoa ? { ...pessoa, nome: nomeLimpo(pessoa.nome) } : null;
}

export async function buscarNota(id: string): Promise<NotaFalecimento | null> {
    const { data } = await supabase
        .from("notas_falecimento")
        .select("homenageado_id, frase, whatsapp_flores, cerimonias")
        .eq("homenageado_id", id)
        .maybeSingle();
    if (!data) return null;
    return { ...data, cerimonias: Array.isArray(data.cerimonias) ? data.cerimonias : [] } as NotaFalecimento;
}

/** Data em dd/MM/yyyy, ou "" quando ausente/inválida (a base mistura ISO e dd/MM/yyyy). */
export function dataBR(date?: string | null): string {
    if (!date) return "";
    const formatted = formatBR(date);
    return formatted === "Data não informada" ? "" : formatted;
}

/** "Maria Antônia da Silva" → "maria-antonia-da-silva" (máx. 40 caracteres). */
export function slugNome(nome?: string | null): string {
    return limparNome(nome)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40)
        .replace(/-+$/, "");
}

/**
 * Link curto para compartilhar: /n/maria-antonia-69675667.
 * Só os 8 primeiros hex do id identificam a pessoa (resolvido em api/nota.ts); o nome é para leitura.
 */
export function linkCompartilhamento(id: string, nome?: string | null): string {
    const codigo = id.slice(0, 8).toLowerCase();
    const slug = slugNome(nome);
    return `${SITE_URL}/n/${slug ? `${slug}-` : ""}${codigo}`;
}

export function linkMaps(c: Cerimonia): string {
    const query = [c.local, c.endereco].filter(Boolean).join(", ");
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Link "Adicionar ao Google Agenda" (duração padrão de 2h, fuso de São Paulo). */
export function linkAgenda(c: Cerimonia, nome: string): string | null {
    if (!c.data) return null;
    const [y, m, d] = c.data.split("-").map(Number);
    if (!y || !m || !d) return null;
    const [hh, mm] = (c.hora || "").split(":").map(Number);
    const pad = (n: number) => String(n).padStart(2, "0");

    let dates: string;
    if (Number.isFinite(hh) && Number.isFinite(mm) && c.hora) {
        const fim = new Date(y, m - 1, d, hh + 2, mm);
        dates =
            `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00/` +
            `${fim.getFullYear()}${pad(fim.getMonth() + 1)}${pad(fim.getDate())}T${pad(fim.getHours())}${pad(fim.getMinutes())}00`;
    } else {
        const fim = new Date(y, m - 1, d + 1);
        dates = `${y}${pad(m)}${pad(d)}/${fim.getFullYear()}${pad(fim.getMonth() + 1)}${pad(fim.getDate())}`;
    }

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: `${c.tipo} de ${nome}`,
        dates,
        ctz: "America/Sao_Paulo",
        location: [c.local, c.endereco].filter(Boolean).join(" - "),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Normaliza o número para wa.me (adiciona 55 quando vier só DDD + número). */
export function numeroWhatsApp(raw?: string | null): string | null {
    const digits = (raw || "").replace(/\D/g, "");
    if (digits.length === 10 || digits.length === 11) return `55${digits}`;
    if (digits.length >= 12 && digits.length <= 13) return digits;
    return null;
}

export function linkCoroaFlores(nota: NotaFalecimento, nome: string): string | null {
    const numero = numeroWhatsApp(nota.whatsapp_flores);
    if (!numero) return null;
    const velorio = nota.cerimonias.find((c) => c.tipo === "Velório") ?? nota.cerimonias[0];
    const detalhe = velorio
        ? ` (${velorio.tipo} em ${velorio.local}${velorio.data ? `, ${dataBR(velorio.data)}` : ""}${velorio.hora ? ` às ${velorio.hora}` : ""})`
        : "";
    const texto = `Olá! Gostaria de encomendar uma coroa de flores em homenagem a ${nome}${detalhe}.`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function mensagemWhatsApp(pessoa: Homenageado): string {
    const nome = nomeLimpo(pessoa.nome);
    const falecimento = dataBR(pessoa.data_falecimento);
    const link = linkCompartilhamento(pessoa.id, nome);
    return pessoa.falecido
        ? `Caros familiares, amigos e colegas, lamentamos informar o falecimento de *${nome}*${falecimento ? ` na data ${falecimento}` : ""}.\n\nPara informações do velório e para deixar sua mensagem de carinho à família, acesse: ${link}`
        : `💙 Olá! Gostaria de convidar você para deixar uma recordação especial para *${nome}* no Instituto Legado.\n\nAcesse pelo link: ${link}`;
}
