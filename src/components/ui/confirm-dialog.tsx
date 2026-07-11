import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export type ConfirmDialogOptions = {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** "destructive" usa vermelho (excluir); "default" usa o verde da plataforma */
    variant?: "destructive" | "default";
};

type PendingConfirm = ConfirmDialogOptions & {
    resolve: (ok: boolean) => void;
};

let enqueue: ((c: PendingConfirm) => void) | null = null;

/**
 * Substituto bonito do window.confirm().
 * Uso: if (!(await confirmDialog({ title: "Excluir esta história?" }))) return;
 * Requer <ConfirmDialogHost /> montado uma vez no App.
 */
export function confirmDialog(options: ConfirmDialogOptions): Promise<boolean> {
    if (!enqueue) {
        return Promise.resolve(window.confirm(options.title));
    }
    return new Promise<boolean>((resolve) => {
        enqueue!({ ...options, resolve });
    });
}

export function ConfirmDialogHost() {
    const [current, setCurrent] = useState<PendingConfirm | null>(null);

    useEffect(() => {
        enqueue = (c) => setCurrent(c);
        return () => {
            enqueue = null;
        };
    }, []);

    function fechar(ok: boolean) {
        current?.resolve(ok);
        setCurrent(null);
    }

    const destructive = current?.variant !== "default";

    return (
        <AlertDialog open={!!current} onOpenChange={(open) => !open && fechar(false)}>
            <AlertDialogContent className="max-w-sm rounded-3xl border-[#e6efe9] p-6">
                <AlertDialogHeader className="items-center text-center sm:text-center space-y-3">
                    <div
                        className={cn(
                            "mx-auto flex h-14 w-14 items-center justify-center rounded-2xl",
                            destructive ? "bg-red-50 text-red-500" : "bg-[#e3f1eb] text-[#5ba58c]"
                        )}
                    >
                        {destructive ? (
                            <Trash2 className="h-7 w-7" />
                        ) : (
                            <AlertTriangle className="h-7 w-7" />
                        )}
                    </div>
                    <AlertDialogTitle className="text-lg font-bold text-[#255f4f]">
                        {current?.title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className={cn("text-sm text-[#6b8c7d]", !current?.description && "sr-only")}>
                        {current?.description || current?.title}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2 flex-col-reverse gap-2 sm:flex-col-reverse sm:space-x-0">
                    <button
                        type="button"
                        onClick={() => fechar(false)}
                        className="w-full py-3 rounded-2xl font-bold text-sm text-[#6b8c7d] bg-[#f4f9f7] hover:bg-[#e9f3ee] transition"
                    >
                        {current?.cancelLabel || "Cancelar"}
                    </button>
                    <button
                        type="button"
                        onClick={() => fechar(true)}
                        className={cn(
                            "w-full py-3 rounded-2xl font-bold text-sm text-white shadow-md transition active:scale-[0.99]",
                            destructive
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-[#5ba58c] hover:bg-[#4a8a75]"
                        )}
                    >
                        {current?.confirmLabel || (destructive ? "Excluir" : "Confirmar")}
                    </button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
