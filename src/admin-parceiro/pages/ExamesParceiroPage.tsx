import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { FlaskConical, Loader2, Paperclip, Plus, FileText, Pencil } from "lucide-react";
import clsx from "clsx";
import { toast } from "@/hooks/use-toast";
import { assinarArquivo, uploadArquivo } from "@/lib/uploadArquivo";
import { examesParceiroService } from "../services/examesParceiroService";
import { listPacientes, type PacienteResumo } from "../services/parceiroScope";
import { unidadesService } from "../services/unidadesService";
import { MP_EXAMES_PASTA } from "@/modules/medicina-preventiva/lib/storage";
import { fmtData, isoParaInputLocal, inputLocalParaIso } from "@/modules/medicina-preventiva/lib/datas";
import type { ExameMp, ExameStatus, ExameTipo } from "@/modules/medicina-preventiva/types";

const STATUS: { id: ExameStatus; label: string; cor: string }[] = [
    { id: "solicitado", label: "Solicitado", cor: "bg-amber-100 text-amber-700" },
    { id: "agendado", label: "Agendado", cor: "bg-emerald-100 text-emerald-700" },
    { id: "realizado", label: "Realizado", cor: "bg-blue-100 text-blue-700" },
    { id: "resultado_disponivel", label: "Resultado disponível", cor: "bg-violet-100 text-violet-700" },
    { id: "cancelado", label: "Cancelado", cor: "bg-rose-100 text-rose-700" },
];

const TIPOS: { id: ExameTipo; label: string }[] = [
    { id: "laboratorial", label: "Laboratorial" },
    { id: "imagem", label: "Imagem" },
    { id: "outro", label: "Outro" },
];

const FORM_INICIAL = {
    titularId: "",
    nomeExame: "",
    tipo: "laboratorial" as ExameTipo,
    medicoSolicitante: "",
    especialidade: "",
    laboratorio: "",
    dataSolicitacao: "",
    dataHoraAgendadaLocal: "",
    dataRealizacao: "",
    status: "solicitado" as ExameStatus,
    resultadoResumo: "",
    observacoes: "",
};

