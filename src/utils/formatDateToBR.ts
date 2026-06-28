import { parse, isValid, format, isAfter, startOfDay } from 'date-fns';

function parseBR(dateStr: string): Date | null {
    const dt = parse(dateStr, 'dd/MM/yyyy', new Date());
    return isValid(dt) ? dt : null;
}

export function isValidDateBR(dateStr: string): boolean {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;

    const [day, month, year] = dateStr.split('/').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return false;

    const dt = parseBR(dateStr);
    if (!dt) return false;
    if (isAfter(startOfDay(dt), startOfDay(new Date()))) return false;

    return dt.getDate() === day && dt.getMonth() + 1 === month && dt.getFullYear() === year;
}

export function checkValidDateBR(dateStr: string): {
    valid: boolean;
    error?: string;
} {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };
    }

    const [day, month, year] = dateStr.split('/').map(Number);
    if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
        return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };
    }

    const dt = parseBR(dateStr);
    if (!dt) return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };

    if (isAfter(startOfDay(dt), startOfDay(new Date()))) {
        return { valid: false, error: "Não é possível informar uma data futura!" };
    }

    if (dt.getDate() !== day || dt.getMonth() + 1 !== month || dt.getFullYear() !== year) {
        return { valid: false, error: "Data inválida. Use o formato DD/MM/AAAA." };
    }

    return { valid: true };
}

export function formatBR(date?: string): string {
    if (!date) return "Data não informada";

    let parsed = parse(date, 'yyyy-MM-dd', new Date());
    if (!isValid(parsed)) {
        parsed = parseBR(date);
    }

    if (!parsed || !isValid(parsed)) return "Data não informada";
    return format(parsed, 'dd/MM/yyyy');
}
