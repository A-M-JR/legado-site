import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

export function isValidDateBR(dateStr: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);

    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        year < 1900 || year > 2100
    ) return false;

    const dt = dayjs(dateStr, 'DD/MM/YYYY', true);
    if (!dt.isValid()) return false;
    if (dt.isAfter(dayjs(), 'day')) return false; // **Não aceita data futura**

    return dt.date() === day && dt.month() + 1 === month && dt.year() === year;
}

export function checkValidDateBR(dateStr: string): {
    valid: boolean;
    error?: string;
} {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };
    }

    const [day, month, year] = dateStr.split('/').map(Number);

    if (
        month < 1 || month > 12 ||
        day < 1 || day > 31 ||
        year < 1900 || year > 2100
    ) return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };

    const dt = dayjs(dateStr, 'DD/MM/YYYY', true);
    if (!dt.isValid()) return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };

    const now = dayjs();
    if (dt.isAfter(now, 'day')) {
        return { valid: false, error: "Não é possível informar uma data futura!" };
    }

    if (dt.date() !== day || dt.month() + 1 !== month || dt.year() !== year) {
        return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };
    }

    return { valid: true };
}

export function formatBR(date?: string): string {
    if (!date) return "Data não informada";

    const parsed = dayjs(date, ['YYYY-MM-DD', 'DD/MM/YYYY'], true);

    if (!parsed.isValid()) return "Data não informada";
    return parsed.format('DD/MM/YYYY');
}
