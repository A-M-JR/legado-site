// Imagem de preview (1200×630) da nota de falecimento, no visual do PDF do memorial.
// Usada como og:image por api/nota.ts → aparece como card grande no WhatsApp/Facebook.
// GET /api/og?id=<uuid>[&v=<versão>]  (v só serve para invalidar cache quando a nota muda)

// Satori (layout → SVG) + resvg (SVG → PNG) no runtime Node da Vercel.
// Não usamos o runtime Edge: ele proíbe compilar WebAssembly em tempo de execução fora do Next.js.
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const FONTES = "https://cdn.jsdelivr.net/npm/@fontsource/lora@5.2.5/files";
const RESVG_WASM = "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.4.0/index_bg.wasm";
const W = 1200;
const H = 630;

const COR = {
    pagina: "#f6f1e8",
    fundo: "#fdfaf5",
    moldura: "#e8dcc6",
    dourado: "#c9a96e",
    folha: "#8fb5a2",
    folhaEscura: "#5e8f79",
    titulo: "#2f6b5c",
    texto: "#4a5d54",
    suave: "#8a9b93",
    rosa: "#e9b9bc",
};

type Homenageado = {
    nome: string;
    data_nascimento: string | null;
    data_falecimento: string | null;
    imagem_url: string | null;
    falecido: boolean | null;
};
type Cerimonia = { tipo?: string; local?: string; data?: string; hora?: string };
type Nota = { frase: string | null; cerimonias: Cerimonia[] };

// ---------- dados (mesma consulta de api/nota.ts) ----------

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

async function carregar(id: string): Promise<{ pessoa: Homenageado | null; nota: Nota | null }> {
    const q = `id=eq.${id}&select=nome,data_nascimento,data_falecimento,imagem_url,falecido`;
    const [dep, nota] = await Promise.all([
        selectFirst<Homenageado>("dependentes", q),
        selectFirst<Nota>("notas_falecimento", `homenageado_id=eq.${id}&select=frase,cerimonias`),
    ]);
    const pessoa = dep ?? (await selectFirst<Homenageado>("titulares", q));
    if (pessoa) pessoa.nome = (pessoa.nome ?? "").replace(/\s+/g, " ").trim();
    if (nota && !Array.isArray(nota.cerimonias)) nota.cerimonias = [];
    return { pessoa, nota };
}

function formatBR(date: string | null | undefined): string {
    const iso = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const br = date?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const [d, m, y] = iso ? [iso[3], iso[2], iso[1]] : br ? [br[1], br[2], br[3]] : [];
    if (!d || !m || !y || Number(m) < 1 || Number(m) > 12 || Number(d) < 1 || Number(d) > 31) return "";
    return `${d}/${m}/${y}`;
}

/** Foto reduzida (Supabase Image Transformation) como data URL JPEG; cai para a original se falhar. */
async function fotoDataUrl(url: string | null): Promise<string | null> {
    if (!url) return null;
    const reduzida = url.includes("/storage/v1/object/public/")
        ? url.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/") + "?width=360&height=360&resize=cover&quality=80"
        : null;
    for (const tentativa of [reduzida, url]) {
        if (!tentativa) continue;
        try {
            const res = await fetch(tentativa, { headers: { Accept: "image/jpeg,image/png" } });
            const tipo = res.headers.get("content-type") ?? "";
            if (!res.ok || !/image\/(jpeg|png)/.test(tipo)) continue;
            const bytes = new Uint8Array(await res.arrayBuffer());
            return `data:${tipo.split(";")[0]};base64,${base64(bytes)}`;
        } catch {
            // tenta a próxima
        }
    }
    return null;
}

// Fontes e wasm ficam em memória entre execuções da mesma instância da função.
const fontesCache = new Map<string, Promise<ArrayBuffer>>();
function fonte(arquivo: string): Promise<ArrayBuffer> {
    if (!fontesCache.has(arquivo)) {
        const p = fetch(`${FONTES}/${arquivo}`).then((res) => {
            if (!res.ok) throw new Error(`fonte ${arquivo}: HTTP ${res.status}`);
            return res.arrayBuffer();
        });
        p.catch(() => fontesCache.delete(arquivo));
        fontesCache.set(arquivo, p);
    }
    return fontesCache.get(arquivo)!;
}

