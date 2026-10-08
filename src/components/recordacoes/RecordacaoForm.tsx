import { useEffect, useId, useMemo, useState } from "react";
import { CheckCircle2, Cross, Heart, ImageIcon, Loader2, Star, User, Video, X } from "lucide-react";
import { MAX_RECORDACAO_MENSAGEM, MAX_RECORDACAO_NOME, validateMediaFile } from "@/lib/validation";
import { formatBR } from "@/utils/formatDateToBR";
import clsx from "clsx";
import { COR, Coroa, Divisor } from "@/components/recordacoes/Ornamentos";

export type HomenageadoInfo = {
    nome: string;
    data_nascimento?: string;
    data_falecimento?: string;
    imagem_url?: string;
    falecido?: boolean;
};

type Props = {
    person: HomenageadoInfo;
    title?: string;
    subtitle?: string;
    loading?: boolean;
    embedded?: boolean;
    /** "memorial": visual da nota de falecimento/PDF (creme, coroa de folhas, serifa). */
    tema?: "padrao" | "memorial";
    onSubmit: (data: {
        mensagem: string;
        nome: string;
        anonimo: boolean;
        file: File | null;
    }) => void | Promise<void>;
};

export default function RecordacaoForm({
    person,
    title = "Deixe sua recordação",
    subtitle = "Escreva com carinho. Você pode anexar uma foto ou um vídeo curto.",
    loading = false,
    embedded = false,
    tema = "padrao",
    onSubmit,
}: Props) {
    const memorial = tema === "memorial";
    const campoBorda = memorial
        ? "border-[#e8dcc6] focus:ring-[#c9a96e]/30 focus:border-[#c9a96e]"
        : "border-[#d1e5dc] focus:ring-[#5ba58c]/30 focus:border-[#5ba58c]";
    const inputId = useId();
    const [mensagem, setMensagem] = useState("");
    const [nome, setNome] = useState("");
    const [anonimo, setAnonimo] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);

    const isVideo = file?.type.startsWith("video/") ?? false;

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const nascimento = person.data_nascimento ? formatBR(person.data_nascimento) : "";
    const falecimento = person.falecido && person.data_falecimento ? formatBR(person.data_falecimento) : "";
    const temNascimento = !!nascimento && nascimento !== "Data não informada";
    const temFalecimento = !!falecimento && falecimento !== "Data não informada";

    const iniciais = useMemo(
        () => person.nome?.charAt(0)?.toUpperCase() || "?",
        [person.nome]
    );

    function handleFileChange(selected: File | null) {
        if (!selected) return;
        const validationError = validateMediaFile(selected);
        if (validationError) {
            setErro(validationError);
            return;
        }
        setErro(null);
        setFile(selected);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!mensagem.trim()) {
            setErro("Escreva uma mensagem antes de enviar.");
            return;
        }
        if (mensagem.length > MAX_RECORDACAO_MENSAGEM) {
            setErro(`Mensagem muito longa. Máximo ${MAX_RECORDACAO_MENSAGEM} caracteres.`);
            return;
        }
        if (!anonimo && !nome.trim()) {
            setErro("Informe seu nome ou marque envio anônimo.");
            return;
        }
        if (nome.length > MAX_RECORDACAO_NOME) {
            setErro(`Nome muito longo. Máximo ${MAX_RECORDACAO_NOME} caracteres.`);
            return;
        }
        setErro(null);
        await onSubmit({ mensagem: mensagem.trim(), nome: nome.trim(), anonimo, file });
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-5">
            {memorial ? (
                <div className="flex flex-col items-center text-center">
                    <div className="relative" style={{ width: 184, height: 184 }}>
                        <Coroa size={184} />
                        <div
                            className="absolute rounded-full overflow-hidden flex items-center justify-center"
                            style={{ top: 32, left: 32, width: 120, height: 120, border: "4px solid #ffffff", boxShadow: "0 6px 18px rgba(47,107,92,0.18)", background: "#eef3f1" }}
                        >
                            {person.imagem_url ? (
                                <img src={person.imagem_url} alt={person.nome} className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-serif text-4xl font-bold" style={{ color: COR.titulo }}>{iniciais}</span>
                            )}
                        </div>
                    </div>
                    <p className="font-serif text-2xl sm:text-3xl font-bold leading-tight mt-1" style={{ color: COR.titulo }}>{person.nome}</p>
                    {(temNascimento || temFalecimento) && (
                        <p className="font-serif mt-1.5 flex flex-wrap justify-center gap-x-5 gap-y-1" style={{ color: COR.suave }}>
                            {temNascimento && (
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                    <Star className="h-3.5 w-3.5 fill-current" aria-label="Nascimento" /> {nascimento}
                                </span>
                            )}
                            {temFalecimento && (
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                    <Cross className="h-3.5 w-3.5" aria-label="Falecimento" /> {falecimento}
                                </span>
                            )}
                        </p>
                    )}
                    <div className="mt-5">
                        <Divisor />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center text-center gap-3 pb-2">
                    {person.imagem_url ? (
                        <img
                            src={person.imagem_url}
                            alt={person.nome}
                            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-[#c2e1d4] shadow-lg"
                        />
                    ) : (
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#e3f1eb] flex items-center justify-center border-4 border-white shadow-lg">
                            <span className="text-3xl font-bold text-[#255f4f]">{iniciais}</span>
                        </div>
                    )}
                    <div>
                        <p className="text-lg font-bold text-[#255f4f]">{person.nome}</p>
                        {(temNascimento || temFalecimento) && (
                            <div className="flex items-center justify-center gap-4 text-sm text-[#6b8c7d] mt-1">
                                {temNascimento && (
                                    <span className="flex items-center gap-1" title="Nascimento">
                                        <Star className="h-3.5 w-3.5 fill-current" aria-label="Nascimento" />
                                        {nascimento}
                                    </span>
                                )}
                                {temFalecimento && (
                                    <span className="flex items-center gap-1" title="Falecimento">
                                        <Cross className="h-3.5 w-3.5" aria-label="Falecimento" />
                                        {falecimento}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!embedded && (
                <div className="text-center space-y-1">
                    {memorial ? (
                        <h1 className="font-serif text-2xl font-bold" style={{ color: COR.titulo }}>{title} 💙</h1>
                    ) : (
                        <h1 className="text-xl sm:text-2xl font-bold text-[#255f4f] flex items-center justify-center gap-2">
                            {title} <Heart className="h-5 w-5 text-[#5ba58c] fill-[#5ba58c]/30" />
                        </h1>
                    )}
                    <p className="text-sm text-[#6b8c7d]">{subtitle}</p>
                    {person.falecido && (
                        <p className="text-sm text-[#6b8c7d] italic pt-2">
                            Sabemos como é difícil encontrar as palavras certas em momentos como este,
                            mas sua mensagem de apoio será muito importante para os familiares.
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6b8c7d] ml-1">
                    Sua mensagem
                </label>
                <textarea
                    placeholder="Escreva sua mensagem com carinho..."
                    className={clsx("w-full min-h-[130px] p-4 text-[#255f4f] border rounded-2xl bg-white placeholder:text-[#9db4aa] focus:ring-2 focus:outline-none transition resize-y", campoBorda)}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    maxLength={MAX_RECORDACAO_MENSAGEM}
                />
                <p className="text-right text-[10px] text-[#9db4aa] pr-1">
                    {mensagem.length}/{MAX_RECORDACAO_MENSAGEM}
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6b8c7d] ml-1">
                    Foto ou vídeo (opcional)
                </label>
                <input
                    id={inputId}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    className="sr-only"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                />
                {!previewUrl ? (
                    <label
                        htmlFor={inputId}
                        className={clsx(
                            "flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-2xl cursor-pointer transition",
                            memorial ? "border-[#e8dcc6] bg-white hover:border-[#c9a96e]" : "border-[#c2e1d4] bg-[#f8fcfb] hover:bg-[#f0f9f6] hover:border-[#5ba58c]"
                        )}
                    >
                        <div className="flex gap-3 text-[#5ba58c]">
                            <ImageIcon className="h-6 w-6" />
                            <Video className="h-6 w-6" />
                        </div>
                        <span className="text-sm font-semibold text-[#255f4f]">Toque para escolher mídia</span>
                        <span className="text-xs text-[#9db4aa]">Foto até 2MB · Vídeo curto até 15MB</span>
                    </label>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-[#e6efe9] bg-black/5">
                        {isVideo ? (
                            <video src={previewUrl} controls className="w-full max-h-56 object-contain bg-black" />
                        ) : (
                            <img src={previewUrl} alt="Pré-visualização" className="w-full max-h-56 object-contain" />
                        )}
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
                            aria-label="Remover mídia"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6b8c7d] ml-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" /> Seu nome
                </label>
                <input
                    type="text"
                    placeholder="Como você quer ser identificado?"
                    disabled={anonimo}
                    className={clsx(
                        "w-full p-4 border rounded-2xl text-[#255f4f] placeholder:text-[#9db4aa] transition",
                        campoBorda,
                        anonimo ? "bg-[#f4fbf8] text-[#9db4aa]" : "bg-white focus:ring-2 focus:outline-none"
                    )}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    maxLength={MAX_RECORDACAO_NOME}
                />
            </div>

            <label className={clsx("flex items-center gap-3 p-3 rounded-xl border cursor-pointer", memorial ? "bg-white border-[#e8dcc6]" : "bg-[#f8fcfb] border-[#e6efe9]")}>
                <input
                    type="checkbox"
                    checked={anonimo}
                    onChange={(e) => setAnonimo(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#5ba58c]"
                />
                <span className="text-sm font-medium text-[#4f665a]">Enviar como anônimo</span>
            </label>

            {erro && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
                    {erro}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={clsx(
                    "w-full text-white py-4 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60",
                    memorial ? "bg-[#2f6b5c] hover:bg-[#275a4d]" : "bg-[#5ba58c] hover:bg-[#4a8a75]"
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="h-5 w-5" />
                        Enviar recordação
                    </>
                )}
            </button>
        </form>
    );
}
