import type { CSSProperties } from "react";

// Ornamentos compartilhados entre o PDF do memorial e a página pública da nota.
// Estilos inline para renderizar igual no html-to-image.

export const COR = {
    fundo: "#fdfaf5",
    moldura: "#e8dcc6",
    dourado: "#c9a96e",
    folha: "#8fb5a2",
    folhaEscura: "#5e8f79",
    titulo: "#2f6b5c",
    texto: "#4a5d54",
    suave: "#8a9b93",
    rosa: "#e9b9bc",
};

/** Ramo de folhas ao longo de um arco (usado para a coroa ao redor da foto). */
export function Coroa({ size }: { size: number }) {
    const c = size / 2;
    const r = size / 2 - 14;
    const folhas: JSX.Element[] = [];
    const ramo = (inicio: number, fim: number, lado: 1 | -1) => {
        const passos = 13;
        for (let i = 0; i < passos; i++) {
            const t = inicio + ((fim - inicio) * i) / (passos - 1);
            const rad = (t * Math.PI) / 180;
            const off = i % 2 === 0 ? 7 : -7;
            const x = c + (r + off) * Math.cos(rad);
            const y = c + (r + off) * Math.sin(rad);
            const rot = t + 90 * lado + (i % 2 === 0 ? -28 : 28) * lado;
            const escala = 1 - (i / passos) * 0.45;
            folhas.push(
                <ellipse
                    key={`${lado}-${i}`}
                    cx={x}
                    cy={y}
                    rx={11 * escala}
                    ry={4.6 * escala}
                    transform={`rotate(${rot} ${x} ${y})`}
                    fill={i % 3 === 0 ? COR.folhaEscura : COR.folha}
                    opacity={0.85}
                />
            );
        }
    };
    ramo(100, 235, 1);
    ramo(80, -55, -1);

    const arco = (de: number, ate: number) => {
        const p = (a: number) => [c + r * Math.cos((a * Math.PI) / 180), c + r * Math.sin((a * Math.PI) / 180)];
        const [x1, y1] = p(de);
        const [x2, y2] = p(ate);
        return `M ${x1} ${y1} A ${r} ${r} 0 0 ${ate > de ? 1 : 0} ${x2} ${y2}`;
    };

    return (
        <svg width={size} height={size} style={{ position: "absolute", inset: 0 }} aria-hidden>
            <path d={arco(95, 238)} stroke={COR.folhaEscura} strokeWidth={1.4} fill="none" opacity={0.6} />
            <path d={arco(85, -58)} stroke={COR.folhaEscura} strokeWidth={1.4} fill="none" opacity={0.6} />
            {folhas}
            {/* Florzinha no encontro dos ramos */}
            <g transform={`translate(${c} ${c + r + 2})`}>
                {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx={0} cy={-7} rx={5} ry={8} fill={COR.rosa} transform={`rotate(${a})`} />
                ))}
                <circle r={4} fill={COR.dourado} />
            </g>
        </svg>
    );
}

/** Raminho decorativo reto com folhas alternadas (cantos da página). */
export function Raminho({ style }: { style: CSSProperties }) {
    const folhas = [0, 1, 2, 3, 4, 5];
    return (
        <svg width={130} height={60} viewBox="0 0 130 60" style={{ position: "absolute", ...style }} aria-hidden>
            <path d="M4 52 Q 60 40 124 10" stroke={COR.folha} strokeWidth={1.5} fill="none" />
            {folhas.map((i) => {
                const t = (i + 1) / 7;
                const x = 4 + 120 * t;
                const y = 52 - 42 * t * t - 4 * t;
                const lado = i % 2 === 0 ? -1 : 1;
                return (
                    <ellipse
                        key={i}
                        cx={x}
                        cy={y + lado * 6}
                        rx={9 - i * 0.6}
                        ry={3.8 - i * 0.2}
                        fill={COR.folha}
                        opacity={0.7}
                        transform={`rotate(${-25 + lado * 35} ${x} ${y + lado * 6})`}
                    />
                );
            })}
        </svg>
    );
}

export function Divisor() {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
            <div style={{ width: "90px", height: "1px", background: COR.dourado, opacity: 0.6 }} />
            <svg width={40} height={20} viewBox="0 0 40 20" aria-hidden>
                <ellipse cx={11} cy={10} rx={9} ry={3.6} fill={COR.folha} transform="rotate(-25 11 10)" />
                <ellipse cx={29} cy={10} rx={9} ry={3.6} fill={COR.folha} transform="rotate(25 29 10)" />
                <circle cx={20} cy={13} r={3} fill={COR.dourado} />
            </svg>
            <div style={{ width: "90px", height: "1px", background: COR.dourado, opacity: 0.6 }} />
        </div>
    );
}
