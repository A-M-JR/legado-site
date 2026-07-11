import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Mail,
    Pill,
    Calendar,
    HeartHandshake,
    Sparkles,
    CheckCheck,
} from "lucide-react";
import clsx from "clsx";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { notificacoesService } from "../services/notificacoesService";
import { getMiScope } from "../services/miScope";
import type { Notificacao, NotificacaoTipo } from "../types";

const ICONES: Record<NotificacaoTipo, typeof Bell> = {
    mensagem: Mail,
    medicacao: Pill,
    consulta: Calendar,
    cuidado: HeartHandshake,
    sistema: Sparkles,
};

const CORES: Record<NotificacaoTipo, string> = {
    mensagem: "bg-violet-50 text-violet-600",
    medicacao: "bg-blue-50 text-blue-600",
    consulta: "bg-emerald-50 text-emerald-600",
    cuidado: "bg-amber-50 text-amber-600",
    sistema: "bg-[#e3f1eb] text-[#5ba58c]",
};

export function NotificacoesBell() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [lista, setLista] = useState<Notificacao[]>([]);

    useEffect(() => {
        let ativo = true;
        const recarregar = () => {
            notificacoesService.list().then((n) => ativo && setLista(n));
        };

        recarregar();

        const intervalo = setInterval(recarregar, 60000);

        let channel: ReturnType<typeof supabase.channel> | null = null;
        getMiScope().then((scope) => {
            if (!ativo || !scope) return;
            const filtro = scope.titularId
                ? `titular_id=eq.${scope.titularId}`
                : `auth_id=eq.${scope.authId}`;
            channel = supabase
                .channel("mi_notificacoes_bell")
                .on(
                    "postgres_changes",
                    { event: "*", schema: "public", table: "mi_notificacoes", filter: filtro },
                    recarregar
                )
                .subscribe();
        });

        return () => {
            ativo = false;
            clearInterval(intervalo);
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const naoLidas = lista.filter((n) => !n.lida).length;

    async function abrir() {
        setLista(await notificacoesService.list());
        setOpen(true);
    }

    async function handleClick(n: Notificacao) {
        setLista(await notificacoesService.marcarLida(n.id));
        setOpen(false);
        if (n.link) navigate(n.link);
    }

    async function marcarTodas() {
        setLista(await notificacoesService.marcarTodasLidas());
    }

    return (
        <>
            <button
                type="button"
                onClick={abrir}
                className="p-2 rounded-xl hover:bg-[#f4fbf8] text-[#6b8c7d] relative"
                aria-label={`Notificações${naoLidas ? `, ${naoLidas} não lidas` : ""}`}
            >
                <Bell className="h-5 w-5" />
                {naoLidas > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold rounded-full">
                        {naoLidas > 9 ? "9+" : naoLidas}
                    </span>
                )}
            </button>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 flex flex-col"
                >
                    <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#e6efe9] text-left space-y-0">
                        <div className="flex items-center justify-between pr-8">
                            <SheetTitle className="text-[#255f4f]">Notificações</SheetTitle>
                            <SheetDescription className="sr-only">
                                Lista de alertas e lembretes do dia
                            </SheetDescription>
                            {naoLidas > 0 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={marcarTodas}
                                    className="text-[#5ba58c] text-xs font-semibold h-8"
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Ler todas
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-[#9db4aa]">
                            {naoLidas > 0
                                ? `${naoLidas} não lida${naoLidas > 1 ? "s" : ""}`
                                : "Tudo em dia"}
                        </p>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                        {lista.length === 0 ? (
                            <p className="text-center text-sm text-[#9db4aa] py-12">
                                Nenhuma notificação.
                            </p>
                        ) : (
                            lista.map((n) => {
                                const Icon = ICONES[n.tipo];
                                return (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => handleClick(n)}
                                        className={clsx(
                                            "w-full text-left p-3 sm:p-4 rounded-2xl border transition flex gap-3",
                                            n.lida
                                                ? "bg-white border-[#e6efe9] opacity-80"
                                                : "bg-[#f8fcfb] border-[#c2e1d4] shadow-sm"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "shrink-0 p-2.5 rounded-xl h-fit",
                                                CORES[n.tipo]
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p
                                                    className={clsx(
                                                        "text-sm font-bold text-[#255f4f] leading-snug",
                                                        !n.lida && "pr-2"
                                                    )}
                                                >
                                                    {n.titulo}
                                                </p>
                                                {!n.lida && (
                                                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                                )}
                                            </div>
                                            <p className="text-xs text-[#6b8c7d] mt-0.5 line-clamp-2">
                                                {n.descricao}
                                            </p>
                                            <p className="text-[10px] text-[#9db4aa] mt-1.5">
                                                {n.horaLabel}
                                            </p>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
