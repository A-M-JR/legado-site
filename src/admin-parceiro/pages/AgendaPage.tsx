import { useCallback, useEffect, useMemo, useState } from "react";
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
import { CalendarPlus, Loader2, Pencil, CalendarClock, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { agendaParceiroService } from "../services/agendaService";
import { listPacientes, type PacienteResumo } from "../services/parceiroScope";
import { unidadesService } from "../services/unidadesService";
import { fmtDataHora, isoParaInputLocal, inputLocalParaIso } from "@/modules/medicina-preventiva/lib/datas";
import type {
    ConsultaMp,
    ConsultaStatus,
    ConsultaTipo,
    Unidade,
} from "@/modules/medicina-preventiva/types";

const STATUS: { id: ConsultaStatus; label: string; cor: string }[] = [
    { id: "agendada", label: "Agendada", cor: "bg-emerald-100 text-emerald-700" },
    { id: "confirmada", label: "Confirmada", cor: "bg-blue-100 text-blue-700" },
    { id: "realizada", label: "Realizada", cor: "bg-slate-100 text-slate-600" },
    { id: "cancelada", label: "Cancelada", cor: "bg-rose-100 text-rose-700" },
    { id: "faltou", label: "Faltou", cor: "bg-amber-100 text-amber-700" },
];

const TIPOS: { id: ConsultaTipo; label: string }[] = [
    { id: "presencial", label: "Presencial" },
    { id: "online", label: "Online" },
    { id: "retorno", label: "Retorno" },
    { id: "exame", label: "Exame" },
];

const FORM_INICIAL = {
    titularId: "",
    unidadeId: "",
    dataHoraLocal: "",
    profissional: "",
    especialidade: "",
    local: "",
    tipo: "presencial" as ConsultaTipo,
    observacoes: "",
    status: "agendada" as ConsultaStatus,
};

export default function AgendaPage() {
    const { userProfile } = useOutletContext<{ userProfile?: { parceiro_id?: string | null } }>();
    const parceiroId = userProfile?.parceiro_id ?? null;

    const [consultas, setConsultas] = useState<ConsultaMp[]>([]);
    const [pacientes, setPacientes] = useState<PacienteResumo[]>([]);
    const [unidades, setUnidades] = useState<Unidade[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtroPaciente, setFiltroPaciente] = useState("todos");
    const [filtroStatus, setFiltroStatus] = useState<ConsultaStatus | "todos">("todos");
    const [somenteFuturas, setSomenteFuturas] = useState(true);

    const [modalAberto, setModalAberto] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);

    const carregar = useCallback(async () => {
        setLoading(true);
        const lista = await agendaParceiroService.list({
            titularId: filtroPaciente === "todos" ? undefined : filtroPaciente,
            status: filtroStatus,
            de: somenteFuturas ? new Date().toISOString() : undefined,
        });
        setConsultas(lista);
        setLoading(false);
    }, [filtroPaciente, filtroStatus, somenteFuturas]);

    useEffect(() => {
        if (!parceiroId) {
            setLoading(false);
            return;
        }
        listPacientes(parceiroId).then(setPacientes);
        unidadesService.list().then(setUnidades);
    }, [parceiroId]);

    useEffect(() => {
        if (parceiroId) carregar();
    }, [parceiroId, carregar]);

    const pacienteSelecionado = useMemo(
        () => pacientes.find((p) => p.titularId === form.titularId) ?? null,
        [pacientes, form.titularId]
    );

    async function abrirNova() {
        setEditandoId(null);
        setForm(FORM_INICIAL);
        setModalAberto(true);
    }

    async function abrirEdicao(c: ConsultaMp) {
        setEditandoId(c.id);
        setForm({
            titularId: c.titularId,
            unidadeId: c.unidadeId ?? "",
            dataHoraLocal: isoParaInputLocal(c.dataHora),
            profissional: c.profissional,
            especialidade: c.especialidade,
            local: c.local,
            tipo: c.tipo,
            observacoes: c.observacoes,
            status: c.status,
        });
        setModalAberto(true);
    }

    async function selecionarPaciente(titularId: string) {
        setForm((f) => ({ ...f, titularId }));
        if (!titularId) return;
        const unidadeId = await unidadesService.getUnidadeDoPaciente(titularId);
        if (unidadeId) setForm((f) => ({ ...f, unidadeId }));
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (salvando) return;

        if (!form.titularId || !form.dataHoraLocal) {
            toast({
                title: "Campos obrigatórios",
                description: "Escolha o paciente e a data/hora.",
                variant: "destructive",
            });
            return;
        }

        setSalvando(true);
        try {
            const dados = {
                titularId: form.titularId,
                authId: pacienteSelecionado?.authId ?? null,
                unidadeId: form.unidadeId || null,
                dataHora: inputLocalParaIso(form.dataHoraLocal),
                profissional: form.profissional.trim(),
                especialidade: form.especialidade.trim(),
                local: form.local.trim(),
                tipo: form.tipo,
                observacoes: form.observacoes.trim(),
                status: form.status,
            };

            if (editandoId) {
                await agendaParceiroService.update(editandoId, dados);
                toast({ title: "Consulta atualizada", description: "O paciente foi avisado." });
            } else {
                await agendaParceiroService.create(dados);
                toast({ title: "Consulta agendada", description: "O paciente foi avisado." });
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

    async function mudarStatus(c: ConsultaMp, status: ConsultaStatus) {
        try {
            await agendaParceiroService.setStatus(c.id, status);
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function excluir(c: ConsultaMp) {
        try {
            await agendaParceiroService.remove(c.id);
            toast({ title: "Consulta excluída" });
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Agenda de consultas</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        Marque e acompanhe as consultas dos pacientes da clínica.
                    </p>
                </div>
                <Button onClick={abrirNova} className="bg-[#5ba58c] text-white">
                    <CalendarPlus className="mr-2 h-4 w-4" /> Nova consulta
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-3">
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
                        onChange={(e) =>
                            setFiltroStatus(e.target.value as ConsultaStatus | "todos")
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                        <option value="todos">Todos os status</option>
                        {STATUS.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.label}
                            </option>
                        ))}
                    </select>

                    <label className="flex items-center gap-2 text-sm text-[#4f665a]">
                        <input
                            type="checkbox"
                            checked={somenteFuturas}
                            onChange={(e) => setSomenteFuturas(e.target.checked)}
                            className="h-4 w-4"
                        />
                        Somente daqui para frente
                    </label>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">
                        {consultas.length} consulta(s)
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : consultas.length === 0 ? (
                        <p className="py-12 text-center text-sm text-[#6b8c7d]">
                            Nenhuma consulta encontrada com esses filtros.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data e hora</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Profissional</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {consultas.map((c) => {
                                    const status = STATUS.find((s) => s.id === c.status);
                                    return (
                                        <TableRow key={c.id}>
                                            <TableCell className="whitespace-nowrap font-medium text-[#255f4f]">
                                                <span className="flex items-center gap-2">
                                                    <CalendarClock className="h-4 w-4 text-[#9db4aa]" />
                                                    {fmtDataHora(c.dataHora)}
                                                </span>
                                            </TableCell>
                                            <TableCell>{c.pacienteNome || "—"}</TableCell>
                                            <TableCell>
                                                {c.profissional || "—"}
                                                {c.especialidade && (
                                                    <span className="block text-xs text-[#9db4aa]">
                                                        {c.especialidade}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="capitalize">{c.tipo}</TableCell>
                                            <TableCell>
                                                <select
                                                    value={c.status}
                                                    onChange={(e) =>
                                                        mudarStatus(
                                                            c,
                                                            e.target.value as ConsultaStatus
                                                        )
                                                    }
                                                    className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${
                                                        status?.cor ?? ""
                                                    }`}
                                                >
                                                    {STATUS.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => abrirEdicao(c)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => excluir(c)}
                                                    className="text-rose-500 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                            {editandoId ? "Editar consulta" : "Nova consulta"}
                        </DialogTitle>
                        <DialogDescription>
                            O paciente recebe um aviso no app assim que você salvar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Paciente</label>
                            <select
                                value={form.titularId}
                                onChange={(e) => selecionarPaciente(e.target.value)}
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
                                    Data e hora
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={form.dataHoraLocal}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dataHoraLocal: e.target.value }))
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
                                            tipo: e.target.value as ConsultaTipo,
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
                                    Profissional
                                </label>
                                <Input
                                    value={form.profissional}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, profissional: e.target.value }))
                                    }
                                    placeholder="Dra. Ana Souza"
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
                                    placeholder="Cardiologia"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Unidade
                                </label>
                                <select
                                    value={form.unidadeId}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, unidadeId: e.target.value }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">Sem unidade</option>
                                    {unidades.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Local / sala
                                </label>
                                <Input
                                    value={form.local}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, local: e.target.value }))
                                    }
                                    placeholder="Unidade Centro — sala 3"
                                />
                            </div>
                        </div>

                        {editandoId && (
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Status
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            status: e.target.value as ConsultaStatus,
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
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Orientações ao paciente
                            </label>
                            <Textarea
                                value={form.observacoes}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, observacoes: e.target.value }))
                                }
                                rows={3}
                                placeholder="Chegar 15 minutos antes, levar exames anteriores..."
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
