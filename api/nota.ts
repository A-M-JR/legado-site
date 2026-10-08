// Link compartilhável de homenagem (/n/:id → /api/nota?id=:id via vercel.json).
// Robôs de preview (WhatsApp, Facebook, Telegram…) não executam JS, então
// devolvemos um HTML mínimo com as meta tags OG do homenageado e
// redirecionamos o visitante humano para a página React.

const SITE_URL = "https://legadoeconforto.com.br";
const FALLBACK_IMAGE = `${SITE_URL}/logo-ilc.png`;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Homenageado = {
    nome: string;
    data_nascimento: string | null;
    data_falecimento: string | null;
    imagem_url: string | null;
    falecido: boolean | null;
};

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// A base tem datas em ISO (yyyy-MM-dd) e em dd/MM/yyyy; datas inválidas são omitidas.
function formatBR(date: string | null): string {
    const iso = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const br = date?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const [d, m, y] = iso ? [iso[3], iso[2], iso[1]] : br ? [br[1], br[2], br[3]] : [];
    if (!d || !m || !y || Number(m) < 1 || Number(m) > 12 || Number(d) < 1 || Number(d) > 31) return "";
    return `${d}/${m}/${y}`;
}

type Cerimonia = { tipo?: string; local?: string; data?: string; hora?: string };

async function selectFirst<T>(table: string, query: string): Promise<T | null> {
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const res = await fetch(`${url}/rest/v1/${table}?${query}&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as T[];
    return rows[0] ?? null;
}

async function fetchHomenageado(id: string): Promise<Homenageado | null> {
    const query = `id=eq.${id}&select=nome,data_nascimento,data_falecimento,imagem_url,falecido`;
    const pessoa =
        (await selectFirst<Homenageado>("dependentes", query)) ??
        (await selectFirst<Homenageado>("titulares", query));
    // Nomes com espaços sobrando ("Maria Antonia ") ficam feios no título do preview.
    return pessoa ? { ...pessoa, nome: (pessoa.nome ?? "").replace(/\s+/g, " ").trim() } : null;
}

type Nota = { frase: string | null; cerimonias: Cerimonia[] };

async function fetchNota(id: string): Promise<Nota> {
    const nota = await selectFirst<Nota>("notas_falecimento", `homenageado_id=eq.${id}&select=frase,cerimonias`);
    return { frase: nota?.frase ?? null, cerimonias: Array.isArray(nota?.cerimonias) ? nota.cerimonias : [] };
}

/** Hash curto (FNV-1a) dos dados que aparecem na imagem: muda a URL quando a família edita. */
function versao(valor: unknown): string {
    let h = 0x811c9dc5;
    for (const ch of JSON.stringify(valor)) {
        h ^= ch.codePointAt(0)!;
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(36);
}

function renderHtml(targetUrl: string, title: string, description: string, image: string): string {
    const t = escapeHtml(title);
    const d = escapeHtml(description);
    const i = escapeHtml(image);
    const u = escapeHtml(targetUrl);
    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${t}</title>
<meta name="description" content="${d}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Instituto Legado e Conforto" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:url" content="${u}" />
<meta property="og:title" content="${t}" />
<meta property="og:description" content="${d}" />
<meta property="og:image" content="${i}" />
<meta property="og:image:secure_url" content="${i}" />${
        image.includes("/api/og")
            ? `
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />`
            : ""
    }
<meta property="og:image:alt" content="${t}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${t}" />
<meta name="twitter:description" content="${d}" />
<meta name="twitter:image" content="${i}" />
<link rel="canonical" href="${u}" />
<meta http-equiv="refresh" content="0;url=${u}" />
</head>
<body>
<script>location.replace(${JSON.stringify(targetUrl)});</script>
<p><a href="${u}">Continuar para a homenagem</a></p>
</body>
</html>`;
}

export async function GET(request: Request): Promise<Response> {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    if (!UUID_RE.test(id)) {
        return Response.redirect(SITE_URL, 302);
    }

    const [pessoa, nota] = await Promise.all([
        fetchHomenageado(id).catch(() => null),
        fetchNota(id).catch((): Nota => ({ frase: null, cerimonias: [] })),
    ]);
    const cerimonias = nota.cerimonias;
    const targetUrl = pessoa?.falecido ? `${SITE_URL}/nota/${id}` : `${SITE_URL}/recordacoes-publicas/${id}`;

    let title = "Homenagem — Instituto Legado e Conforto";
    let description = "Deixe uma mensagem de carinho e conforto para a família.";
    let image = FALLBACK_IMAGE;

    if (pessoa) {
        const nasc = formatBR(pessoa.data_nascimento);
        const fal = formatBR(pessoa.data_falecimento);
        const datas = [nasc && `★ ${nasc}`, fal && `✝ ${fal}`].filter(Boolean).join("  ");

        title = pessoa.falecido ? `Nota de Falecimento - ${pessoa.nome}` : `Homenagem a ${pessoa.nome}`;
        const velorio = cerimonias.find((c) => c.tipo === "Velório") ?? cerimonias[0];
        const velorioTexto = velorio?.local
            ? ` ${velorio.tipo ?? "Cerimônia"}: ${velorio.local}${velorio.data ? `, ${formatBR(velorio.data)}` : ""}${velorio.hora ? ` às ${velorio.hora}` : ""}.`
            : "";
        description = pessoa.falecido
            ? `Lamentamos informar o falecimento de ${pessoa.nome}${fal ? ` em ${fal}` : ""}.${velorioTexto} Deixe sua mensagem de condolências para a família.`
            : `Deixe uma recordação especial para ${pessoa.nome}.`;
        if (datas) description = `${datas} · ${description}`;
        // Card 1200×630 no visual do memorial (api/og.ts).
        image = `${SITE_URL}/api/og?id=${id}&v=${versao([pessoa, nota.frase, cerimonias[0] ?? null])}`;
    }

    return new Response(renderHtml(targetUrl, title, description, image), {
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
        },
    });
}
