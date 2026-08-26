import { useEffect, useState } from "react";
import { Download, FileText, ImageIcon, Loader2, X, ZoomIn } from "lucide-react";
import clsx from "clsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { assinarArquivo, ehImagem, formatarTamanho } from "@/lib/uploadArquivo";
import type { ExameArquivo, ExameMp } from "../types";

/** Signed URL vale 1h; guardamos por 50 min para não reassinar a cada render. */
const cacheUrls = new Map<string, { url: string; expiraEm: number }>();

export async function urlAssinada(path: string): Promise<string | null> {
    const agora = Date.now();
    const cache = cacheUrls.get(path);
    if (cache && cache.expiraEm > agora) return cache.url;

    const url = await assinarArquivo(path);
    if (url) cacheUrls.set(path, { url, expiraEm: agora + 50 * 60 * 1000 });
    return url;
}

export async function abrirAnexoEmAba(path: string) {
    const url = await urlAssinada(path);
    if (url) window.open(url, "_blank", "noopener");
}

/** Anexos antigos não têm origem gravada — usamos a origem do exame. */
export function origemDoAnexo(
    arquivo: ExameArquivo,
    origemExame?: ExameMp["origem"]
): "paciente" | "clinica" {
    return arquivo.origem ?? origemExame ?? "paciente";
}

/** Miniatura da imagem do laudo; PDF cai no ícone. */
function useThumb(arquivo: ExameArquivo) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        let vivo = true;
        setUrl(null);
        if (!ehImagem(arquivo.mime)) return;

        urlAssinada(arquivo.path).then((u) => {
            if (vivo) setUrl(u);
        });
        return () => {
            vivo = false;
        };
    }, [arquivo.path, arquivo.mime]);

    return url;
}

type TileProps = {
    arquivo: ExameArquivo;
    onAbrir: (arquivo: ExameArquivo) => void;
    onRemover?: (arquivo: ExameArquivo) => void;
    removendo?: boolean;
};

/** Tile grande — usado no formulário de exame do portal da clínica. */
export function AnexoTile({ arquivo, onAbrir, onRemover, removendo }: TileProps) {
    const thumb = useThumb(arquivo);
    const imagem = ehImagem(arquivo.mime);

    return (
        <div className="relative w-[104px]">
            <button
                type="button"
                onClick={() => onAbrir(arquivo)}
                title={arquivo.nome}
                className="block w-[104px] h-[104px] rounded-xl border border-[#d7e8e0] bg-[#f4fbf8] overflow-hidden hover:border-[#5ba58c] transition-colors"
            >
                {imagem ? (
                    thumb ? (
                        <img
                            src={thumb}
                            alt={arquivo.nome}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <span className="w-full h-full flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-[#9db4aa]" />
                        </span>
                    )
                ) : (
                    <span className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#5ba58c]">
                        <FileText className="h-7 w-7" />
                        <span className="text-[10px] font-semibold uppercase">PDF</span>
                    </span>
                )}
            </button>

            <p className="mt-1 text-[11px] text-[#4f665a] truncate" title={arquivo.nome}>
                {arquivo.nome}
            </p>
            {arquivo.tamanho ? (
                <p className="text-[10px] text-[#9db4aa]">{formatarTamanho(arquivo.tamanho)}</p>
            ) : null}

            {onRemover && (
                <button
                    type="button"
                    onClick={() => onRemover(arquivo)}
                    disabled={removendo}
                    title="Remover anexo"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-[#d7e8e0] shadow-sm flex items-center justify-center text-[#9db4aa] hover:text-rose-500 hover:border-rose-200 disabled:opacity-60"
                >
                    {removendo ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <X className="h-3.5 w-3.5" />
                    )}
                </button>
            )}
        </div>
    );
}

/** Miniatura compacta — usada na tabela de exames da clínica. */
export function AnexoMini({
    arquivo,
    onAbrir,
}: {
    arquivo: ExameArquivo;
    onAbrir: (arquivo: ExameArquivo) => void;
}) {
    const thumb = useThumb(arquivo);
    const imagem = ehImagem(arquivo.mime);

    return (
        <button
            type="button"
            onClick={() => onAbrir(arquivo)}
            title={arquivo.nome}
            className={clsx(
                "h-10 w-10 rounded-lg border border-[#d7e8e0] overflow-hidden bg-[#f4fbf8]",
                "flex items-center justify-center hover:border-[#5ba58c] transition-colors"
            )}
        >
            {imagem && thumb ? (
                <img
                    src={thumb}
                    alt={arquivo.nome}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            ) : imagem ? (
                <ImageIcon className="h-4 w-4 text-[#9db4aa]" />
            ) : (
                <FileText className="h-4 w-4 text-[#5ba58c]" />
            )}
        </button>
    );
}

