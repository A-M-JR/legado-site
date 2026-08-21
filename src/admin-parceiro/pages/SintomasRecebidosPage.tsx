import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Activity, Loader2, ImageIcon, MessageCircle, RefreshCw } from "lucide-react";
import clsx from "clsx";
import { toast } from "@/hooks/use-toast";
import { assinarArquivo } from "@/lib/uploadArquivo";
import { sintomasParceiroService } from "../services/sintomasParceiroService";
import { fmtDataHora } from "@/modules/medicina-preventiva/lib/datas";
import type { RegistroSintoma, SintomaStatus } from "@/modules/medicina-preventiva/types";
import { supabase } from "@/lib/supabaseClient";

const STATUS: { id: SintomaStatus; label: string; cor: string }[] = [
    { id: "novo", label: "Novo", cor: "bg-rose-100 text-rose-700" },
    { id: "em_analise", label: "Em análise", cor: "bg-amber-100 text-amber-700" },
    { id: "respondido", label: "Respondido", cor: "bg-emerald-100 text-emerald-700" },
    { id: "arquivado", label: "Arquivado", cor: "bg-slate-100 text-slate-600" },
];

const INTENSIDADE_LABEL: Record<RegistroSintoma["intensidade"], string> = {
    leve: "Leve",
    media: "Moderada",
    forte: "Forte",
};

const INTENSIDADE_COR: Record<RegistroSintoma["intensidade"], string> = {
    leve: "bg-emerald-50 text-emerald-700 border-emerald-200",
    media: "bg-amber-50 text-amber-700 border-amber-200",
    forte: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function SintomasRecebidosPage() {
    const [registros, setRegistros] = useState<RegistroSintoma[]>([]);
    const [filtro, setFiltro] = useState<SintomaStatus | "todos">("todos");
    const [loading, setLoading] = useState(true);
    const [fotoUrl, setFotoUrl] = useState<string | null>(null);
    const [telefones, setTelefones] = useState<Map<string, string>>(new Map());

    const carregar = useCallback(async () => {
        setLoading(true);
        const lista = await sintomasParceiroService.listRegistros({ status: filtro });
        setRegistros(lista);
        setLoading(false);

        const ids = Array.from(new Set(lista.map((r) => r.titularId)));
        if (ids.length) {
            const { data } = await supabase
                .from("titulares")
                .select("id, telefone")
                .in("id", ids);
            setTelefones(
                new Map((data ?? []).map((t) => [String(t.id), String(t.telefone ?? "")]))
            );
        }
    }, [filtro]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    async function mudarStatus(registro: RegistroSintoma, status: SintomaStatus) {
        try {
            await sintomasParceiroService.setStatus(registro.id, status);
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function verFoto(path: string) {
        const url = await assinarArquivo(path);
        if (!url) {
            toast({ title: "Não foi possível abrir a foto", variant: "destructive" });
            return;
        }
        setFotoUrl(url);
    }

    function responderWhatsapp(registro: RegistroSintoma) {
        const telefone = (telefones.get(registro.titularId) ?? "").replace(/\D/g, "");
        if (!telefone) {
            toast({
                title: "Paciente sem telefone",
                description: "Cadastre o telefone do paciente para usar o atalho.",
                variant: "destructive",
            });
            return;
        }
        const numero = telefone.length <= 11 ? `55${telefone}` : telefone;
        const texto = `Olá ${registro.pacienteNome || ""}, recebemos seu registro de sintomas de ${fmtDataHora(
            registro.criadoEm
        )}.`;
        window.open(
            `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`,
            "_blank",
            "noopener"
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Sintomas recebidos</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        Registros enviados pelos pacientes pelo app.
                    </p>
                </div>
                <Button variant="outline" onClick={carregar}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    type="button"
                    onClick={() => setFiltro("todos")}
                    className={clsx(
                        "px-4 py-2 rounded-full text-xs font-semibold border transition",
                        filtro === "todos"
                            ? "bg-[#255f4f] text-white border-[#255f4f]"
                            : "bg-white text-[#6b8c7d] border-[#e6efe9]"
                    )}
                >
                    Todos
                </button>
                {STATUS.map((s) => (
                    <button
                        key={s.id}
                        type="button"
                        onClick={() => setFiltro(s.id)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-xs font-semibold border transition",
                            filtro === s.id
                                ? "bg-[#255f4f] text-white border-[#255f4f]"
                                : "bg-white text-[#6b8c7d] border-[#e6efe9]"
                        )}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                </div>
            ) : registros.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-sm text-[#6b8c7d]">
                        Nenhum registro de sintoma por aqui.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {registros.map((r) => (
                        <Card key={r.id} className={r.status === "novo" ? "border-rose-200" : ""}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                    <CardTitle className="text-base text-[#255f4f] flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-rose-500" />
                                        {r.pacienteNome || "Paciente"}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={clsx(
                                                "text-[11px] font-semibold px-2 py-1 rounded-full border",
                                                INTENSIDADE_COR[r.intensidade]
                                            )}
                                        >
                                            {INTENSIDADE_LABEL[r.intensidade]}
                                        </span>
                                        <select
                                            value={r.status}
                                            onChange={(e) =>
                                                mudarStatus(r, e.target.value as SintomaStatus)
                                            }
                                            className={clsx(
                                                "text-xs font-semibold rounded-full px-2 py-1 border-0",
                                                STATUS.find((s) => s.id === r.status)?.cor
                                            )}
                                        >
                                            {STATUS.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <p className="text-xs text-[#9db4aa]">{fmtDataHora(r.criadoEm)}</p>
                            </CardHeader>

                            <CardContent className="space-y-2">
                                <p className="text-sm text-[#255f4f] font-medium">
                                    {r.sintomas.map((s) => s.nome).join(", ") ||
                                        "Sem sintomas da lista"}
                                </p>
                                {r.observacao && (
                                    <p className="text-sm text-[#4f665a] bg-[#f4fbf8] rounded-lg p-3">
                                        {r.observacao}
                                    </p>
                                )}

                                <div className="flex items-center gap-4 pt-1">
                                    {r.fotoUrl && (
                                        <button
                                            type="button"
                                            onClick={() => verFoto(r.fotoUrl!)}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#5ba58c] hover:underline"
                                        >
                                            <ImageIcon className="h-3.5 w-3.5" />
                                            Ver foto enviada
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => responderWhatsapp(r)}
                                        className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        Responder no WhatsApp
                                    </button>
                                    {r.whatsappEnviado && (
                                        <span className="text-[11px] text-[#9db4aa]">
                                            paciente enviou por WhatsApp
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!fotoUrl} onOpenChange={() => setFotoUrl(null)}>
                <DialogContent className="sm:max-w-[640px] p-2">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Foto do sintoma</DialogTitle>
                        <DialogDescription>Imagem enviada pelo paciente</DialogDescription>
                    </DialogHeader>
                    {fotoUrl && (
                        <img src={fotoUrl} alt="Foto enviada" className="w-full rounded-xl" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
