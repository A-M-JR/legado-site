export const MI_STORAGE_BUCKET = "titulares";
export const MI_PERFIL_FOLDER = "mi/perfil";
export const MI_REDE_FOLDER = "mi/rede";
export const MI_RECEITAS_FOLDER = "mi/receitas";
export const MI_MEMORIAS_FOLDER = "mi/memorias";
export const MI_HISTORIAS_FOLDER = "mi/historias";

export function isMiFotoUrl(url?: string): boolean {
    return Boolean(url && !url.startsWith("blob:"));
}
