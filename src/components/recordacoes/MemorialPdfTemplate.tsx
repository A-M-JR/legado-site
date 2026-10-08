import { forwardRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { User } from "lucide-react";
import logoVerde from "@/assets/Legado - Verde.png";
import { COR, Coroa, Divisor, Raminho } from "./Ornamentos";
import { FRASES_SUGERIDAS, dataBR, type Homenageado, type NotaFalecimento } from "@/lib/notaFalecimento";

// Template A4 (794×1123 a 96dpi) convertido em PNG → PDF por html-to-image + jsPDF.
// Usa estilos inline para o resultado não depender do CSS da página.

const MAX_CERIMONIAS_PDF = 4;

type Props = {
    person: Homenageado | null;
    nota: NotaFalecimento | null;
    qrLink: string;
};

const MemorialPdfTemplate = forwardRef<HTMLDivElement, Props>(function MemorialPdfTemplate({ person, nota, qrLink }, ref) {
    const cerimonias = (person?.falecido ? nota?.cerimonias ?? [] : []).slice(0, MAX_CERIMONIAS_PDF);
    const compacto = cerimonias.length > 0;
    const frase = nota?.frase || FRASES_SUGERIDAS[2];
    const nascimento = dataBR(person?.data_nascimento);
    const falecimento = person?.falecido ? dataBR(person?.data_falecimento) : "";
    const fotoSize = compacto ? 150 : 190;
    const coroaSize = fotoSize + 64;

    return (
        <div
            ref={ref}
            style={{
                width: "794px",
                height: "1123px",
                position: "relative",
                boxSizing: "border-box",
                padding: "34px",
                background: COR.fundo,
                fontFamily: '"Lora", Georgia, serif',
                color: COR.texto,
            }}
        >
            {/* Moldura */}
            <div
                style={{
                    position: "relative",
                    height: "100%",
                    boxSizing: "border-box",
                    border: `1.5px solid ${COR.moldura}`,
                    borderRadius: "28px",
                    padding: "30px 48px 26px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    overflow: "hidden",
                }}
            >
                <Raminho style={{ bottom: "8px", right: "4px", transform: "rotate(185deg)" }} />
                <Raminho style={{ bottom: "8px", left: "4px", transform: "rotate(185deg) scaleX(-1)" }} />

                {/* Cabeçalho */}
                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <img src={logoVerde} alt="Legado" style={{ height: "48px" }} />
                    <p style={{ margin: "4px 0 0 0", fontStyle: "italic", fontSize: "15px", color: COR.suave, textAlign: "right", lineHeight: 1.4, maxWidth: "240px" }}>
                        Porque toda vida merece ser lembrada com carinho!
                    </p>
                </div>

                {/* Conteúdo distribuído na altura disponível (sem vazios) */}
                <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-evenly" }}>
                    {/* Foto com coroa de folhas */}
                    <div style={{ position: "relative", width: `${coroaSize}px`, height: `${coroaSize}px`, flexShrink: 0 }}>
                        <Coroa size={coroaSize} />
                        <div
                            style={{
                                position: "absolute",
                                top: "32px",
                                left: "32px",
                                width: `${fotoSize}px`,
                                height: `${fotoSize}px`,
                                borderRadius: "9999px",
                                overflow: "hidden",
                                border: "5px solid #ffffff",
                                boxShadow: "0 6px 18px rgba(47,107,92,0.18)",
                                background: "#eef3f1",
                            }}
                        >
                            {person?.imagem_url ? (
                                <img src={person.imagem_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#c2d3cc" }}>
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Nome, datas, frase */}
                    <div style={{ textAlign: "center" }}>
                        <h1 style={{ margin: 0, fontSize: "40px", lineHeight: 1.15, fontWeight: 700, color: COR.titulo }}>{person?.nome}</h1>
                        {(nascimento || falecimento) && (
                            <p style={{ margin: "10px 0 0", fontSize: "18px", color: COR.suave, display: "flex", gap: "24px", justifyContent: "center" }}>
                                {nascimento && <span>★ {nascimento}</span>}
                                {falecimento && <span>✝ {falecimento}</span>}
                            </p>
                        )}
                        <p style={{ margin: "16px auto 0", maxWidth: "560px", fontSize: "21px", fontStyle: "italic", lineHeight: 1.45, color: COR.texto }}>
                            “{frase}”
                        </p>
                    </div>

                    <Divisor />

                    {/* Cerimônias */}
                    {compacto && (
                        <div style={{ width: "100%", display: "grid", gridTemplateColumns: cerimonias.length > 1 ? "1fr 1fr" : "1fr", gap: "14px" }}>
                            {cerimonias.map((c, i) => (
                                <div key={i} style={{ background: "#ffffff", border: `1px solid ${COR.moldura}`, borderRadius: "18px", padding: "14px 18px", textAlign: "center" }}>
                                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: COR.dourado }}>{c.tipo}</p>
                                    <p style={{ margin: "4px 0 0", fontSize: "19px", fontWeight: 700, color: COR.titulo }}>{c.local}</p>
                                    {(c.data || c.hora) && (
                                        <p style={{ margin: "4px 0 0", fontSize: "15px" }}>
                                            {[dataBR(c.data), c.hora && `${c.hora}h`].filter(Boolean).join(" · ")}
                                        </p>
                                    )}
                                    {c.endereco && <p style={{ margin: "4px 0 0", fontSize: "13px", color: COR.suave, lineHeight: 1.35 }}>{c.endereco}</p>}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Convite de conforto + QR */}
                    <div
                        style={{
                            width: "100%",
                            background: "#ffffff",
                            border: `1px solid ${COR.moldura}`,
                            borderRadius: "24px",
                            padding: compacto ? "20px 26px" : "26px 30px",
                            display: "flex",
                            flexDirection: compacto ? "row" : "column",
                            alignItems: "center",
                            gap: compacto ? "26px" : "16px",
                            textAlign: compacto ? "left" : "center",
                            boxShadow: "0 4px 14px rgba(201,169,110,0.12)",
                        }}
                    >
                        <div style={{ flex: compacto ? 1 : undefined }}>
                            <p style={{ margin: 0, fontSize: compacto ? "22px" : "26px", fontWeight: 700, color: COR.titulo }}>
                                Deixe sua recordação 💙
                            </p>
                            <p style={{ margin: compacto ? "10px 0 0" : "10px auto 0", fontSize: compacto ? "15px" : "18px", lineHeight: 1.5, maxWidth: "560px" }}>
                                Uma mensagem de carinho certamente levará conforto e alegria aos corações entristecidos da família.
                            </p>
                            <p style={{ margin: compacto ? "8px 0 0" : "8px auto 0", fontSize: compacto ? "14px" : "16px", color: COR.suave, maxWidth: "560px" }}>
                                Aponte a câmera do celular para o QR Code e deixe quantas mensagens, fotos e vídeos desejar. ✍️ 📸
                            </p>
                        </div>
                        <div style={{ padding: "10px", background: "#ffffff", border: `2px solid ${COR.folha}`, borderRadius: "18px", flexShrink: 0 }}>
                            {qrLink && <QRCodeCanvas value={qrLink} size={compacto ? 150 : 190} level="H" fgColor="#1f3d34" />}
                        </div>
                    </div>
                </div>

                {/* Rodapé */}
                <p style={{ margin: "14px 0 0", fontSize: "13px", color: COR.suave, letterSpacing: "0.04em" }}>
                    Instituto Legado e Conforto · legadoeconforto.com.br
                </p>
            </div>
        </div>
    );
});

export default MemorialPdfTemplate;
