import { useEffect, useRef, useState } from "react";
import {
    FlaskConical,
    Plus,
    Paperclip,
    Loader2,
    FileText,
    Download,
    Trash2,
    Building2,
    CalendarClock,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { assinarArquivo, uploadArquivo } from "@/lib/uploadArquivo";
import { MiCard, MiFilterPills } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { MiDatePicker } from "@/modules/melhor-idade/components/MiDatePicker";
import { examesService } from "../services/examesService";
import { getMpScope } from "../services/mpScope";
import { MP_EXAMES_PASTA } from "../lib/storage";
import { fmtData, fmtDataHora } from "../lib/datas";
import type { ExameMp, ExameTipo } from "../types";

const FILTROS = [
    { id: "todos", label: "Todos" },
    { id: "pendentes", label: "Em aberto" },
    { id: "resultados", label: "Com resultado" },
];

const STATUS_LABEL: Record<ExameMp["status"], string> = {
    solicitado: "Solicitado",
    agendado: "Agendado",
    realizado: "Realizado",
    resultado_disponivel: "Resultado disponível",
    cancelado: "Cancelado",
};

const STATUS_COR: Record<ExameMp["status"], string> = {
    solicitado: "bg-amber-100 text-amber-700",
    agendado: "bg-[#e3f1eb] text-[#255f4f]",
    realizado: "bg-blue-100 text-blue-700",
    resultado_disponivel: "bg-emerald-100 text-emerald-700",
    cancelado: "bg-rose-100 text-rose-700",
};

const TIPO_LABEL: Record<ExameTipo, string> = {
    laboratorial: "Laboratorial",
    imagem: "Imagem",
    outro: "Outro",
};

const FORM_INICIAL = {
    nomeExame: "",
    tipo: "laboratorial" as ExameTipo,
    medicoSolicitante: "",
    especialidade: "",
    laboratorio: "",
    dataSolicitacao: "",
    dataRealizacao: "",
    observacoes: "",
};

export default function ExamesPage() {
    const [exames, setExames] = useState<ExameMp[]>([]);
    const [filtro, setFiltro] = useState("todos");
    const [modalNovo, setModalNovo] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);
    const [anexandoId, setAnexandoId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        examesService.list().then(setExames);
    }, []);

    const filtrados = exames.filter((e) => {
        if (filtro === "pendentes") return e.status === "solicitado" || e.status === "agendado";
        if (filtro === "resultados")
            return e.status === "resultado_disponivel" || e.arquivos.length > 0;
        return true;
    });

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nomeExame.trim() || salvando) return;

        setSalvando(true);
        try {
            setExames(
                await examesService.add({
                    nomeExame: form.nomeExame.trim(),
                    tipo: form.tipo,
                    medicoSolicitante: form.medicoSolicitante.trim(),
                    especialidade: form.especialidade.trim(),
                    laboratorio: form.laboratorio.trim(),
                    dataSolicitacao: form.dataSolicitacao,
                    dataRealizacao: form.dataRealizacao,
                    status: form.dataRealizacao ? "realizado" : "solicitado",
                    resultadoResumo: "",
                    observacoes: form.observacoes.trim(),
                    arquivos: [],
                })
            );
            setForm(FORM_INICIAL);
            setModalNovo(false);
            toast({ title: "Exame cadastrado" });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    function pedirArquivo(exameId: string) {
        setAnexandoId(exameId);
        inputRef.current?.click();
    }

    async function anexar(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const exameId = anexandoId;
        e.target.value = "";
        if (!file || !exameId) return;

        try {
            const scope = await getMpScope();
            if (!scope?.titularId) throw new Error("Conta sem paciente vinculado.");

            const anexo = await uploadArquivo({
                file,
                titularId: scope.titularId,
                pasta: MP_EXAMES_PASTA,
            });
            setExames(await examesService.anexar(exameId, anexo));
            toast({ title: "Arquivo anexado" });
        } catch (err) {
            toast({
                title: "Erro ao anexar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setAnexandoId(null);
        }
    }

    async function abrirArquivo(path: string) {
        const url = await assinarArquivo(path);
        if (!url) {
            toast({
                title: "Não foi possível abrir",
                description: "Tente novamente em instantes.",
                variant: "destructive",
            });
            return;
        }
        window.open(url, "_blank", "noopener");
    }

    async function removerExame(id: string) {
        try {
            setExames(await examesService.remove(id));
            toast({ title: "Exame removido" });
        } catch {
            toast({
                title: "Não foi possível remover",
                description: "Exames lançados pela clínica não podem ser apagados por aqui.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <MiPageHeader
                    eyebrow="Exames"
                    title="Exames e laudos"
                    subtitle="Pedidos, agendamentos e resultados — seus e os solicitados pela clínica."
                />
                <Button
                    onClick={() => setModalNovo(true)}
                    className="hidden sm:flex bg-[#5ba58c] text-white rounded-xl shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" /> Novo exame
                </Button>
            </div>

            <MiFilterPills options={FILTROS} value={filtro} onChange={setFiltro} />

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={anexar}
            />

            <div className="space-y-2">
                {filtrados.length === 0 ? (
                    <MiCard variant="soft" className="p-8 text-center">
                        <FlaskConical className="h-6 w-6 mx-auto text-[#9db4aa]" />
                        <p className="text-sm text-[#6b8c7d] mt-2">
                            Nenhum exame por aqui ainda.
                        </p>
                    </MiCard>
                ) : (
                    filtrados.map((exame) => (
                        <MiCard key={exame.id} className="p-4">
                            <div className="flex items-start gap-3">
                                <div className="shrink-0 p-3 rounded-xl bg-blue-50 text-blue-600">
                                    <FlaskConical className="h-5 w-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-bold text-[#255f4f] text-sm sm:text-base">
                                            {exame.nomeExame}
                                        </p>
                                        <span
                                            className={clsx(
                                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                                STATUS_COR[exame.status]
                                            )}
                                        >
                                            {STATUS_LABEL[exame.status]}
                                        </span>
                                        {exame.origem === "clinica" && (
                                            <span className="text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
                                                Pela clínica
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-xs text-[#6b8c7d] mt-0.5">
                                        {TIPO_LABEL[exame.tipo]}
                                        {exame.medicoSolicitante
                                            ? ` · ${exame.medicoSolicitante}`
                                            : ""}
                                    </p>

                                    {exame.laboratorio && (
                                        <p className="text-xs text-[#4f665a] mt-1 flex items-center gap-1.5">
                                            <Building2 className="h-3.5 w-3.5 text-[#9db4aa]" />
                                            {exame.laboratorio}
                                        </p>
                                    )}

                                    {exame.dataHoraAgendada && (
                                        <p className="text-xs text-[#4f665a] mt-0.5 flex items-center gap-1.5">
                                            <CalendarClock className="h-3.5 w-3.5 text-[#9db4aa]" />
                                            {fmtDataHora(exame.dataHoraAgendada)}
                                        </p>
                                    )}

                                    {exame.dataRealizacao && (
                                        <p className="text-[11px] text-[#9db4aa] mt-0.5">
                                            Realizado em {fmtData(exame.dataRealizacao)}
                                        </p>
                                    )}

                                    {exame.resultadoResumo && (
                                        <p className="text-xs text-[#4f665a] mt-1 bg-[#f4fbf8] rounded-lg p-2">
                                            {exame.resultadoResumo}
                                        </p>
                                    )}

                                    {exame.observacoes && (
                                        <p className="text-xs text-[#6b8c7d] mt-1">
                                            {exame.observacoes}
                                        </p>
                                    )}

                                    {exame.arquivos.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {exame.arquivos.map((a) => (
                                                <button
                                                    key={a.path}
                                                    type="button"
                                                    onClick={() => abrirArquivo(a.path)}
                                                    className="w-full flex items-center gap-2 text-xs text-[#5ba58c] font-semibold bg-[#f4fbf8] rounded-lg px-3 py-2 hover:bg-[#e3f1eb]"
                                                >
                                                    <FileText className="h-3.5 w-3.5 shrink-0" />
                                                    <span className="truncate flex-1 text-left">
                                                        {a.nome}
                                                    </span>
                                                    <Download className="h-3.5 w-3.5 shrink-0" />
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-2">
                                        <button
                                            type="button"
                                            onClick={() => pedirArquivo(exame.id)}
                                            disabled={anexandoId === exame.id}
                                            className="flex items-center gap-1.5 text-xs font-semibold text-[#5ba58c] hover:underline disabled:opacity-50"
                                        >
                                            {anexandoId === exame.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Paperclip className="h-3.5 w-3.5" />
                                            )}
                                            Anexar laudo ou pedido
                                        </button>

                                        {exame.origem === "paciente" && (
                                            <button
                                                type="button"
                                                onClick={() => removerExame(exame.id)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-[#9db4aa] hover:text-rose-500 ml-auto"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remover
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </MiCard>
                    ))
                )}
            </div>

            <button
                type="button"
                onClick={() => setModalNovo(true)}
                className="sm:hidden fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-[#5ba58c] text-white shadow-lg flex items-center justify-center"
                aria-label="Novo exame"
            >
                <Plus className="h-6 w-6" />
            </button>

            <Dialog open={modalNovo} onOpenChange={setModalNovo}>
                <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Novo exame</DialogTitle>
                        <DialogDescription>
                            Cadastre um exame que você fez ou que precisa fazer.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Nome do exame
                            </label>
                            <Input
                                value={form.nomeExame}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, nomeExame: e.target.value }))
                                }
                                placeholder="Ex.: Hemograma completo"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">Tipo</label>
                                <select
                                    value={form.tipo}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            tipo: e.target.value as ExameTipo,
                                        }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {(Object.keys(TIPO_LABEL) as ExameTipo[]).map((t) => (
                                        <option key={t} value={t}>
                                            {TIPO_LABEL[t]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Laboratório
                                </label>
                                <Input
                                    value={form.laboratorio}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, laboratorio: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Médico solicitante
                                </label>
                                <Input
                                    value={form.medicoSolicitante}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            medicoSolicitante: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Especialidade
                                </label>
                                <Input
                                    value={form.especialidade}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, especialidade: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Data do pedido
                                </label>
                                <MiDatePicker
                                    value={form.dataSolicitacao}
                                    onChange={(iso) =>
                                        setForm((f) => ({ ...f, dataSolicitacao: iso }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Data em que fez
                                </label>
                                <MiDatePicker
                                    value={form.dataRealizacao}
                                    onChange={(iso) =>
                                        setForm((f) => ({ ...f, dataRealizacao: iso }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Observações
                            </label>
                            <Textarea
                                value={form.observacoes}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                                }
                                rows={2}
                            />
                        </div>

                        <p className="text-[11px] text-[#9db4aa]">
                            Depois de salvar, use “Anexar laudo ou pedido” para enviar o PDF ou a
                            foto.
                        </p>

                        <div className="flex gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalNovo(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-[#5ba58c] text-white"
                            >
                                {salvando ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