/** Card quadrado de imagem no app do paciente. */
function ImagemDoPaciente({
    arquivo,
    daClinica,
    onAbrir,
    onRemover,
    removendo,
}: {
    arquivo: ExameArquivo;
    daClinica: boolean;
    onAbrir: (arquivo: ExameArquivo) => void;
    onRemover?: (arquivo: ExameArquivo) => void;
    removendo?: boolean;
}) {
    const thumb = useThumb(arquivo);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => onAbrir(arquivo)}
                className="block w-full aspect-square rounded-xl overflow-hidden bg-[#f4fbf8] border border-[#e3f1eb] active:scale-[0.98] transition-transform"
            >
                {thumb ? (
                    <img
                        src={thumb}
                        alt={arquivo.nome}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                ) : (
                    <span className="w-full h-full flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-[#9db4aa]" />
                    </span>
                )}
                <span className="absolute bottom-1 left-1 right-1 flex justify-center">
                    <span
                        className={clsx(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                            daClinica
                                ? "bg-violet-100 text-violet-700"
                                : "bg-white/90 text-[#4f665a]"
                        )}
                    >
                        {daClinica ? "Clínica" : "Você"}
                    </span>
                </span>
            </button>

            {onRemover && (
                <button
                    type="button"
                    onClick={() => onRemover(arquivo)}
                    disabled={removendo}
                    aria-label={`Remover ${arquivo.nome}`}
                    className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-white border border-[#e3f1eb] shadow-sm flex items-center justify-center text-[#9db4aa] active:text-rose-500 disabled:opacity-60"
                >
                    {removendo ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <X className="h-3.5 w-3.5" />
                    )}
                </button>
            )}
        </div>
    );
}

/**
 * Galeria do app do paciente: imagens em miniatura, PDFs em linha.
 * onRemover só é passado para os anexos que o paciente pode apagar.
 */
export function AnexoGaleria({
    arquivos,
    origemExame,
    onAbrir,
    onRemover,
    removendoPath,
}: {
    arquivos: ExameArquivo[];
    origemExame?: ExameMp["origem"];
    onAbrir: (arquivo: ExameArquivo) => void;
    onRemover?: (arquivo: ExameArquivo) => void;
    removendoPath?: string | null;
}) {
    if (arquivos.length === 0) return null;

    const imagens = arquivos.filter((a) => ehImagem(a.mime));
    const documentos = arquivos.filter((a) => !ehImagem(a.mime));

    function podeRemover(arquivo: ExameArquivo) {
        if (!onRemover) return undefined;
        if (origemDoAnexo(arquivo, origemExame) === "clinica") return undefined;
        return onRemover;
    }

    return (
        <div className="mt-2 space-y-2">
            {imagens.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {imagens.map((a) => (
                        <ImagemDoPaciente
                            key={a.path}
                            arquivo={a}
                            daClinica={origemDoAnexo(a, origemExame) === "clinica"}
                            onAbrir={onAbrir}
                            onRemover={podeRemover(a)}
                            removendo={removendoPath === a.path}
                        />
                    ))}
                </div>
            )}

            {documentos.map((a) => {
                const daClinica = origemDoAnexo(a, origemExame) === "clinica";
                const remover = podeRemover(a);
                return (
                    <div key={a.path} className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onAbrir(a)}
                            className="flex-1 min-w-0 flex items-center gap-2 text-xs text-[#5ba58c] font-semibold bg-[#f4fbf8] rounded-lg px-3 py-2.5 hover:bg-[#e3f1eb]"
                        >
                            <FileText className="h-4 w-4 shrink-0" />
                            <span className="truncate flex-1 text-left">{a.nome}</span>
                            {daClinica && (
                                <span className="text-[9px] font-bold text-violet-700 bg-violet-100 px-1.5 py-0.5 rounded-full shrink-0">
                                    Clínica
                                </span>
                            )}
                            <Download className="h-3.5 w-3.5 shrink-0" />
                        </button>
                        {remover && (
                            <button
                                type="button"
                                onClick={() => remover(a)}
                                disabled={removendoPath === a.path}
                                aria-label={`Remover ${a.nome}`}
                                className="h-9 w-9 rounded-lg flex items-center justify-center text-[#9db4aa] active:text-rose-500 disabled:opacity-60"
                            >
                                {removendoPath === a.path ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

/** Visualizador em tela: imagem inline, PDF em iframe. */
export function VisualizadorAnexo({
    arquivo,
    onClose,
}: {
    arquivo: ExameArquivo | null;
    onClose: () => void;
}) {
    const [url, setUrl] = useState<string | null>(null);
    const path = arquivo?.path ?? "";

    useEffect(() => {
        let vivo = true;
        setUrl(null);
        if (!path) return;

        urlAssinada(path).then((u) => {
            if (vivo) setUrl(u);
        });
        return () => {
            vivo = false;
        };
    }, [path]);

    return (
        <Dialog open={!!arquivo} onOpenChange={(aberto) => !aberto && onClose()}>
            <DialogContent className="sm:max-w-[820px] max-h-[92vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-[#255f4f] text-base pr-6 truncate">
                        {arquivo?.nome}
                    </DialogTitle>
                </DialogHeader>

                <div className="rounded-xl bg-[#f4fbf8] p-2 sm:p-3 flex items-center justify-center min-h-[220px]">
                    {!url ? (
                        <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                    ) : ehImagem(arquivo?.mime) ? (
                        <img
                            src={url}
                            alt={arquivo?.nome}
                            className="max-h-[58vh] w-auto rounded-lg object-contain"
                        />
                    ) : (
                        <iframe
                            src={url}
                            title={arquivo?.nome}
                            className="w-full h-[58vh] rounded-lg bg-white"
                        />
                    )}
                </div>

                {url && (
                    <div className="flex flex-wrap justify-end gap-2">
                        <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-[#d7e8e0] text-sm font-semibold text-[#255f4f] hover:bg-[#f4fbf8]"
                        >
                            <ZoomIn className="h-4 w-4" /> Abrir em nova aba
                        </a>
                        <a
                            href={url}
                            download={arquivo?.nome}
                            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-[#5ba58c] text-white text-sm font-semibold hover:bg-[#4d9179]"
                        >
                            <Download className="h-4 w-4" /> Baixar
                        </a>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
