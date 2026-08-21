import { useEffect, useState } from "react";
import {
    Pill,
    Plus,
    Camera,
    Loader2,
    Stethoscope,
    MapPin,
    Clock,
    CalendarX,
    Power,
    Pencil,
} from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { uploadImagem } from "@/lib/uploadImage";
import { dataISOParaBR, isDataISOValida } from "@/lib/masks";
import { MiCard } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { MiDatePicker } from "@/modules/melhor-idade/components/MiDatePicker";
import { receitasService } from "../services/receitasService";
import { consultasService } from "../services/consultasService";
import { MP_RECEITAS_FOLDER, MP_STORAGE_BUCKET, isFotoValida } from "../lib/storage";
import { fmtData, fmtDataHora, fmtHora, rotuloRelativo } from "../lib/datas";
import type { ConsultaMp, ReceitaMp } from "../types";

const FREQUENCIA_OPCOES = [
    "1x ao dia",
    "2x ao dia",
    "3x ao dia",
    "De 8/8h",
    "De 12/12h",
    "Semanal",
    "Outro",
] as const;

const STATUS_LABEL: Record<ConsultaMp["status"], string> = {
    agendada: "Agendada",
    confirmada: "Confirmada",
    realizada: "Realizada",
    cancelada: "Cancelada",
    faltou: "Faltou",
};

const STATUS_COR: Record<ConsultaMp["status"], string> = {
    agendada: "bg-[#e3f1eb] text-[#255f4f]",
    confirmada: "bg-emerald-100 text-emerald-700",
    realizada: "bg-slate-100 text-slate-600",
    cancelada: "bg-rose-100 text-rose-700",
    faltou: "bg-amber-100 text-amber-700",
};

const FORM_INICIAL = {
    medicamento: "",
    dosagem: "",
    frequencia: "",
    frequenciaOutro: "",
    inicio: "",
    validade: "",
    medico: "",
    especialidade: "",
    fotoUrl: "",
    observacoes: "",
};

