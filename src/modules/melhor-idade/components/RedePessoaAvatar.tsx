import { useRef, useState } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { uploadImagem } from "@/lib/uploadImage";
import { MI_REDE_FOLDER, MI_STORAGE_BUCKET } from "../lib/storage";

interface RedePessoaAvatarProps {
    id: string;
    fotoUrl?: string;
    nome?: string;
    onFotoChange: (url: string) => void;
    onUploadingChange?: (id: string, uploading: boolean) => void;
}

export function RedePessoaAvatar({
    id,
    fotoUrl,
    nome,
    onFotoChange,
    onUploadingChange,
}: RedePessoaAvatarProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    const exibir = preview || fotoUrl;

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setPreview(URL.createObjectURL(file));
        setEnviando(true);
        onUploadingChange?.(id, true);

        const url = await uploadImagem({
            file,
            folder: MI_REDE_FOLDER,
            bucket: MI_STORAGE_BUCKET,
        });

        setEnviando(false);
        onUploadingChange?.(id, false);
        setPreview(null);

        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto.",
                variant: "destructive",
            });
            return;
        }

        onFotoChange(url);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="relative group shrink-0"
                aria-label={nome ? `Foto de ${nome}` : "Adicionar foto"}
            >
                {exibir ? (
                    <img
                        src={exibir}
                        alt={nome || "Foto"}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-[#e3f1eb] flex items-center justify-center border-2 border-white shadow">
                        <User className="h-6 w-6 text-[#5ba58c]" />
                    </div>
                )}
                <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    {enviando ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                        <Camera className="h-5 w-5 text-white" />
                    )}
                </span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFoto}
            />
        </>
    );
}
