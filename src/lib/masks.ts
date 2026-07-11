/**
 * Funções utilitárias de máscara para inputs brasileiros.
 * Uso: onChange={(e) => setSetter(maskCPF(e.target.value))}
 * Ao salvar no banco, limpe com: valor.replace(/\D/g, "")
 */

/** CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
    return value
        .replace(/\D/g, "")
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** CNPJ: 00.000.000/0000-00 */
export function maskCNPJ(value: string): string {
    return value
        .replace(/\D/g, "")
        .slice(0, 14)
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Telefone: (00) 00000-0000 ou (00) 0000-0000 */
export function maskTelefone(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 10) {
        // Fixo: (00) 0000-0000
        return digits
            .replace(/(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
    }
    // Celular: (00) 00000-0000
    return digits
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/** Data: DD/MM/AAAA */
export function maskDataBR(value: string): string {
    let v = value.replace(/\D/g, "");
    if (v.length > 2 && v.length <= 4) v = v.replace(/(\d{2})(\d+)/, "$1/$2");
    else if (v.length > 4) v = v.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
    return v.slice(0, 10);
}

export function isDataBRValida(value: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return false;
    const [d, m, y] = value.split("/").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function dataBRParaISO(value: string): string {
    const [d, m, y] = value.split("/");
    if (!d || !m || !y || y.length !== 4) return "";
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function dataISOParaBR(iso: string): string {
    if (!iso) return "";
    if (iso.includes("/")) return iso;
    const [y, m, d] = iso.split("T")[0].split("-");
    if (!y || !m || !d) return "";
    return `${d}/${m}/${y}`;
}

export function isDataISOValida(iso: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
    const [y, m, d] = iso.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

const MESES_LONGOS = [
    "janeiro",
    "fevereiro",
    "março",
    "abril",
    "maio",
    "junho",
    "julho",
    "agosto",
    "setembro",
    "outubro",
    "novembro",
    "dezembro",
];

export function formatDataLonga(iso: string): string {
    if (!iso || !isDataISOValida(iso)) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} de ${MESES_LONGOS[m - 1]} de ${y}`;
}

/** Dosagem: números, vírgula/ponto e unidade (mg, ml, g, UI, %) */
export function maskDosagem(value: string): string {
    return value
        .replace(/[^\d.,\sA-Za-z%/]/g, "")
        .replace(/\s{2,}/g, " ")
        .slice(0, 24);
}

/** Frequência livre ou intervalo (ex: 1x ao dia, 8/8h) */
export function maskFrequencia(value: string): string {
    return value
        .replace(/[^\d/xX,\sao de horas]/gi, "")
        .replace(/\s{2,}/g, " ")
        .slice(0, 40);
}
