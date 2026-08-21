import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Activity, Calendar, FlaskConical, Sparkles, CheckCheck } from "lucide-react";
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
import {
    notificacoesParceiroService,
    type ParceiroNotificacao,
} from "../services/notificacoesParceiroService";
import { fmtDataHora } from "@/modules/medicina-preventiva/lib/datas";

const ICONES: Record<ParceiroNotificacao["tipo"], typeof Bell> = {
    sintoma: Activity,
    consulta: Calendar,
    exame: FlaskConical,
    sistema: Sparkles,
};

const CORES: Record<ParceiroNotificacao["tipo"], string> = {
    sintoma: "bg-rose-50 text-rose-600",
    consulta: "bg-emerald-50 text-emerald-600",
    exame: "bg-blue-50 text-blue-600",
    sistema: "bg-[#e3f1eb] text-[#5ba58c]",
};

export function ParceiroNotificacoesBell({ parceiroId }: { parceiroId: string | null }) {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [lista, setLista] = useState<ParceiroNotificacao[]>([]);

    const recarregar = useCallback(() => {
        notificacoesParceiroService.list().then(setLista);
    }, []);

    useEffect(() => {
        if (!parceiroId) return;

        recarregar();
        const intervalo = setInterval(recarregar, 60000);

        const channel = supabase
            .channel("parceiro_notificacoes_bell")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "parceiro_notificacoes",
                    filter: `parceiro_id=eq.${parceiroId}`,
                },
                recarregar
            )
            .subscribe();

        return () => {
            clearInterval(intervalo);
            supabase.removeChannel(channel);
        };
    }, [parceiroId, recarregar]);

    const naoLidas = lista.filter((n) => !n.lida).length;

    async function handleClick(n: ParceiroNotificacao) {
        await notificacoesParceiroService.marcarLida(n.id);
        recarregar();
        setOpen(false);
        if (n.link) navigate(n.link);
    }

    return (
        <>
            <button
                type="button"
                onClick={() => {
                    recarregar();
                    setOpen(true);
                }}
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
                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                    <SheetHeader className="px-5 pt-5 pb-3 border-b border-[#e6efe9] text-left space-y-0">
                        <div className="flex items-center justify-between pr-8">
                            <SheetTitle className="text-[#255f4f]">Notificações</SheetTitle>
                            <SheetDescription className="sr-only">
                                Avisos dos pacientes
                            </SheetDescription>
                            {naoLidas > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={async () => {
                                        await notificacoesParceiroService.marcarTodasLidas();
                                        recarregar();
                                    }}
                                    className="text-[#5ba58c] text-xs font-semibold h-8"
                                >
                                    <CheckCheck className="h-4 w-4 mr-1" />
                                    Ler todas
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-[#9db4aa]">
                            {naoLidas > 0 ? `${naoLidas} não lida(s)` : "Tudo em dia"}
                        </p>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                        {lista.length === 0 ? (
                            <p className="text-center text-sm text-[#9db4aa] py-12">
                                Nenhuma notificação.
                            </p>
                        ) : (
                            lista.map((n) => {
                                const Icon = ICONES[n.tipo] ?? Sparkles;
                                return (
                                    <button
                                        key={n.id}
                                        type="button"
                                        onClick={() => handleClick(n)}
                                        className={clsx(
                                            "w-full text-left p-3 rounded-2xl border transition flex gap-3",
                                            n.lida
                                                ? "bg-white border-[#e6efe9] opacity-80"
                                                : "bg-[#f8fcfb] border-[#c2e1d4] shadow-sm"
                                        )}
                                    >
                                        <div
                                            className={clsx(
                                                "shrink-0 p-2.5 rounded-xl h-fit",
                                                CORES[n.tipo] ?? CORES.sistema
                                            )}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-bold text-[#255f4f] leading-snug">
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
                                                {fmtDataHora(n.criadoEm)}
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
