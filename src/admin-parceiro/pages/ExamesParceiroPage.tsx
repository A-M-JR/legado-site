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
import {
    FileText,
    FlaskConical,
    ImagePlus,
    Loader2,
    Paperclip,
    Pencil,
    Plus,
    Trash2,
    Upload,
    X,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "@/hooks/use-toast";
import { confirmDialog } from "@/components/ui/confirm-dialog";
import { ehImagem, formatarTamanho, uploadArquivo, validarTipo } from "@/lib/uploadArquivo";
import { examesParceiroService } from "../services/examesParceiroService";
import { listPacientes, type PacienteResumo } from "../services/parceiroScope";
import { unidadesService } from "../services/unidadesService";
import { AnexoMini, AnexoTile, VisualizadorAnexo } from "@/modules/medicina-preventiva/components/ExameAnexos";
import { MP_EXAMES_PASTA } from "@/modules/medicina-preventiva/lib/storage";
import {
    fmtData,
    isoParaInputLocal,
    inputLocalParaIso,
} from "@/modules/medicina-preventiva/lib/datas";
import type { ExameArquivo, ExameMp, ExameStatus, ExameTipo } from "@/modules/medicina-preventiva/types";

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

const ACEITA = "application/pdf,image/jpeg,image/png,image/webp,image/heic";

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

/** Arquivo escolhido no formulário que ainda não subiu para o bucket. */
type Pendente = {
    id: string;
    file: File;
    preview: string | null;
};

let seqPendente = 0;

function criarPendentes(files: File[]): { pendentes: Pendente[]; recusados: string[] } {
    const pendentes: Pendente[] = [];
    const recusados: string[] = [];

    for (const file of files) {
        const erro = validarTipo(file);
        if (erro) {
            recusados.push(`${file.name}: ${erro}`);
            continue;
        }
        pendentes.push({
            id: `pend-${++seqPendente}`,
            file,
            preview: ehImagem(file.type) ? URL.createObjectURL(file) : null,
        });
    }

    return { pendentes, recusados };
}

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
    const [progresso, setProgresso] = useState("");

    const [anexosSalvos, setAnexosSalvos] = useState<ExameArquivo[]>([]);
    const [pendentes, setPendentes] = useState<Pendente[]>([]);
    const [removendoPath, setRemovendoPath] = useState<string | null>(null);
    const [arrastando, setArrastando] = useState(false);

    const [anexandoId, setAnexandoId] = useState<string | null>(null);
    const [visualizando, setVisualizando] = useState<ExameArquivo | null>(null);

    const inputFormRef = useRef<HTMLInputElement>(null);
    const inputLinhaRef = useRef<HTMLInputElement>(null);

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

    function limparPendentes(lista: Pendente[]) {
        lista.forEach((p) => p.preview && URL.revokeObjectURL(p.preview));
    }

    function fecharModal() {
        limparPendentes(pendentes);
        setPendentes([]);
        setAnexosSalvos([]);
        setForm(FORM_INICIAL);
        setEditandoId(null);
        setProgresso("");
        setModalAberto(false);
    }

    function abrirNovo() {
        limparPendentes(pendentes);
        setPendentes([]);
        setAnexosSalvos([]);
        setEditandoId(null);
        setForm(FORM_INICIAL);
        setModalAberto(true);
    }

    function abrirEdicao(e: ExameMp) {
        limparPendentes(pendentes);
        setPendentes([]);
        setAnexosSalvos(e.arquivos);
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

    function adicionarArquivos(files: FileList | File[] | null) {
        if (!files) return;
        const { pendentes: novos, recusados } = criarPendentes(Array.from(files));

        if (novos.length) setPendentes((atual) => [...atual, ...novos]);
        if (recusados.length) {
            toast({
                title: recusados.length === 1 ? "Arquivo não aceito" : "Arquivos não aceitos",
                description: recusados.join(" · "),
                variant: "destructive",
            });
        }
    }

    function removerPendente(id: string) {
        setPendentes((atual) => {
            const alvo = atual.find((p) => p.id === id);
            if (alvo?.preview) URL.revokeObjectURL(alvo.preview);
            return atual.filter((p) => p.id !== id);
        });
    }

    async function removerAnexoSalvo(arquivo: ExameArquivo) {
        if (!editandoId) return;
        const ok = await confirmDialog({
            title: "Remover este anexo?",
            description: `${arquivo.nome} sai do exame e do armazenamento. O paciente deixa de ver esse laudo.`,
            confirmLabel: "Remover",
        });
        if (!ok) return;

        setRemovendoPath(arquivo.path);
        try {
            await examesParceiroService.removerAnexo(editandoId, arquivo.path);
            setAnexosSalvos((atual) => atual.filter((a) => a.path !== arquivo.path));
            toast({ title: "Anexo removido" });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao remover",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setRemovendoPath(null);
        }
    }

    /** Sobe os pendentes e grava no exame. Devolve quantos entraram. */
    async function enviarPendentes(exameId: string, titularId: string): Promise<number> {
        if (pendentes.length === 0) return 0;

        const enviados: ExameArquivo[] = [];
        const falhas: string[] = [];

        for (let i = 0; i < pendentes.length; i++) {
            setProgresso(`Enviando anexo ${i + 1} de ${pendentes.length}...`);
            try {
                enviados.push(
                    await uploadArquivo({
                        file: pendentes[i].file,
                        titularId,
                        pasta: MP_EXAMES_PASTA,
                    })
                );
            } catch (err) {
                falhas.push(
                    `${pendentes[i].file.name}: ${
                        err instanceof Error ? err.message : "falha no envio"
                    }`
                );
            }
        }

        setProgresso("");

        if (enviados.length) await examesParceiroService.anexarVarios(exameId, enviados);
        if (falhas.length) {
            toast({
                title: "Alguns anexos não subiram",
                description: falhas.join(" · "),
                variant: "destructive",
            });
        }

        return enviados.length;
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

            let exameId = editandoId;
            if (exameId) {
                await examesParceiroService.update(exameId, dados);
            } else {
                exameId = await examesParceiroService.create(dados);
            }

            const anexados = await enviarPendentes(exameId, form.titularId);

            toast({
                title: editandoId ? "Exame atualizado" : "Exame lançado",
                description: anexados
                    ? `${anexados} anexo(s) publicados para o paciente.`
                    : "O paciente foi avisado.",
            });

            fecharModal();
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
            setProgresso("");
        }
    }

    function pedirArquivoNaLinha(exameId: string) {
        setAnexandoId(exameId);
        inputLinhaRef.current?.click();
    }

    /** Anexo rápido pela tabela — aceita vários de uma vez. */
    async function anexarNaLinha(ev: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(ev.target.files ?? []);
        const exameId = anexandoId;
        ev.target.value = "";
        if (!files.length || !exameId) {
            setAnexandoId(null);
            return;
        }

        const exame = exames.find((e) => e.id === exameId);
        if (!exame) {
            setAnexandoId(null);
            return;
        }

        const enviados: ExameArquivo[] = [];
        const falhas: string[] = [];

        for (const file of files) {
            const erroTipo = validarTipo(file);
            if (erroTipo) {
                falhas.push(`${file.name}: ${erroTipo}`);
                continue;
            }
            try {
                enviados.push(
                    await uploadArquivo({
                        file,
                        titularId: exame.titularId,
                        pasta: MP_EXAMES_PASTA,
                    })
                );
            } catch (err) {
                falhas.push(
                    `${file.name}: ${err instanceof Error ? err.message : "falha no envio"}`
                );
            }
        }

        try {
            if (enviados.length) {
                await examesParceiroService.anexarVarios(exameId, enviados);
                toast({
                    title: enviados.length === 1 ? "Laudo anexado" : `${enviados.length} anexos`,
                    description: "Já aparecem no app do paciente.",
                });
                carregar();
            }
            if (falhas.length) {
                toast({
                    title: "Alguns anexos não subiram",
                    description: falhas.join(" · "),
                    variant: "destructive",
                });
            }
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

    async function excluirExame(exame: ExameMp) {
        const ok = await confirmDialog({
            title: "Excluir este exame?",
            description: `${exame.nomeExame} e seus ${exame.arquivos.length} anexo(s) serão apagados. O paciente perde o acesso.`,
            confirmLabel: "Excluir",
        });
        if (!ok) return;

        try {
            await examesParceiroService.remove(exame.id);
            toast({ title: "Exame excluído" });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao excluir",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    const totalAnexosForm = anexosSalvos.length + pendentes.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Exames dos pacientes</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        Solicite, agende e publique o laudo com imagens — o paciente vê no app.
                    </p>
                </div>
                <Button onClick={abrirNovo} className="bg-[#5ba58c] text-white">
                    <Plus className="mr-2 h-4 w-4" /> Novo exame
                </Button>
            </div>

            <input
                ref={inputLinhaRef}
                type="file"
                accept={ACEITA}
                multiple
                className="hidden"
                onChange={anexarNaLinha}
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
                                    <TableHead>Laudos e imagens</TableHead>
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
                                                    {e.laboratorio ||
                                                        TIPOS.find((t) => t.id === e.tipo)?.label}
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
                                                    <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
                                                        {e.arquivos.slice(0, 4).map((a) => (
                                                            <AnexoMini
                                                                key={a.path}
                                                                arquivo={a}
                                                                onAbrir={setVisualizando}
                                                            />
                                                        ))}
                                                        {e.arquivos.length > 4 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => abrirEdicao(e)}
                                                                className="h-10 px-2 rounded-lg border border-[#d7e8e0] text-[11px] font-semibold text-[#5ba58c]"
                                                            >
                                                                +{e.arquivos.length - 4}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right whitespace-nowrap">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Anexar laudos ou imagens"
                                                    onClick={() => pedirArquivoNaLinha(e.id)}
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
                                                    title="Editar exame e laudo"
                                                    onClick={() => abrirEdicao(e)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Excluir exame"
                                                    onClick={() => excluirExame(e)}
                                                    className="text-[#9db4aa] hover:text-rose-500"
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

            <Dialog open={modalAberto} onOpenChange={(aberto) => !aberto && fecharModal()}>
                <DialogContent className="sm:max-w-[640px] max-h-[92vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">
                            {editandoId ? "Editar exame e laudo" : "Novo exame"}
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
                            <p className="text-[11px] text-[#9db4aa]">
                                Marque “Resultado disponível” quando o laudo já estiver anexado —
                                é isso que avisa o paciente.
                            </p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Laudo — resumo do resultado
                            </label>
                            <Textarea
                                value={form.resultadoResumo}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, resultadoResumo: e.target.value }))
                                }
                                rows={3}
                                placeholder="Conclusão do laudo em linguagem simples para o paciente."
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

                        {/* Laudos, imagens e pedidos */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Laudos, imagens e pedidos
                                </label>
                                {totalAnexosForm > 0 && (
                                    <span className="text-[11px] text-[#9db4aa]">
                                        {totalAnexosForm} arquivo(s)
                                    </span>
                                )}
                            </div>

                            <input
                                ref={inputFormRef}
                                type="file"
                                accept={ACEITA}
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                    adicionarArquivos(e.target.files);
                                    e.target.value = "";
                                }}
                            />

                            <button
                                type="button"
                                onClick={() => inputFormRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setArrastando(true);
                                }}
                                onDragLeave={() => setArrastando(false)}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setArrastando(false);
                                    adicionarArquivos(e.dataTransfer.files);
                                }}
                                className={clsx(
                                    "w-full rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
                                    arrastando
                                        ? "border-[#5ba58c] bg-[#eef8f3]"
                                        : "border-[#d7e8e0] bg-[#f9fdfb] hover:border-[#5ba58c]"
                                )}
                            >
                                <Upload className="h-5 w-5 mx-auto text-[#5ba58c]" />
                                <p className="mt-1 text-sm font-semibold text-[#255f4f]">
                                    Arraste os arquivos ou clique para escolher
                                </p>
                                <p className="text-[11px] text-[#9db4aa]">
                                    PDF, JPG, PNG ou WEBP — até 10 MB cada. Fotos grandes são
                                    reduzidas automaticamente.
                                </p>
                            </button>

                            {(anexosSalvos.length > 0 || pendentes.length > 0) && (
                                <div className="flex flex-wrap gap-3 pt-1">
                                    {anexosSalvos.map((a) => (
                                        <AnexoTile
                                            key={a.path}
                                            arquivo={a}
                                            onAbrir={setVisualizando}
                                            onRemover={removerAnexoSalvo}
                                            removendo={removendoPath === a.path}
                                        />
                                    ))}

                                    {pendentes.map((p) => (
                                        <div key={p.id} className="relative w-[104px]">
                                            <div className="w-[104px] h-[104px] rounded-xl border border-dashed border-[#5ba58c] bg-[#f4fbf8] overflow-hidden flex items-center justify-center">
                                                {p.preview ? (
                                                    <img
                                                        src={p.preview}
                                                        alt={p.file.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="flex flex-col items-center gap-1 text-[#5ba58c]">
                                                        <FileText className="h-7 w-7" />
                                                        <span className="text-[10px] font-semibold uppercase">
                                                            PDF
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            <p
                                                className="mt-1 text-[11px] text-[#4f665a] truncate"
                                                title={p.file.name}
                                            >
                                                {p.file.name}
                                            </p>
                                            <p className="text-[10px] text-[#5ba58c] font-semibold">
                                                a enviar · {formatarTamanho(p.file.size)}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => removerPendente(p.id)}
                                                title="Tirar da lista"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white border border-[#d7e8e0] shadow-sm flex items-center justify-center text-[#9db4aa] hover:text-rose-500"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {totalAnexosForm === 0 && (
                                <p className="text-[11px] text-[#9db4aa] flex items-center gap-1.5">
                                    <ImagePlus className="h-3.5 w-3.5" />
                                    Nenhum laudo anexado ainda.
                                </p>
                            )}
                        </div>

                        {progresso && (
                            <p className="text-xs font-semibold text-[#5ba58c] flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progresso}
                            </p>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={fecharModal}
                                disabled={salvando}
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

            <VisualizadorAnexo arquivo={visualizando} onClose={() => setVisualizando(null)} />
        </div>
    );
}