export default function ExamesParceiroPage() {
    const { userProfile } = useOutletContext<{ userProfile?: { parceiro_id?: string | null } }>();
    const parceiroId = userProfile?.parceiro_id ?? null;

    const [exames, setExames] = useState<ExameMp[]>([]);
    const [pacientes, setPacientes] = useState<PacienteResumo[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroPaciente, setFiltroPaciente] = useState("todos");
    const [filtroStatus, setFiltroStatus] = useState<ExameStatus | "todos">("todos");

    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);
    const [anexandoId, setAnexandoId] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const carregar = useCallback(async () => {
        setLoading(true);
        setExames(
            await examesParceiroService.list({
                titularId: filtroPaciente === "todos" ? undefined : filtroPaciente,
                status: filtroStatus,
            })
        );
        setLoading(false);
    }, [filtroPaciente, filtroStatus]);

    useEffect(() => {
        if (parceiroId) listPacientes(parceiroId).then(setPacientes);
    }, [parceiroId]);

    useEffect(() => {
        carregar();
    }, [carregar]);

    const pacienteSelecionado = useMemo(
        () => pacientes.find((p) => p.titularId === form.titularId) ?? null,
        [pacientes, form.titularId]
    );

    function abrirNovo() {
        setEditandoId(null);
        setForm(FORM_INICIAL);
        setModalAberto(true);
    }

    function abrirEdicao(e: ExameMp) {
        setEditandoId(e.id);
        setForm({
            titularId: e.titularId,
            nomeExame: e.nomeExame,
            tipo: e.tipo,
            medicoSolicitante: e.medicoSolicitante,
            especialidade: e.especialidade,
            laboratorio: e.laboratorio,
            dataSolicitacao: e.dataSolicitacao ? e.dataSolicitacao.slice(0, 10) : "",
            dataHoraAgendadaLocal: e.dataHoraAgendada ? isoParaInputLocal(e.dataHoraAgendada) : "",
            dataRealizacao: e.dataRealizacao ? e.dataRealizacao.slice(0, 10) : "",
            status: e.status,
            resultadoResumo: e.resultadoResumo,
            observacoes: e.observacoes,
        });
        setModalAberto(true);
    }

    async function salvar(ev: React.FormEvent) {
        ev.preventDefault();
        if (salvando) return;

        if (!form.titularId || !form.nomeExame.trim()) {
            toast({
                title: "Campos obrigatórios",
                description: "Escolha o paciente e informe o exame.",
                variant: "destructive",
            });
            return;
        }

        setSalvando(true);
        try {
            const unidadeId = await unidadesService.getUnidadeDoPaciente(form.titularId);
            const dados = {
                titularId: form.titularId,
                authId: pacienteSelecionado?.authId ?? null,
                unidadeId,
                nomeExame: form.nomeExame.trim(),
                tipo: form.tipo,
                medicoSolicitante: form.medicoSolicitante.trim(),
                especialidade: form.especialidade.trim(),
                laboratorio: form.laboratorio.trim(),
                dataSolicitacao: form.dataSolicitacao,
                dataHoraAgendada: form.dataHoraAgendadaLocal
                    ? inputLocalParaIso(form.dataHoraAgendadaLocal)
                    : "",
                dataRealizacao: form.dataRealizacao,
                status: form.status,
                resultadoResumo: form.resultadoResumo.trim(),
                observacoes: form.observacoes.trim(),
            };

            if (editandoId) {
                await examesParceiroService.update(editandoId, dados);
                toast({ title: "Exame atualizado" });
            } else {
                await examesParceiroService.create(dados);
                toast({ title: "Exame lançado", description: "O paciente foi avisado." });
            }

            setModalAberto(false);
            setForm(FORM_INICIAL);
            setEditandoId(null);
            carregar();
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

    async function anexar(ev: React.ChangeEvent<HTMLInputElement>) {
        const file = ev.target.files?.[0];
        const exameId = anexandoId;
        ev.target.value = "";
        if (!file || !exameId) return;

        const exame = exames.find((e) => e.id === exameId);
        if (!exame) return;

        try {
            const anexo = await uploadArquivo({
                file,
                titularId: exame.titularId,
                pasta: MP_EXAMES_PASTA,
            });
            await examesParceiroService.anexar(exameId, anexo);
            toast({ title: "Laudo anexado" });
            carregar();
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
        if (url) window.open(url, "_blank", "noopener");
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Exames dos pacientes</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        Solicite, agende e publique o resultado — o paciente vê no app.
                    </p>
                </div>
                <Button onClick={abrirNovo} className="bg-[#5ba58c] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo exame
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={anexar}
            />

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <select
                        value={filtroPaciente}
                        onChange={(e) => setFiltroPaciente(e.target.value)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="todos">Todos os pacientes</option>
                        {pacientes.map((p) => (
                            <option key={p.titularId} value={p.titularId}>
                                {p.nome}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filtroStatus}
                        onChange={(e) => setFiltroStatus(e.target.value as ExameStatus | "todos")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="todos">Todos os status</option>
                        {STATUS.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">
                        {exames.length} exame(s)
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : exames.length === 0 ? (
                        <p className="py-12 text-center text-sm text-[#6b8c7d]">
                            Nenhum exame com esses filtros.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Exame</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Datas</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Anexos</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exames.map((e) => {
                                    const status = STATUS.find((s) => s.id === e.status);
                                    return (
                                        <TableRow key={e.id}>
                                            <TableCell className="font-medium text-[#255f4f]">
                                                <span className="flex items-center gap-2">
                                                    <FlaskConical className="h-4 w-4 text-blue-500" />
                                                    {e.nomeExame}
                                                </span>
                                                <span className="block text-xs text-[#9db4aa]">
                                                    {e.laboratorio || TIPOS.find((t) => t.id === e.tipo)?.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>{e.pacienteNome || "—"}</TableCell>
                                            <TableCell className="text-xs text-[#4f665a]">
                                                {e.dataSolicitacao && (
                                                    <span className="block">
                                                        Pedido: {fmtData(e.dataSolicitacao)}
                                                    </span>
                                                )}
                                                {e.dataRealizacao && (
                                                    <span className="block">
                                                        Feito: {fmtData(e.dataRealizacao)}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={clsx(
                                                        "text-[11px] font-semibold px-2 py-1 rounded-full",
                                                        status?.cor
                                                    )}
                                                >
                                                    {status?.label}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {e.arquivos.length === 0 ? (
                                                    <span className="text-xs text-[#9db4aa]">—</span>
                                                ) : (
                                                    <div className="space-y-1">
                                                        {e.arquivos.map((a) => (
                                                            <button
                                                                key={a.path}
                                                                type="button"
                                                                onClick={() => abrirArquivo(a.path)}
                                                                className="flex items-center gap-1 text-xs text-[#5ba58c] hover:underline"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                <span className="max-w-[120px] truncate">
                                                                    {a.nome}
                                                                </span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => pedirArquivo(e.id)}
                                                    disabled={anexandoId === e.id}
                                                >
                                                    {anexandoId === e.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Paperclip className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => abrirEdicao(e)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">
                            {editandoId ? "Editar exame" : "Novo exame"}
                        </DialogTitle>
                        <DialogDescription>
                            O paciente é avisado ao solicitar, agendar e liberar o resultado.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Paciente</label>
                            <select
                                value={form.titularId}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, titularId: e.target.value }))
                                }
                                disabled={!!editandoId}
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-60"
                                required
                            >
                                <option value="">Selecione o paciente</option>
                                {pacientes.map((p) => (
                                    <option key={p.titularId} value={p.titularId}>
                                        {p.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Nome do exame
                                </label>
                                <Input
                                    value={form.nomeExame}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, nomeExame: e.target.value }))
                                    }
                                    required
                                />
                            </div>
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
                                    {TIPOS.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Data do pedido
                                </label>
                                <Input
                                    type="date"
                                    value={form.dataSolicitacao}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dataSolicitacao: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Agendado para
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={form.dataHoraAgendadaLocal}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            dataHoraAgendadaLocal: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Realizado em
                                </label>
                                <Input
                                    type="date"
                                    value={form.dataRealizacao}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dataRealizacao: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Status</label>
                            <select
                                value={form.status}
                                onChange={(e) =>
                                    setForm((f) => ({
                                        ...f,
                                        status: e.target.value as ExameStatus,
                                    }))
                                }
                                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                            >
                                {STATUS.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Resumo do resultado
                            </label>
                            <Textarea
                                value={form.resultadoResumo}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, resultadoResumo: e.target.value }))
                                }
                                rows={2}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Orientações ao paciente
                            </label>
                            <Textarea
                                value={form.observacoes}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                                }
                                rows={2}
                                placeholder="Jejum de 12 horas, levar documento..."
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalAberto(false)}
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
