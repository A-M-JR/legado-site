import { useEffect, useState } from "react";
import {
    Pill,
    CalendarCheck,
    Plus,
    Camera,
    Stethoscope,
    Calendar,
    FileText,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { uploadImagem } from "@/lib/uploadImage";
import {
    dataBRParaISO,
    dataISOParaBR,
    isDataISOValida,
    maskDosagem,
    maskFrequencia,
} from "@/lib/masks";
import { MiCard } from "../components/MiCard";
import { MiDatePicker } from "../components/MiDatePicker";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { MI_RECEITAS_FOLDER, MI_STORAGE_BUCKET, isMiFotoUrl } from "../lib/storage";
import { fmtDataBR, receitasService } from "../services/receitasService";
import type { ConsultaMedica, ReceitaMedica } from "../types";

const FREQUENCIA_OPCOES = [
    "1x ao dia",
    "2x ao dia",
    "3x ao dia",
    "De 8/8h",
    "De 12/12h",
    "Semanal",
    "Outro",
] as const;

const FORM_INICIAL = {
    medicamento: "",
    dosagem: "",
    frequencia: "",
    frequenciaOutro: "",
    inicio: "",
    validade: "",
    medico: "",
    especialidade: "",
    data_consulta: "",
    foto_url: "",
    observacoes: "",
};

const FORM_CONSULTA_INICIAL = {
    data: "",
    medico: "",
    local: "",
    tipo: "Presencial",
};

export default function ReceitasPage() {
    const [receitas, setReceitas] = useState<ReceitaMedica[]>([]);
    const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);
    const [modalNova, setModalNova] = useState(false);
    const [modalConsulta, setModalConsulta] = useState(false);
    const [modalImagem, setModalImagem] = useState<string | null>(null);
    const [detalhe, setDetalhe] = useState<ReceitaMedica | null>(null);
    const [formEdit, setFormEdit] = useState(FORM_INICIAL);
    const [fotoPreviewEdit, setFotoPreviewEdit] = useState<string | null>(null);
    const [enviandoFotoEdit, setEnviandoFotoEdit] = useState(false);
    const [salvandoEdit, setSalvandoEdit] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [formConsulta, setFormConsulta] = useState(FORM_CONSULTA_INICIAL);
    const [consultaEditId, setConsultaEditId] = useState<string | null>(null);
    const [salvandoConsulta, setSalvandoConsulta] = useState(false);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    const receitasAtivas = receitas.filter((r) => r.ativa !== false);
    const receitasInativas = receitas.filter((r) => r.ativa === false);

    function isoFromData(value: string): string {
        if (!value) return "";
        if (value.includes("/")) return dataBRParaISO(value);
        return value.slice(0, 10);
    }

    function abrirEditar(r: ReceitaMedica) {
        const freqPreset = FREQUENCIA_OPCOES.includes(
            r.frequencia as (typeof FREQUENCIA_OPCOES)[number]
        );
        setDetalhe(r);
        setFormEdit({
            medicamento: r.medicamento,
            dosagem: r.dosagem,
            frequencia: freqPreset ? r.frequencia : r.frequencia ? "Outro" : "",
            frequenciaOutro: freqPreset ? "" : r.frequencia,
            inicio: isoFromData(r.inicio),
            validade: isoFromData(r.validade),
            medico: r.medico,
            especialidade: r.especialidade,
            data_consulta: isoFromData(r.data_consulta),
            foto_url: isMiFotoUrl(r.foto_url) ? r.foto_url! : "",
            observacoes: r.observacoes ?? "",
        });
        setFotoPreviewEdit(null);
    }

    function fecharEditar() {
        if (fotoPreviewEdit) URL.revokeObjectURL(fotoPreviewEdit);
        setFotoPreviewEdit(null);
        setEnviandoFotoEdit(false);
        setDetalhe(null);
        setFormEdit(FORM_INICIAL);
    }

    useEffect(() => {
        receitasService.listReceitas().then(setReceitas);
        receitasService.listConsultas().then(setConsultas);
    }, []);

    function fecharNova() {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        setFotoPreview(null);
        setEnviandoFoto(false);
        setForm(FORM_INICIAL);
        setModalNova(false);
    }

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.medicamento.trim() || !form.medico.trim() || salvando || enviandoFoto) return;

        if (form.foto_url?.startsWith("blob:")) {
            toast({
                title: "Aguarde o upload",
                description: "A foto ainda está sendo enviada.",
                variant: "destructive",
            });
            return;
        }

        const datas = [
            { label: "Data consulta", value: form.data_consulta },
            { label: "Início", value: form.inicio },
            { label: "Validade", value: form.validade },
        ];
        for (const { label, value } of datas) {
            if (value && !isDataISOValida(value)) {
                toast({
                    title: `${label} inválida`,
                    description: "Escolha uma data no calendário.",
                    variant: "destructive",
                });
                return;
            }
        }

        const frequenciaFinal =
            form.frequencia === "Outro"
                ? form.frequenciaOutro.trim()
                : form.frequencia.trim();

        const hojeISO = new Date().toISOString().slice(0, 10);
        const nova: Omit<ReceitaMedica, "id"> = {
            medicamento: form.medicamento.trim(),
            dosagem: form.dosagem.trim(),
            frequencia: frequenciaFinal,
            inicio: form.inicio || hojeISO,
            validade: form.validade || hojeISO,
            medico: form.medico.trim(),
            especialidade: form.especialidade.trim(),
            data_consulta: form.data_consulta ? dataISOParaBR(form.data_consulta) : dataISOParaBR(hojeISO),
            foto_url: isMiFotoUrl(form.foto_url) ? form.foto_url : undefined,
            observacoes: form.observacoes.trim(),
        };

        setSalvando(true);
        try {
            setReceitas(await receitasService.addReceita(nova));
            if (form.data_consulta) {
                setConsultas(
                    await receitasService.addConsulta({
                        data: dataISOParaBR(form.data_consulta),
                        medico: form.medico,
                        local: "—",
                        tipo: "—",
                    })
                );
            }
            fecharNova();
            toast({ title: "Receita salva" });
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

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        setFotoPreview(URL.createObjectURL(file));
        setEnviandoFoto(true);

        const url = await uploadImagem({
            file,
            folder: MI_RECEITAS_FOLDER,
            bucket: MI_STORAGE_BUCKET,
        });

        setEnviandoFoto(false);

        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto da receita.",
                variant: "destructive",
            });
            setFotoPreview(null);
            return;
        }

        setFotoPreview(null);
        setForm((prev) => ({ ...prev, foto_url: url }));
    }

    async function handleUploadEdit(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";

        if (fotoPreviewEdit) URL.revokeObjectURL(fotoPreviewEdit);
        setFotoPreviewEdit(URL.createObjectURL(file));
        setEnviandoFotoEdit(true);

        const url = await uploadImagem({
            file,
            folder: MI_RECEITAS_FOLDER,
            bucket: MI_STORAGE_BUCKET,
        });

        setEnviandoFotoEdit(false);

        if (!url) {
            toast({
                title: "Erro no upload",
                description: "Não foi possível enviar a foto da receita.",
                variant: "destructive",
            });
            setFotoPreviewEdit(null);
            return;
        }

        setFotoPreviewEdit(null);
        setFormEdit((prev) => ({ ...prev, foto_url: url }));
    }

    async function salvarEdicao(e: React.FormEvent) {
        e.preventDefault();
        if (!detalhe || salvandoEdit || enviandoFotoEdit) return;
        if (!formEdit.medicamento.trim() || !formEdit.medico.trim()) return;

        const datas = [
            { label: "Data consulta", value: formEdit.data_consulta },
            { label: "Início", value: formEdit.inicio },
            { label: "Validade", value: formEdit.validade },
        ];
        for (const { label, value } of datas) {
            if (value && !isDataISOValida(value)) {
                toast({
                    title: `${label} inválida`,
                    description: "Escolha uma data no calendário.",
                    variant: "destructive",
                });
                return;
            }
        }

        const frequenciaFinal =
            formEdit.frequencia === "Outro"
                ? formEdit.frequenciaOutro.trim()
                : formEdit.frequencia.trim();

        setSalvandoEdit(true);
        try {
            setReceitas(
                await receitasService.updateReceita(detalhe.id, {
                    medicamento: formEdit.medicamento.trim(),
                    dosagem: formEdit.dosagem.trim(),
                    frequencia: frequenciaFinal,
                    inicio: formEdit.inicio,
                    validade: formEdit.validade,
                    medico: formEdit.medico.trim(),
                    especialidade: formEdit.especialidade.trim(),
                    data_consulta: formEdit.data_consulta
                        ? dataISOParaBR(formEdit.data_consulta)
                        : detalhe.data_consulta,
                    foto_url: isMiFotoUrl(formEdit.foto_url) ? formEdit.foto_url : undefined,
                    observacoes: formEdit.observacoes.trim(),
                })
            );
            fecharEditar();
            toast({ title: "Receita atualizada" });
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvandoEdit(false);
        }
    }

    async function alternarAtiva() {
        if (!detalhe) return;
        const ativaAtual = detalhe.ativa !== false;
        const novaAtiva = !ativaAtual;
        try {
            setReceitas(await receitasService.setAtiva(detalhe.id, novaAtiva));
            fecharEditar();
            toast({ title: novaAtiva ? "Receita reativada" : "Receita inativada" });
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    function abrirNovaConsulta() {
        setConsultaEditId(null);
        setFormConsulta(FORM_CONSULTA_INICIAL);
        setModalConsulta(true);
    }

    function abrirEditarConsulta(c: ConsultaMedica) {
        setConsultaEditId(c.id);
        setFormConsulta({
            data: isoFromData(c.data),
            medico: c.medico,
            local: c.local && c.local !== "—" ? c.local : "",
            tipo: c.tipo && c.tipo !== "—" ? c.tipo : "Presencial",
        });
        setModalConsulta(true);
    }

    function fecharConsulta() {
        setConsultaEditId(null);
        setFormConsulta(FORM_CONSULTA_INICIAL);
        setModalConsulta(false);
    }

    async function salvarConsulta(e: React.FormEvent) {
        e.preventDefault();
        if (!formConsulta.medico.trim() || !formConsulta.data.trim() || salvandoConsulta) return;
        if (!isDataISOValida(formConsulta.data)) {
            toast({
                title: "Data inválida",
                description: "Escolha uma data no calendário.",
                variant: "destructive",
            });
            return;
        }

        const payload = {
            data: dataISOParaBR(formConsulta.data),
            medico: formConsulta.medico.trim(),
            local: formConsulta.local.trim() || "—",
            tipo: formConsulta.tipo,
        };

        setSalvandoConsulta(true);
        try {
            if (consultaEditId) {
                setConsultas(await receitasService.updateConsulta(consultaEditId, payload));
                toast({ title: "Consulta atualizada" });
            } else {
                setConsultas(await receitasService.addConsulta(payload));
                toast({ title: "Consulta registrada" });
            }
            fecharConsulta();
        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvandoConsulta(false);
        }
    }

    async function desmarcarConsulta() {
        if (!consultaEditId) return;
        setSalvandoConsulta(true);
        try {
            setConsultas(await receitasService.deleteConsulta(consultaEditId));
            fecharConsulta();
            toast({ title: "Consulta desmarcada" });
        } catch (err) {
            toast({
                title: "Erro ao desmarcar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvandoConsulta(false);
        }
    }

    return (
        <div className="space-y-5 sm:space-y-6 pb-36 sm:pb-28">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <MiPageHeader
                    eyebrow="Receitas"
                    title="Receitas e Consultas"
                    subtitle="Histórico de prescrições e consultas realizadas."
                />
                <Button
                    onClick={() => setModalNova(true)}
                    className="hidden sm:flex bg-[#5ba58c] hover:bg-[#4a8a75] text-white rounded-xl shrink-0"
                >
                    <Plus className="mr-2 h-4 w-4" /> Nova receita
                </Button>
            </div>

            <section className="space-y-3">
                <h2 className="text-base sm:text-lg font-bold text-[#255f4f] flex items-center gap-2">
                    <Pill className="h-5 w-5 text-[#5ba58c]" />
                    Receitas ativas
                </h2>
                <div className="grid grid-cols-1 gap-3">
                    {receitasAtivas.length === 0 && (
                        <MiCard variant="soft" className="p-6 text-center text-[#6b8c7d]">
                            Nenhuma receita ativa.
                        </MiCard>
                    )}
                    {receitasAtivas.map((r) => (
                        <ReceitaCard key={r.id} receita={r} onClick={() => abrirEditar(r)} onFoto={setModalImagem} />
                    ))}
                </div>
            </section>

            {receitasInativas.length > 0 && (
                <section className="space-y-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#6b8c7d] flex items-center gap-2">
                        <Pill className="h-5 w-5 text-[#9db4aa]" />
                        Receitas inativas
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                        {receitasInativas.map((r) => (
                            <ReceitaCard
                                key={r.id}
                                receita={r}
                                inativa
                                onClick={() => abrirEditar(r)}
                                onFoto={setModalImagem}
                            />
                        ))}
                    </div>
                </section>
            )}

            <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f] flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-[#5ba58c]" />
                        Histórico de consultas
                    </h2>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={abrirNovaConsulta}
                        className="rounded-xl border-[#5ba58c] text-[#5ba58c] hover:bg-[#f4fbf8] shrink-0 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova consulta
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {consultas.length === 0 && (
                        <MiCard variant="soft" className="p-6 text-center text-[#6b8c7d] sm:col-span-2">
                            Nenhuma consulta registrada.
                        </MiCard>
                    )}
                    {consultas.map((c) => (
                        <MiCard
                            key={c.id}
                            variant="soft"
                            className="p-4 cursor-pointer hover:border-[#5ba58c]/40"
                            onClick={() => abrirEditarConsulta(c)}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <p className="font-bold text-[#255f4f] text-sm truncate">{c.medico}</p>
                                    <p className="text-xs text-[#6b8c7d] truncate">
                                        {c.local} • {c.tipo}
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-[#5ba58c] shrink-0">{c.data}</span>
                            </div>
                        </MiCard>
                    ))}
                </div>
            </section>

            <div className="fixed left-4 right-4 bottom-24 sm:hidden z-40 flex flex-col gap-2">
                <Button
                    onClick={abrirNovaConsulta}
                    variant="outline"
                    className="w-full py-4 rounded-2xl border-2 border-[#5ba58c] text-[#5ba58c] font-bold bg-white"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nova consulta
                </Button>
                <Button
                    onClick={() => setModalNova(true)}
                    className="w-full py-5 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-xl"
                >
                    <Plus className="mr-2 h-5 w-5" /> Nova receita
                </Button>
            </div>

            <MiDemoModal
                open={modalNova}
                onOpenChange={(o) => !o && fecharNova()}
                title="Nova receita"
                description="Preencha os dados da receita médica."
            >
                <form onSubmit={salvar} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Medicamento *">
                            <Input
                                value={form.medicamento}
                                onChange={(e) => setForm({ ...form, medicamento: e.target.value })}
                                placeholder="Losartana"
                                className="rounded-xl h-11"
                                required
                            />
                        </Field>
                        <Field label="Dosagem">
                            <Input
                                value={form.dosagem}
                                onChange={(e) =>
                                    setForm({ ...form, dosagem: maskDosagem(e.target.value) })
                                }
                                placeholder="50 mg"
                                className="rounded-xl h-11"
                                inputMode="decimal"
                            />
                        </Field>
                    </div>
                    <Field label="Frequência">
                        <select
                            value={form.frequencia}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    frequencia: e.target.value,
                                    frequenciaOutro:
                                        e.target.value === "Outro" ? form.frequenciaOutro : "",
                                })
                            }
                            className="w-full h-11 rounded-xl border border-input px-3 text-sm mb-2"
                        >
                            <option value="">Selecione</option>
                            {FREQUENCIA_OPCOES.map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                        {form.frequencia === "Outro" && (
                            <Input
                                value={form.frequenciaOutro}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        frequenciaOutro: maskFrequencia(e.target.value),
                                    })
                                }
                                placeholder="Ex: 8/8h, 1x ao dia"
                                className="rounded-xl h-11"
                            />
                        )}
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Médico *">
                            <Input
                                value={form.medico}
                                onChange={(e) => setForm({ ...form, medico: e.target.value })}
                                className="rounded-xl h-11"
                                required
                            />
                        </Field>
                        <Field label="Especialidade">
                            <Input
                                value={form.especialidade}
                                onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                                className="rounded-xl h-11"
                            />
                        </Field>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <Field label="Data consulta">
                            <MiDatePicker
                                value={form.data_consulta}
                                onChange={(iso) => setForm({ ...form, data_consulta: iso })}
                            />
                        </Field>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Início">
                                <MiDatePicker
                                    value={form.inicio}
                                    onChange={(iso) => setForm({ ...form, inicio: iso })}
                                />
                            </Field>
                            <Field label="Validade">
                                <MiDatePicker
                                    value={form.validade}
                                    onChange={(iso) => setForm({ ...form, validade: iso })}
                                    min={form.inicio || undefined}
                                />
                            </Field>
                        </div>
                    </div>
                    <label className="flex flex-col items-center p-6 border-2 border-dashed border-[#c2e1d4] rounded-2xl cursor-pointer hover:bg-[#f8fcfb]">
                        {enviandoFoto ? (
                            <Loader2 className="h-6 w-6 text-[#5ba58c] mb-2 animate-spin" />
                        ) : (
                            <Camera className="h-6 w-6 text-[#5ba58c] mb-2" />
                        )}
                        <span className="text-sm text-[#6b8c7d]">
                            {enviandoFoto ? "Enviando foto..." : "Foto da receita"}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                            disabled={enviandoFoto}
                        />
                        {(fotoPreview || isMiFotoUrl(form.foto_url)) && (
                            <img
                                src={fotoPreview || form.foto_url}
                                alt="Preview da receita"
                                className="mt-3 w-24 h-24 object-cover rounded-lg"
                            />
                        )}
                    </label>
                    <Field label="Observações">
                        <Textarea
                            value={form.observacoes}
                            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                            placeholder="Ex: tomar após café, guardar na geladeira..."
                            className="rounded-xl min-h-[80px] resize-none"
                        />
                    </Field>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={fecharNova}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={salvando || enviandoFoto}
                            className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                        >
                            {salvando ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                    Salvando...
                                </>
                            ) : (
                                "Salvar"
                            )}
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={modalConsulta}
                onOpenChange={(o) => !o && fecharConsulta()}
                title={consultaEditId ? "Editar consulta" : "Nova consulta"}
                description={
                    consultaEditId
                        ? "Altere os dados ou desmarque a consulta."
                        : "Registre uma consulta médica realizada ou agendada."
                }
            >
                <form onSubmit={salvarConsulta} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Data *">
                            <MiDatePicker
                                value={formConsulta.data}
                                onChange={(iso) =>
                                    setFormConsulta({ ...formConsulta, data: iso })
                                }
                            />
                        </Field>
                        <Field label="Tipo">
                            <select
                                value={formConsulta.tipo}
                                onChange={(e) => setFormConsulta({ ...formConsulta, tipo: e.target.value })}
                                className="w-full h-11 rounded-xl border border-input px-3 text-sm"
                            >
                                <option value="Presencial">Presencial</option>
                                <option value="Online">Online</option>
                                <option value="Teleconsulta">Teleconsulta</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Médico *">
                        <Input
                            value={formConsulta.medico}
                            onChange={(e) => setFormConsulta({ ...formConsulta, medico: e.target.value })}
                            placeholder="Dr. João Silva"
                            className="rounded-xl h-11"
                            required
                        />
                    </Field>
                    <Field label="Local">
                        <Input
                            value={formConsulta.local}
                            onChange={(e) => setFormConsulta({ ...formConsulta, local: e.target.value })}
                            placeholder="Clínica, hospital ou link"
                            className="rounded-xl h-11"
                        />
                    </Field>
                    <div className="flex flex-col gap-2 pt-1">
                        <div className="flex flex-col-reverse sm:flex-row gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-xl h-12"
                                onClick={fecharConsulta}
                                disabled={salvandoConsulta}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvandoConsulta}
                                className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white"
                            >
                                {salvandoConsulta ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                        Salvando...
                                    </>
                                ) : consultaEditId ? (
                                    "Salvar alterações"
                                ) : (
                                    "Salvar"
                                )}
                            </Button>
                        </div>
                        {consultaEditId && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={salvandoConsulta}
                                className="w-full rounded-xl h-12 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={desmarcarConsulta}
                            >
                                Desmarcar consulta
                            </Button>
                        )}
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={!!detalhe}
                onOpenChange={(o) => !o && fecharEditar()}
                title={detalhe?.medicamento || "Receita"}
                description="Edite dados, foto ou observações."
            >
                {detalhe && (
                    <form onSubmit={salvarEdicao} className="space-y-3">
                        <label className="flex flex-col items-center p-5 border-2 border-dashed border-[#c2e1d4] rounded-2xl cursor-pointer hover:bg-[#f8fcfb]">
                            {enviandoFotoEdit ? (
                                <Loader2 className="h-6 w-6 text-[#5ba58c] mb-2 animate-spin" />
                            ) : (
                                <Camera className="h-6 w-6 text-[#5ba58c] mb-2" />
                            )}
                            <span className="text-sm text-[#6b8c7d]">
                                {enviandoFotoEdit ? "Enviando..." : "Trocar foto da receita"}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUploadEdit}
                                disabled={enviandoFotoEdit}
                            />
                            {(fotoPreviewEdit || isMiFotoUrl(formEdit.foto_url)) && (
                                <img
                                    src={fotoPreviewEdit || formEdit.foto_url}
                                    alt="Receita"
                                    className="mt-3 w-full max-h-40 object-contain rounded-lg"
                                />
                            )}
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Medicamento *">
                                <Input
                                    value={formEdit.medicamento}
                                    onChange={(e) =>
                                        setFormEdit({ ...formEdit, medicamento: e.target.value })
                                    }
                                    className="rounded-xl h-11"
                                    required
                                />
                            </Field>
                            <Field label="Dosagem">
                                <Input
                                    value={formEdit.dosagem}
                                    onChange={(e) =>
                                        setFormEdit({
                                            ...formEdit,
                                            dosagem: maskDosagem(e.target.value),
                                        })
                                    }
                                    className="rounded-xl h-11"
                                />
                            </Field>
                        </div>

                        <Field label="Frequência">
                            <Input
                                value={
                                    formEdit.frequencia === "Outro"
                                        ? formEdit.frequenciaOutro
                                        : formEdit.frequencia
                                }
                                onChange={(e) =>
                                    setFormEdit({
                                        ...formEdit,
                                        frequencia: "Outro",
                                        frequenciaOutro: maskFrequencia(e.target.value),
                                    })
                                }
                                className="rounded-xl h-11"
                            />
                        </Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Médico *">
                                <Input
                                    value={formEdit.medico}
                                    onChange={(e) =>
                                        setFormEdit({ ...formEdit, medico: e.target.value })
                                    }
                                    className="rounded-xl h-11"
                                    required
                                />
                            </Field>
                            <Field label="Especialidade">
                                <Input
                                    value={formEdit.especialidade}
                                    onChange={(e) =>
                                        setFormEdit({ ...formEdit, especialidade: e.target.value })
                                    }
                                    className="rounded-xl h-11"
                                />
                            </Field>
                        </div>

                        <Field label="Validade">
                            <MiDatePicker
                                value={formEdit.validade}
                                onChange={(iso) => setFormEdit({ ...formEdit, validade: iso })}
                                min={formEdit.inicio || undefined}
                            />
                        </Field>

                        <Field label="Observações">
                            <Textarea
                                value={formEdit.observacoes}
                                onChange={(e) =>
                                    setFormEdit({ ...formEdit, observacoes: e.target.value })
                                }
                                placeholder="Ex: tomar após café, efeitos colaterais..."
                                className="rounded-xl min-h-[88px] resize-none"
                            />
                        </Field>

                        <div className="flex flex-col gap-2 pt-1">
                            <Button
                                type="submit"
                                disabled={salvandoEdit || enviandoFotoEdit}
                                className="w-full rounded-xl h-12 bg-[#5ba58c] text-white"
                            >
                                {salvandoEdit ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                                        Salvando...
                                    </>
                                ) : (
                                    "Salvar alterações"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-xl h-12 border-[#5ba58c] text-[#255f4f]"
                                onClick={() => {
                                    if (isMiFotoUrl(formEdit.foto_url))
                                        setModalImagem(formEdit.foto_url);
                                }}
                                disabled={!isMiFotoUrl(formEdit.foto_url)}
                            >
                                <FileText className="mr-2 h-4 w-4 inline" />
                                Ver foto em tela cheia
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-xl h-12 text-red-600 border-red-200 hover:bg-red-50"
                                onClick={alternarAtiva}
                            >
                                {detalhe.ativa !== false ? "Inativar receita" : "Reativar receita"}
                            </Button>
                        </div>
                    </form>
                )}
            </MiDemoModal>

            {modalImagem && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
                    onClick={() => setModalImagem(null)}
                >
                    <img
                        src={modalImagem}
                        alt="Receita"
                        className="max-w-full max-h-[85vh] rounded-xl object-contain"
                    />
                </div>
            )}
        </div>
    );
}

