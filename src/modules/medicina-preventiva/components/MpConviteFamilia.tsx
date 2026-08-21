import { QRCodeCanvas } from "qrcode.react";
import { Share2, X, Copy, Check } from "lucide-react";
import { useState } from "react";
import { buildConviteWhatsAppUrl, buildMpMensagemPublicUrl } from "../lib/convitePublico";

type Props = {
    open: boolean;
    onClose: () => void;
    titularId: string;
    pessoaId: string;
    pessoaNome: string;
};

export function MpConviteFamilia({ open, onClose, titularId, pessoaId, pessoaNome }: Props) {
    const [copiado, setCopiado] = useState(false);

    if (!open) return null;

    const link = buildMpMensagemPublicUrl(titularId, pessoaId);

    async function copiarLink() {
        try {
            await navigator.clipboard.writeText(link);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            setCopiado(false);
        }
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Convite para deixar mensagem"
        >
            <div
                className="bg-white rounded-[2rem] p-7 flex flex-col items-center relative shadow-2xl max-w-sm w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                    aria-label="Fechar"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-[#255f4f] mb-2 text-center pr-8 leading-tight">
                    Convidar para deixar mensagem
                </h3>
                <p className="text-sm text-[#6b8c7d] text-center mb-6 px-2">
                    Quem receber o link escreve uma mensagem para {pessoaNome} sem precisar de
                    cadastro.
                </p>

                <div className="bg-[#f0f9f6] p-6 rounded-3xl mb-4 shadow-inner border border-[#d1e5dc]">
                    <QRCodeCanvas value={link} size={180} level="H" />
                </div>

                <p className="text-[11px] text-[#9db4aa] text-center break-all px-2 mb-4">{link}</p>

                <div className="w-full space-y-2">
                    <button
                        type="button"
                        onClick={() => window.open(buildConviteWhatsAppUrl(link, pessoaNome), "_blank")}
                        className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg w-full hover:shadow-xl transition active:scale-[0.99]"
                    >
                        <Share2 size={20} />
                        Enviar pelo WhatsApp
                    </button>

                    <button
                        type="button"
                        onClick={copiarLink}
                        className="flex items-center justify-center gap-2 border border-[#d1e5dc] text-[#255f4f] font-semibold py-3 rounded-2xl w-full hover:bg-[#f4fbf8] transition"
                    >
                        {copiado ? <Check size={18} /> : <Copy size={18} />}
                        {copiado ? "Link copiado" : "Copiar link"}
                    </button>
                </div>
            </div>
        </div>
    );
}
