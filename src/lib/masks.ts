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