function ReceitaCard({
    receita: r,
    inativa,
    onClick,
    onFoto,
}: {
    receita: ReceitaMedica;
    inativa?: boolean;
    onClick: () => void;
    onFoto: (url: string) => void;
}) {
    return (
        <MiCard onClick={onClick} className={`overflow-hidden p-0 ${inativa ? "opacity-75" : ""}`}>
            <div className="flex flex-col sm:flex-row">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isMiFotoUrl(r.foto_url)) onFoto(r.foto_url!);
                    }}
                    className="w-full sm:w-36 h-36 sm:h-auto sm:min-h-[140px] bg-[#f4fbf8] relative shrink-0 flex items-center justify-center"
                >
                    {isMiFotoUrl(r.foto_url) ? (
                        <img
                            src={r.foto_url}
                            alt={r.medicamento}
                            className="w-full h-full object-cover absolute inset-0"
                        />
                    ) : (
                        <Pill className="h-10 w-10 text-[#9db4aa]" />
                    )}
                    {isMiFotoUrl(r.foto_url) && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    )}
                </button>
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                                <h3 className="text-lg font-bold text-[#255f4f]">{r.medicamento}</h3>
                                <p className="text-sm text-[#5ba58c] font-semibold">
                                    {r.dosagem} • {r.frequencia}
                                </p>
                            </div>
                            <span
                                className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                    inativa
                                        ? "bg-gray-100 text-[#9db4aa]"
                                        : "bg-emerald-50 text-[#5ba58c]"
                                }`}
                            >
                                {inativa ? "Inativa" : "Ativa"}
                            </span>
                        </div>
                        <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#6b8c7d]">
                            <p className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-[#9db4aa] shrink-0" />
                                {r.medico}
                                {r.especialidade ? ` (${r.especialidade})` : ""}
                            </p>
                            <p className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-[#9db4aa] shrink-0" />
                                Consulta: {r.data_consulta}
                            </p>
                            {r.observacoes && (
                                <p className="text-[#9db4aa] line-clamp-2">{r.observacoes}</p>
                            )}
                        </div>
                    </div>
                    <p className="text-[11px] text-[#9db4aa]">
                        Início: {fmtDataBR(r.inicio)} • Validade: {fmtDataBR(r.validade)}
                    </p>
                </div>
            </div>
        </MiCard>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#6b8c7d]">{label}</span>
            {children}
        </label>
    );
}
