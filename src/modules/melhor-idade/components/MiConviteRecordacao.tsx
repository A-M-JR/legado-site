import { QRCodeCanvas } from "qrcode.react";
import { Share2, X } from "lucide-react";
import { buildMiRecordacaoPublicUrl, buildWhatsAppShareUrl } from "../lib/recordacaoPublicUrl";

type Props = {
    open: boolean;
    onClose: () => void;
    titularId: string;
    pessoaId: string;
    pessoaNome: string;
};

export function MiConviteRecordacao({ open, onClose, titularId, pessoaId, pessoaNome }: Props) {
    if (!open) return null;

    const link = buildMiRecordacaoPublicUrl(titularId, pessoaId);

    function shareWhatsApp() {
        window.open(buildWhatsAppShareUrl(link, pessoaNome), "_blank");
    }

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="QR Code para compartilhamento"
        >
            <div
                className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center relative shadow-2xl max-w-sm w-full border-4 border-white"
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
                    Convide alguém especial 💙
                </h3>
                <p className="text-sm text-[#6b8c7d] text-center mb-6 px-2">
                    Compartilhe o QR Code ou link para {pessoaNome} receber recordações de familiares e amigos.
                </p>

                <div className="bg-[#f0f9f6] p-6 rounded-3xl mb-4 shadow-inner border border-emerald-100">
                    <QRCodeCanvas value={link} size={180} level="H" />
                </div>

                <p className="text-[11px] text-[#9db4aa] text-center break-all px-2 mb-4">{link}</p>

                <button
                    type="button"
                    onClick={shareWhatsApp}
                    className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg w-full hover:shadow-xl transition active:scale-[0.99]"
                >
                    <Share2 size={20} />
                    Enviar pelo WhatsApp
                </button>
            </div>
        </div>
    );
}