export default function ReceitasConsultasPage() {
    const [receitas, setReceitas] = useState<ReceitaMp[]>([]);
    const [consultas, setConsultas] = useState<ConsultaMp[]>([]);
    const [modalReceita, setModalReceita] = useState(false);
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

    useEffect(() => {
        receitasService.list().then(setReceitas);
        consultasService.list().then(setConsultas);
    }, []);

    const ativas = receitas.filter((r) => r.ativa);
    const inativas = receitas.filter((r) => !r.ativa);
    const futuras = consultasService.futuras(consultas);
    const passadas = consultasService.passadas(consultas);

    function abrirNova() {
        setEditandoId(null);
        setForm(FORM_INICIAL);
        setModalReceita(true);
    }

    function abrirEdicao(r: ReceitaMp) {
        const preset = FREQUENCIA_OPCOES.includes(
            r.frequencia as (typeof FREQUENCIA_OPCOES)[number]
        );
        setEditandoId(r.id);
        setForm({
            medicamento: r.medicamento,
            dosagem: r.dosagem,
            frequencia: preset ? r.frequencia : r.frequencia ? "Outro" : "",
            frequenciaOutro: preset ? "" : r.frequencia,
            inicio: r.inicio ? r.inicio.slice(0, 10) : "",
            validade: r.validade ? r.validade.slice(0, 10) : "",
            medico: r.medico,
            especialidade: r.especialidade,
            fotoUrl: isFotoValida(r.fotoUrl) ? r.fotoUrl! : "",
            observacoes: r.observacoes,
        });
        setModalReceita(true);
    }

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        setEnviandoFoto(true);
        const url = await uploadImagem({
            file,
            folder: MP_RECEITAS_FOLDER,
            bucket: MP_STORAGE_BUCKET,
        });
        setEnviandoFoto(false);

        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto da receita.",
                variant: "destructive",
            });
            return;
        }
        setForm((f) => ({ ...f, fotoUrl: url }));
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.medicamento.trim() || salvando || enviandoFoto) return;

        for (const [label, valor] of [
            ["Início", form.inicio],
            ["Validade", form.validade],
        ] as const) {
            if (valor && !isDataISOValida(valor)) {
                toast({
                    title: `${label} inválida`,
                    description: "Escolha uma data no calendário.",
                    variant: "destructive",
                });
                return;
            }
        }

        const frequencia =
            form.frequencia === "Outro" ? form.frequenciaOutro.trim() : form.frequencia.trim();

        setSalvando(true);
        try {
            const payload = {
                medicamento: form.medicamento.trim(),
                dosagem: form.dosagem.trim(),
                frequencia,
                inicio: form.inicio,
                validade: form.validade,
                medico: form.medico.trim(),
                especialidade: form.especialidade.trim(),
                dataConsulta: form.inicio ? dataISOParaBR(form.inicio) : "",
                fotoUrl: isFotoValida(form.fotoUrl) ? form.fotoUrl : undefined,
                ativa: true,
                observacoes: form.observacoes.trim(),
            };

            setReceitas(
                editandoId
                    ? await receitasService.update(editandoId, payload)
                    : await receitasService.add(payload)
            );

            setModalReceita(false);
            setForm(FORM_INICIAL);
            setEditandoId(null);
            toast({ title: editandoId ? "Receita atualizada" : "Receita salva" });
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

    async function alternarAtiva(r: ReceitaMp) {
        try {
            setReceitas(await receitasService.setAtiva(r.id, !r.ativa));
            toast({ title: r.ativa ? "Receita arquivada" : "Receita reativada" });
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    function renderReceita(r: ReceitaMp) {
        return (
            <MiCard key={r.id} className="p-4">
                <div className="flex items-start gap-3">
                    {r.fotoUrl ? (
                        <button
                            type="button"
                            onClick={() => setFotoAmpliada(r.fotoUrl!)}
                            className="shrink-0"
                        >
                            <img
                                src={r.fotoUrl}
                                alt={`Receita de ${r.medicamento}`}
                                className="h-14 w-14 rounded-xl object-cover border border-[#e6efe9]"
                            />
                        </button>
                    ) : (
                        <div className="shrink-0 p-3 rounded-xl bg-blue-50 text-blue-600">
                            <Pill className="h-5 w-5" />
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <p
                            className={clsx(
                                "font-bold text-sm sm:text-base",
                                r.ativa ? "text-[#255f4f]" : "text-[#9db4aa]"
                            )}
                        >
                            {r.medicamento}
                        </p>
                        <p className="text-xs text-[#6b8c7d] mt-0.5">
                            {[r.dosagem, r.frequencia].filter(Boolean).join(" · ")}
                        </p>
                        {(r.medico || r.especialidade) && (
                            <p className="text-xs text-[#9db4aa] mt-0.5">
                                {[r.medico, r.especialidade].filter(Boolean).join(" · ")}
                            </p>
                        )}
                        {r.validade && (
                            <p className="text-[11px] text-[#9db4aa] mt-1">
                                Validade: {fmtData(r.validade)}
                            </p>
                        )}
                        {r.observacoes && (
                            <p className="text-xs text-[#6b8c7d] mt-1">{r.observacoes}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => abrirEdicao(r)}
                            className="p-2 rounded-lg text-[#9db4aa] hover:text-[#5ba58c] hover:bg-[#f4fbf8]"
                            aria-label="Editar receita"
                        >
                            <Pencil className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => alternarAtiva(r)}
                            className="p-2 rounded-lg text-[#9db4aa] hover:text-amber-600 hover:bg-amber-50"
                            aria-label={r.ativa ? "Arquivar receita" : "Reativar receita"}
                        >
                            <Power className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </MiCard>
        );
    }

    function renderConsulta(c: ConsultaMp, futura: boolean) {
        return (
            <MiCard key={c.id} className="p-4" variant={futura ? "accent" : "default"}>
                <div className="flex items-start gap-3">
                    <div className="shrink-0 p-3 rounded-xl bg-white text-[#5ba58c] shadow-sm">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-[#255f4f] text-sm sm:text-base">
                                {c.profissional || "Consulta"}
                            </p>
                            <span
                                className={clsx(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    STATUS_COR[c.status]
                                )}
                            >
                                {STATUS_LABEL[c.status]}
                            </span>
                            {futura && (
                                <span className="text-[10px] font-bold text-white bg-[#5ba58c] px-2 py-0.5 rounded-full">
                                    {rotuloRelativo(c.dataHora)}
                                </span>
                            )}
                        </div>
                        {c.especialidade && (
                            <p className="text-xs text-[#6b8c7d] mt-0.5">{c.especialidade}</p>
                        )}
                        <p className="text-xs text-[#4f665a] mt-1 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#9db4aa]" />
                            {fmtDataHora(c.dataHora)} ({fmtHora(c.dataHora)})
                        </p>
                        {c.local && (
                            <p className="text-xs text-[#4f665a] mt-0.5 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-[#9db4aa]" />
                                {c.local}
                            </p>
                        )}
                        {c.observacoes && (
                            <p className="text-xs text-[#6b8c7d] mt-1">{c.observacoes}</p>
                        )}
                    </div>
                </div>
            </MiCard>
        );
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                eyebrow="Acompanhamento"
                title="Receitas e consultas"
                subtitle="Suas receitas em um lugar só e a agenda que a clínica marcou para você."
            />

            <Tabs defaultValue="consultas">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="consultas">Consultas</TabsTrigger>
                    <TabsTrigger value="receitas">Receitas</TabsTrigger>
                </TabsList>

                <TabsContent value="consultas" className="space-y-5 mt-4">
                    <MiCard variant="soft" className="p-3">
                        <p className="text-xs text-[#6b8c7d] text-center">
                            As consultas são agendadas pela clínica. Precisa remarcar? Fale com a
                            equipe.
                        </p>
                    </MiCard>

                    <section className="space-y-2">
                        <h2 className="text-base font-bold text-[#255f4f]">Próximas</h2>
                        {futuras.length === 0 ? (
                            <MiCard variant="soft" className="p-6 text-center">
                                <CalendarX className="h-6 w-6 mx-auto text-[#9db4aa]" />
                                <p className="text-sm text-[#6b8c7d] mt-2">
                                    Nenhuma consulta agendada no momento.
                                </p>
                            </MiCard>
                        ) : (
                            <div className="space-y-2">
                                {futuras.map((c) => renderConsulta(c, true))}
                            </div>
                        )}
                    </section>

                    {passadas.length > 0 && (
                        <section className="space-y-2">
                            <h2 className="text-base font-bold text-[#255f4f]">Histórico</h2>
                            <div className="space-y-2">
                                {passadas.map((c) => renderConsulta(c, false))}
                            </div>
                        </section>
                    )}
                </TabsContent>

                <TabsContent value="receitas" className="space-y-5 mt-4">
                    <div className="flex justify-end">
                        <Button
                            onClick={abrirNova}
                            className="bg-[#5ba58c] text-white rounded-xl"
                            size="sm"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Nova receita
                        </Button>
                    </div>

                    {ativas.length === 0 && inativas.length === 0 ? (
                        <MiCard variant="soft" className="p-8 text-center">
                            <p className="text-sm text-[#6b8c7d]">
                                Nenhuma receita cadastrada. Tire uma foto da receita e guarde aqui.
                            </p>
                        </MiCard>
                    ) : (
                        <>
                            <div className="space-y-2">{ativas.map(renderReceita)}</div>
                            {inativas.length > 0 && (
                                <section className="space-y-2">
                                    <h2 className="text-sm font-bold text-[#9db4aa] uppercase tracking-wide">
                                        Arquivadas
                                    </h2>
                                    <div className="space-y-2">{inativas.map(renderReceita)}</div>
                                </section>
                            )}
                        </>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={modalReceita} onOpenChange={setModalReceita}>
                <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">
                            {editandoId ? "Editar receita" : "Nova receita"}
                        </DialogTitle>
                        <DialogDescription>
                            Guarde o medicamento, a posologia e a foto da receita.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Medicamento
                            </label>
                            <Input
                                value={form.medicamento}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, medicamento: e.target.value }))
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Dosagem
                                </label>
                                <Input
                                    value={form.dosagem}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, dosagem: e.target.value }))
                                    }
                                    placeholder="Ex.: 50 mg"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Frequência
                                </label>
                                <select
                                    value={form.frequencia}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, frequencia: e.target.value }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    <option value="">Selecione</option>
                                    {FREQUENCIA_OPCOES.map((f) => (
                                        <option key={f} value={f}>
                                            {f}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {form.frequencia === "Outro" && (
                            <Input
                                value={form.frequenciaOutro}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, frequenciaOutro: e.target.value }))
                                }
                                placeholder="Descreva a frequência"
                            />
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Início
                                </label>
                                <MiDatePicker
                                    value={form.inicio}
                                    onChange={(iso) => setForm((f) => ({ ...f, inicio: iso }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Validade
                                </label>
                                <MiDatePicker
                                    value={form.validade}
                                    onChange={(iso) => setForm((f) => ({ ...f, validade: iso }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Médico
                                </label>
                                <Input
                                    value={form.medico}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, medico: e.target.value }))
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

                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Foto da receita
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#c2e1d4] text-sm text-[#5ba58c] font-semibold">
                                    {enviandoFoto ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                    {enviandoFoto ? "Enviando..." : "Escolher foto"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleUpload}
                                    />
                                </label>
                                {form.fotoUrl && (
                                    <img
                                        src={form.fotoUrl}
                                        alt="Prévia da receita"
                                        className="h-12 w-12 rounded-xl object-cover border border-[#e6efe9]"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalReceita(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando || enviandoFoto}
                                className="flex-1 bg-[#5ba58c] text-white"
                            >
                                {salvando ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!fotoAmpliada} onOpenChange={() => setFotoAmpliada(null)}>
                <DialogContent className="sm:max-w-[640px] p-2">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Foto da receita</DialogTitle>
                        <DialogDescription>Imagem ampliada</DialogDescription>
                    </DialogHeader>
                    {fotoAmpliada && (
                        <img
                            src={fotoAmpliada}
                            alt="Receita ampliada"
                            className="w-full rounded-xl"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
