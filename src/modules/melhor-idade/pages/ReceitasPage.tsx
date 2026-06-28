import { useState } from "react";
import {
    Pill,
    CalendarCheck,
    Plus,
    Camera,
    Stethoscope,
    Calendar,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { MiCard } from "../components/MiCard";
import { MiPageHeader } from "../components/MiPageHeader";
import { MiDemoModal } from "../components/MiDemoModal";
import { fmtDataBR, receitasService } from "../services/receitasService";
import type { ConsultaMedica, ReceitaMedica } from "../types";

const FORM_INICIAL = {
    medicamento: "",
    dosagem: "",
    frequencia: "",
    inicio: "",
    validade: "",
    medico: "",
    especialidade: "",
    data_consulta: "",
    foto_url: "",
};

const FORM_CONSULTA_INICIAL = {
    data: "",
    medico: "",
    local: "",
    tipo: "Presencial",
};

export default function ReceitasPage() {
    const [receitas, setReceitas] = useState<ReceitaMedica[]>(() => receitasService.listReceitas());
    const [consultas, setConsultas] = useState<ConsultaMedica[]>(() => receitasService.listConsultas());
    const [modalNova, setModalNova] = useState(false);
    const [modalConsulta, setModalConsulta] = useState(false);
    const [modalImagem, setModalImagem] = useState<string | null>(null);
    const [detalhe, setDetalhe] = useState<ReceitaMedica | null>(null);
    const [form, setForm] = useState(FORM_INICIAL);
    const [formConsulta, setFormConsulta] = useState(FORM_CONSULTA_INICIAL);

    function fecharNova() {
        if (form.foto_url?.startsWith("blob:")) URL.revokeObjectURL(form.foto_url);
        setForm(FORM_INICIAL);
        setModalNova(false);
    }

    function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.medicamento.trim() || !form.medico.trim()) return;
        const nova: Omit<ReceitaMedica, "id"> = {
            medicamento: form.medicamento.trim(),
            dosagem: form.dosagem.trim(),
            frequencia: form.frequencia.trim(),
            inicio: form.inicio || new Date().toISOString().slice(0, 10),
            validade: form.validade || new Date().toISOString().slice(0, 10),
            medico: form.medico.trim(),
            especialidade: form.especialidade.trim(),
            data_consulta: form.data_consulta || new Date().toLocaleDateString("pt-BR"),
            foto_url:
                form.foto_url ||
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
        };
        setReceitas(receitasService.addReceita(nova));
        if (form.data_consulta) {
            setConsultas(
                receitasService.addConsulta({
                    data: form.data_consulta,
                    medico: form.medico,
                    local: "—",
                    tipo: "—",
                })
            );
        }
        fecharNova();
        toast({ title: "Receita salva", description: "Demonstração — salvo localmente." });
    }

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (form.foto_url?.startsWith("blob:")) URL.revokeObjectURL(form.foto_url);
        setForm({ ...form, foto_url: URL.createObjectURL(file) });
    }

    function fecharConsulta() {
        setFormConsulta(FORM_CONSULTA_INICIAL);
        setModalConsulta(false);
    }

    function salvarConsulta(e: React.FormEvent) {
        e.preventDefault();
        if (!formConsulta.medico.trim() || !formConsulta.data.trim()) return;
        const [y, m, d] = formConsulta.data.split("-");
        const dataExibicao = d && m && y ? `${d}/${m}/${y}` : formConsulta.data.trim();
        setConsultas(
            receitasService.addConsulta({
                data: dataExibicao,
                medico: formConsulta.medico.trim(),
                local: formConsulta.local.trim() || "—",
                tipo: formConsulta.tipo,
            })
        );
        fecharConsulta();
        toast({ title: "Consulta registrada", description: "Demonstração — salvo localmente." });
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
                    {receitas.map((r) => (
                        <MiCard
                            key={r.id}
                            onClick={() => setDetalhe(r)}
                            className="overflow-hidden p-0"
                        >
                            <div className="flex flex-col sm:flex-row">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (r.foto_url) setModalImagem(r.foto_url);
                                    }}
                                    className="w-full sm:w-36 h-36 sm:h-auto sm:min-h-[140px] bg-gray-100 relative shrink-0"
                                >
                                    {r.foto_url && (
                                        <img
                                            src={r.foto_url}
                                            alt={r.medicamento}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                        <Camera className="h-6 w-6 text-white" />
                                    </div>
                                </button>
                                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                                    <div>
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-[#255f4f]">
                                                    {r.medicamento}
                                                </h3>
                                                <p className="text-sm text-[#5ba58c] font-semibold">
                                                    {r.dosagem} • {r.frequencia}
                                                </p>
                                            </div>
                                            <span className="text-[10px] bg-emerald-50 text-[#5ba58c] px-2 py-1 rounded-full font-bold uppercase">
                                                Ativa
                                            </span>
                                        </div>
                                        <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-[#6b8c7d]">
                                            <p className="flex items-center gap-2">
                                                <Stethoscope className="h-4 w-4 text-[#9db4aa] shrink-0" />
                                                {r.medico} ({r.especialidade})
                                            </p>
                                            <p className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-[#9db4aa] shrink-0" />
                                                Consulta: {r.data_consulta}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-[#9db4aa]">
                                        Início: {fmtDataBR(r.inicio)} • Validade: {fmtDataBR(r.validade)}
                                    </p>
                                </div>
                            </div>
                        </MiCard>
                    ))}
                </div>
            </section>

            <section className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f] flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-[#5ba58c]" />
                        Histórico de consultas
                    </h2>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setModalConsulta(true)}
                        className="rounded-xl border-[#5ba58c] text-[#5ba58c] hover:bg-[#f4fbf8] shrink-0 w-full sm:w-auto"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nova consulta
                    </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {consultas.map((c) => (
                        <MiCard key={c.id} variant="soft" className="p-4">
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
                    onClick={() => setModalConsulta(true)}
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
                description="Demonstração — preencha os campos principais."
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
                                onChange={(e) => setForm({ ...form, dosagem: e.target.value })}
                                placeholder="50mg"
                                className="rounded-xl h-11"
                            />
                        </Field>
                    </div>
                    <Field label="Frequência">
                        <Input
                            value={form.frequencia}
                            onChange={(e) => setForm({ ...form, frequencia: e.target.value })}
                            placeholder="1x ao dia"
                            className="rounded-xl h-11"
                        />
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Field label="Data consulta">
                            <Input
                                value={form.data_consulta}
                                onChange={(e) => setForm({ ...form, data_consulta: e.target.value })}
                                placeholder="DD/MM/AAAA"
                                className="rounded-xl h-11"
                            />
                        </Field>
                        <Field label="Início">
                            <Input
                                type="date"
                                value={form.inicio}
                                onChange={(e) => setForm({ ...form, inicio: e.target.value })}
                                className="rounded-xl h-11"
                            />
                        </Field>
                        <Field label="Validade">
                            <Input
                                type="date"
                                value={form.validade}
                                onChange={(e) => setForm({ ...form, validade: e.target.value })}
                                className="rounded-xl h-11"
                            />
                        </Field>
                    </div>
                    <label className="flex flex-col items-center p-6 border-2 border-dashed border-[#c2e1d4] rounded-2xl cursor-pointer hover:bg-[#f8fcfb]">
                        <Camera className="h-6 w-6 text-[#5ba58c] mb-2" />
                        <span className="text-sm text-[#6b8c7d]">Foto da receita (preview)</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                        {form.foto_url && (
                            <img src={form.foto_url} alt="" className="mt-3 w-20 h-20 object-cover rounded-lg" />
                        )}
                    </label>
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <Button type="button" variant="outline" className="flex-1 rounded-xl h-12" onClick={fecharNova}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white">
                            Salvar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={modalConsulta}
                onOpenChange={(o) => !o && fecharConsulta()}
                title="Nova consulta"
                description="Registre uma consulta médica realizada ou agendada."
            >
                <form onSubmit={salvarConsulta} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Data *">
                            <Input
                                type="date"
                                value={formConsulta.data}
                                onChange={(e) => setFormConsulta({ ...formConsulta, data: e.target.value })}
                                className="rounded-xl h-11"
                                required
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
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1 rounded-xl h-12"
                            onClick={fecharConsulta}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 rounded-xl h-12 bg-[#5ba58c] text-white">
                            Salvar (demo)
                        </Button>
                    </div>
                </form>
            </MiDemoModal>

            <MiDemoModal
                open={!!detalhe}
                onOpenChange={(o) => !o && setDetalhe(null)}
                title={detalhe?.medicamento || ""}
                description={detalhe ? `${detalhe.medico} — ${detalhe.especialidade}` : ""}
            >
                {detalhe && (
                    <div className="space-y-4">
                        {detalhe.foto_url && (
                            <img src={detalhe.foto_url} alt="" className="w-full rounded-2xl max-h-48 object-cover" />
                        )}
                        <dl className="space-y-2 text-sm">
                            <Row label="Dosagem" value={detalhe.dosagem} />
                            <Row label="Frequência" value={detalhe.frequencia} />
                            <Row label="Validade" value={fmtDataBR(detalhe.validade)} />
                        </dl>
                        <Button
                            className="w-full rounded-xl h-12 bg-[#5ba58c] text-white"
                            onClick={() => {
                                if (detalhe.foto_url) setModalImagem(detalhe.foto_url);
                            }}
                        >
                            <FileText className="mr-2 h-4 w-4" /> Ver receita completa
                        </Button>
                    </div>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-xs font-semibold text-[#6b8c7d]">{label}</span>
            {children}
        </label>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between gap-4 py-1 border-b border-[#f0f4f2]">
            <dt className="text-[#6b8c7d]">{label}</dt>
            <dd className="font-semibold text-[#255f4f] text-right">{value || "—"}</dd>
        </div>
    );
}
