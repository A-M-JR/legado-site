// Tema visual do app Legado (/legado-app). Ver src/styles/legado-tema.css.
// Para voltar ao visual antigo: VITE_LEGADO_TEMA=classico (Vercel → Environment Variables) e redeploy.

export type LegadoTema = "classico" | "memorial";

const configurado = import.meta.env.VITE_LEGADO_TEMA as string | undefined;

export const LEGADO_TEMA: LegadoTema = configurado === "classico" ? "classico" : "memorial";

export const temaMemorial = LEGADO_TEMA === "memorial";

export function aplicarLegadoTema() {
    document.documentElement.dataset.legadoTema = LEGADO_TEMA;
}
