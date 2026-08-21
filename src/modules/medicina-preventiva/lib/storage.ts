/** Fotos de receita seguem o padrão do módulo Melhor Idade (bucket público). */
export const MP_STORAGE_BUCKET = "titulares";
export const MP_RECEITAS_FOLDER = "mp/receitas";
export const MP_MEMORIAS_FOLDER = "mp/memorias";
export const MP_REDE_FOLDER = "mp/rede";

/** Laudos, pedidos de exame e fotos de sintoma vão para o bucket privado. */
export const MP_EXAMES_PASTA = "exames";
export const MP_SINTOMAS_PASTA = "sintomas";

export function isFotoValida(url?: string): boolean {
    return Boolean(url && !url.startsWith("blob:"));
}