let resvgPronto: Promise<void> | null = null;
function iniciarResvg(): Promise<void> {
    if (!resvgPronto) {
        resvgPronto = fetch(RESVG_WASM)
            .then((res) => {
                if (!res.ok) throw new Error(`resvg wasm: HTTP ${res.status}`);
                return res.arrayBuffer();
            })
            .then((wasm) => initWasm(wasm));
        resvgPronto.catch(() => (resvgPronto = null));
    }
    return resvgPronto;
}

// ---------- desenho ----------

/** Coroa de folhas (mesma geometria de src/components/recordacoes/Ornamentos.tsx) como SVG. */
function coroaSvg(size: number): string {
    const c = size / 2;
    const r = size / 2 - 18;
    const partes: string[] = [];
    const ramo = (inicio: number, fim: number, lado: 1 | -1) => {
        const passos = 13;
        for (let i = 0; i < passos; i++) {
            const t = inicio + ((fim - inicio) * i) / (passos - 1);
            const rad = (t * Math.PI) / 180;
            const off = i % 2 === 0 ? 10 : -10;
            const x = c + (r + off) * Math.cos(rad);
            const y = c + (r + off) * Math.sin(rad);
            const rot = t + 90 * lado + (i % 2 === 0 ? -28 : 28) * lado;
            const e = 1 - (i / passos) * 0.45;
            partes.push(
                `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(16 * e).toFixed(1)}" ry="${(6.6 * e).toFixed(1)}" ` +
                    `transform="rotate(${rot.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${i % 3 === 0 ? COR.folhaEscura : COR.folha}" opacity="0.85"/>`
            );
        }
    };
    ramo(100, 235, 1);
    ramo(80, -55, -1);
    const p = (a: number) => [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)];
    const arco = (de: number, ate: number) => {
        const [x1, y1] = p(de);
        const [x2, y2] = p(ate);
        return `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 ${ate > de ? 1 : 0} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${COR.folhaEscura}" stroke-width="2" fill="none" opacity="0.6"/>`;
    };
    const flor = [0, 72, 144, 216, 288]
        .map((a) => `<ellipse cx="0" cy="-10" rx="7" ry="11" fill="${COR.rosa}" transform="rotate(${a})"/>`)
        .join("");
    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
        arco(95, 238) +
        arco(85, -58) +
        partes.join("") +
        `<g transform="translate(${c} ${c + r + 3})">${flor}<circle r="5.5" fill="${COR.dourado}"/></g>` +
        `</svg>`
    );
}

/** Base64 sem Buffer (não existe no runtime Edge). */
function base64(bytes: Uint8Array): string {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin);
}

const svgUrl = (svg: string) => `data:image/svg+xml;base64,${base64(new TextEncoder().encode(svg))}`;

const ICONE_ESTRELA = svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${COR.suave}" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>`
);
const ICONE_CRUZ = svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${COR.suave}" d="M10.5 2h3v6h5.5v3h-5.5v11h-3V11H5V8h5.5z"/></svg>`
);

// Elemento no formato que o Satori entende (equivalente a JSX, sem precisar de React no build da função).
type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: (El | string | null | false)[]): El => ({
    type,
    // O Satori exige display explícito em blocos com mais de um filho; flex é o padrão aqui.
    props: { style: { display: "flex", ...style }, children: children.filter((c) => c !== null && c !== false) },
});
const img = (src: string, style: Record<string, unknown>): El => ({ type: "img", props: { src, style } });

