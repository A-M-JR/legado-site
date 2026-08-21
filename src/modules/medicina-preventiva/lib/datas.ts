const TZ = "America/Sao_Paulo";

/** "2026-08-20T14:30:00Z" -> "20/08/2026 14:30" */
export function fmtDataHora(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("pt-BR", {
        timeZone: TZ,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function fmtData(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso.length <= 10 ? `${iso}T12:00:00` : iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("pt-BR", { timeZone: TZ });
}

export function fmtHora(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("pt-BR", {
        timeZone: TZ,
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function fmtDiaSemana(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("pt-BR", {
        timeZone: TZ,
        weekday: "long",
        day: "2-digit",
        month: "long",
    });
}

/** Rótulo relativo: Hoje, Amanhã, em 3 dias, há 2 dias… */
export function rotuloRelativo(iso: string): string {
    if (!iso) return "";
    const alvo = new Date(iso);
    if (Number.isNaN(alvo.getTime())) return "";

    const hoje = new Date();
    const a = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
    const b = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dias = Math.round((a.getTime() - b.getTime()) / 86400000);

    if (dias === 0) return "Hoje";
    if (dias === 1) return "Amanhã";
    if (dias === -1) return "Ontem";
    if (dias > 1) return `Em ${dias} dias`;
    return `Há ${Math.abs(dias)} dias`;
}

/** Valor para <input type="datetime-local"> a partir de um ISO com timezone. */
export function isoParaInputLocal(iso: string): string {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
    )}:${pad(d.getMinutes())}`;
}

/** "2026-08-20T14:30" (hora local do navegador) -> ISO UTC para o banco. */
export function inputLocalParaIso(valor: string): string {
    if (!valor) return "";
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return "";
    return d.toISOString();
}

export function agoraIso(): string {
    return new Date().toISOString();
}

export function horaLabelAgora(): string {
    const agora = new Date();
    return `Hoje — ${agora.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    })}`;
}
