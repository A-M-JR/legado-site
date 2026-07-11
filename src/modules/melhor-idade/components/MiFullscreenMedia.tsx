import { X } from "lucide-react";
import { isVideoMediaUrl } from "@/lib/validation";

type MiFullscreenMediaProps = {
    open: boolean;
    url: string | null;
    tipo?: "foto" | "video";
    alt?: string;
    onClose: () => void;
};

export function MiFullscreenMedia({ open, url, tipo, alt, onClose }: MiFullscreenMediaProps) {
    if (!open || !url) return null;

    const isVideo = tipo === "video" || isVideoMediaUrl(url);

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label={isVideo ? "Vídeo em tela cheia" : "Foto em tela cheia"}
        >
            <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 z-10 h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
                aria-label="Fechar"
            >
                <X className="h-6 w-6" />
            </button>
            {isVideo ? (
                <video
                    src={url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[85vh] rounded-xl"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <img
                    src={url}
                    alt={alt || "Foto"}
                    className="max-w-full max-h-[85vh] rounded-xl object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
}
