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

    return dt.date() === day && dt.month() + 1 === month && dt.year() === year;
}

export function formatBR(date?: string): string {
    if (!date) return "Data não informada";

    const parsed = dayjs(date, ['YYYY-MM-DD', 'DD/MM/YYYY'], true);

    if (!parsed.isValid()) return "Data não informada";
    return parsed.format('DD/MM/YYYY');
}
