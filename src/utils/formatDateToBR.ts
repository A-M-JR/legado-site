import dayjs from 'dayjs'

export function formatDateToBR(date: string | Date | null | undefined): string {
    if (!date) return '-'

    const parsed = dayjs(date)
    return parsed.isValid() ? parsed.format('DD/MM/YYYY') : '-'
}