function desenhar(pessoa: Homenageado | null, nota: Nota | null, foto: string | null): El {
    const nome = pessoa?.nome || "Homenagem";
    const falecido = !!pessoa?.falecido;
    const nasc = formatBR(pessoa?.data_nascimento);
    const fal = falecido ? formatBR(pessoa?.data_falecimento) : "";
    const frase = nota?.frase || "Viverá para sempre em nossos corações.";
    const velorio = falecido ? nota?.cerimonias.find((c) => c.tipo === "Velório") ?? nota?.cerimonias[0] : undefined;
    const tamanhoNome = nome.length <= 16 ? 72 : nome.length <= 24 ? 60 : nome.length <= 34 ? 50 : 42;
    const COROA = 420;
    const FOTO = 300;

    const data = (icone: string, texto: string) =>
        h("div", { display: "flex", alignItems: "center", gap: 10 }, img(icone, { width: 26, height: 26 }), texto);

    return h(
        "div",
        { width: W, height: H, display: "flex", padding: 26, background: COR.pagina, fontFamily: "Lora" },
        h(
            "div",
            {
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: 52,
                padding: "0 70px 0 48px",
                background: COR.fundo,
                border: `2px solid ${COR.moldura}`,
                borderRadius: 36,
                position: "relative",
            },
            // Foto com coroa
            h(
                "div",
                { position: "relative", width: COROA, height: COROA, display: "flex", flexShrink: 0 },
                img(svgUrl(coroaSvg(COROA)), { position: "absolute", top: 0, left: 0, width: COROA, height: COROA }),
                h(
                    "div",
                    {
                        position: "absolute",
                        top: (COROA - FOTO) / 2,
                        left: (COROA - FOTO) / 2,
                        width: FOTO,
                        height: FOTO,
                        borderRadius: 9999,
                        border: "8px solid #ffffff",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eef3f1",
                        boxShadow: "0 8px 24px rgba(47,107,92,0.20)",
                    },
                    foto
                        ? img(foto, { width: FOTO - 16, height: FOTO - 16, objectFit: "cover" })
                        : h("div", { fontSize: 120, fontWeight: 700, color: COR.titulo }, nome.charAt(0).toUpperCase())
                )
            ),
            // Texto
            h(
                "div",
                { display: "flex", flexDirection: "column", flex: 1, minWidth: 0 },
                h(
                    "div",
                    { fontSize: 22, fontWeight: 700, letterSpacing: 5, color: COR.dourado },
                    !pessoa ? "INSTITUTO LEGADO E CONFORTO" : falecido ? "NOTA DE FALECIMENTO" : "HOMENAGEM"
                ),
                h("div", { marginTop: 14, fontSize: tamanhoNome, fontWeight: 700, lineHeight: 1.1, color: COR.titulo }, nome),
                nasc || fal
                    ? h(
                          "div",
                          { display: "flex", gap: 30, marginTop: 18, fontSize: 30, color: COR.suave },
                          nasc ? data(ICONE_ESTRELA, nasc) : null,
                          fal ? data(ICONE_CRUZ, fal) : null
                      )
                    : null,
                h("div", { width: 140, height: 2, background: COR.dourado, opacity: 0.6, marginTop: 26 }),
                h("div", { marginTop: 24, fontSize: 30, fontStyle: "italic", lineHeight: 1.4, color: COR.texto }, `“${frase}”`),
                velorio?.local
                    ? h(
                          "div",
                          { display: "flex", flexDirection: "column", marginTop: 26 },
                          h("div", { fontSize: 18, fontWeight: 700, letterSpacing: 3, color: COR.dourado }, (velorio.tipo || "Cerimônia").toUpperCase()),
                          h(
                              "div",
                              { marginTop: 6, fontSize: 26, fontWeight: 700, color: COR.titulo },
                              [velorio.local, formatBR(velorio.data), velorio.hora ? `${velorio.hora}h` : ""].filter(Boolean).join(" · ")
                          )
                      )
                    : null
            ),
            h(
                "div",
                { position: "absolute", bottom: 22, right: 40, fontSize: 20, color: COR.suave },
                "Instituto Legado e Conforto · legadoeconforto.com.br"
            )
        )
    );
}

export async function GET(request: Request): Promise<Response> {
    const id = new URL(request.url).searchParams.get("id")?.trim() ?? "";
    const { pessoa, nota } = UUID_RE.test(id) ? await carregar(id).catch(() => ({ pessoa: null, nota: null })) : { pessoa: null, nota: null };

    try {
        const [foto, lora700, lora400, lora400i] = await Promise.all([
            fotoDataUrl(pessoa?.imagem_url ?? null),
            fonte("lora-latin-700-normal.woff"),
            fonte("lora-latin-400-normal.woff"),
            fonte("lora-latin-400-italic.woff"),
            iniciarResvg(),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const svg = await satori(desenhar(pessoa, nota, foto) as any, {
            width: W,
            height: H,
            fonts: [
                { name: "Lora", data: lora700, weight: 700, style: "normal" },
                { name: "Lora", data: lora400, weight: 400, style: "normal" },
                { name: "Lora", data: lora400i, weight: 400, style: "italic" },
            ],
        });
        const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();

        return new Response(png, {
            headers: {
                "Content-Type": "image/png",
                // A URL inclui ?v= com a versão dos dados, então pode ficar em cache por bastante tempo.
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
            },
        });
    } catch (erro) {
        console.error("[og] falha ao gerar imagem", erro);
        return new Response(`Falha ao gerar imagem: ${erro instanceof Error ? erro.message : String(erro)}`, {
            status: 500,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
        });
    }
}
