import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Pill,
    CalendarCheck,
    Plus,
    X,
    Camera,
    Stethoscope,
    Calendar,
    FileText
} from "lucide-react";
import clsx from "clsx";

type Receita = {
    id: number;
    medicamento: string;
    dosagem: string;
    frequencia: string;
    inicio: string;
    validade: string;
    medico: string;
    especialidade: string;
    data_consulta: string; // "DD/MM/YYYY" for protótipo
    foto_url?: string;
};

type Consulta = {
    id: number;
    data: string; // ISO or "DD/MM/YYYY"
    medico: string;
    local?: string;
    tipo?: string;
};

export default function ReceitasPage() {
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);

    // dados estáticos iniciais
    const [receitas, setReceitas] = useState<Receita[]>([
        {
            id: 1,
            medicamento: "Losartana",
            dosagem: "50mg",
            frequencia: "1x ao dia (Manhã)",
            inicio: "2025-01-10",
            validade: "2025-04-10",
            medico: "Dra. Fernanda Souza",
            especialidade: "Cardiologista",
            data_consulta: "09/01/2025",
            foto_url:
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop"
        },
        {
            id: 2,
            medicamento: "Metformina",
            dosagem: "850mg",
            frequencia: "2x ao dia (Almoço e Jantar)",
            inicio: "2024-12-01",
            validade: "2025-03-01",
            medico: "Dr. Carlos Almeida",
            especialidade: "Endocrinologista",
            data_consulta: "30/11/2024",
            foto_url:
                "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop"
        }
    ]);

    // histórico de consultas (pode ser separado das receitas)
    const [consultasHistorico, setConsultasHistorico] = useState<Consulta[]>([
        { id: 1, data: "09/01/2025", medico: "Dra. Fernanda Souza", local: "Clínica São Lucas", tipo: "Presencial" },
        { id: 2, data: "30/11/2024", medico: "Dr. Carlos Almeida", local: "Teleconsulta", tipo: "Online" },
        { id: 3, data: "15/10/2024", medico: "Dr. Ricardo Lima", local: "Clínica Centro", tipo: "Presencial" }
    ]);

    // form do modal (somente front-end, protótipo)
    const [form, setForm] = useState({
        medicamento: "",
        dosagem: "",
        frequencia: "",
        inicio: "",
        validade: "",
        medico: "",
        especialidade: "",
        data_consulta: "",
        foto_url: ""
    });

    // -- helpers
    const fmt = (d: string) => {
        try {
            // aceita YYYY-MM-DD ou DD/MM/YYYY
            if (!d) return "";
            if (d.includes("/")) return d;
            const dt = new Date(d);
            return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dt);
        } catch {
            return d;
        }
    };

    // ESC to close modals
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") {
                if (modalImage) setModalImage(null);
                if (showNewModal) closeNewModal();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [modalImage, showNewModal]);

    // cleanup for created object URLs when user selects a file preview
    useEffect(() => {
        return () => {
            if (form.foto_url && form.foto_url.startsWith("blob:")) {
                URL.revokeObjectURL(form.foto_url);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function openImage(url?: string) {
        if (!url) return;
        setModalImage(url);
    }

    function closeImage() {
        setModalImage(null);
    }

    function openNewModal() {
        setShowNewModal(true);
    }

    function closeNewModal() {
        setShowNewModal(false);
        // revoke blob url if used
        if (form.foto_url && form.foto_url.startsWith("blob:")) {
            URL.revokeObjectURL(form.foto_url);
        }
        setForm({
            medicamento: "",
            dosagem: "",
            frequencia: "",
            inicio: "",
            validade: "",
            medico: "",
            especialidade: "",
            data_consulta: "",
            foto_url: ""
        });
    }

    // "Salvar" apenas in-memory
    function handleSaveNew(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!form.medicamento.trim() || !form.medico.trim()) {
            // validação simples
            return alert("Preencha ao menos Medicamento e Médico.");
        }

        const novoId = Date.now();
        const novaReceita: Receita = {
            id: novoId,
            medicamento: form.medicamento.trim(),
            dosagem: form.dosagem.trim(),
            frequencia: form.frequencia.trim(),
            inicio: form.inicio || new Date().toISOString().slice(0, 10),
            validade: form.validade || new Date().toISOString().slice(0, 10),
            medico: form.medico.trim(),
            especialidade: form.especialidade.trim(),
            data_consulta: form.data_consulta || new Date().toLocaleDateString("pt-BR"),
            foto_url: form.foto_url || "https://via.placeholder.com/800x600.png?text=Receita"
        };

        setReceitas((prev) => [novaReceita, ...prev]);
        // opcional: adicionar ao histórico de consultas se tiver data
        if (form.data_consulta) {
            setConsultasHistorico((prev) => [
                { id: novoId + 1, data: form.data_consulta, medico: form.medico, local: "—", tipo: "—" },
                ...prev
            ]);
        }
        closeNewModal();
    }

    // preview fake de arquivo (só para o protótipo)
    function handleFakeUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        // revoga anterior se blob
        if (form.foto_url && form.foto_url.startsWith("blob:")) URL.revokeObjectURL(form.foto_url);
        const url = URL.createObjectURL(file);
        setForm((prev) => ({ ...prev, foto_url: url }));
    }

    const isSaveDisabled = !form.medicamento.trim() || !form.medico.trim();

    return (
        <div className="space-y-8 pb-32 px-4 max-w-5xl mx-auto">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-[#255f4f]">Receitas e Consultas</h1>
                    <p className="text-[#6b8c7d]">Histórico de prescrições e consultas realizadas</p>
                </div>
                <Button onClick={openNewModal} className="bg-[#5ba58c] hover:bg-[#4a8a75] text-white rounded-xl hidden md:flex">
                    <Plus className="mr-2 h-4 w-4" /> Nova Receita
                </Button>
            </header>

            {/* Receitas Ativas */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#255f4f] flex items-center gap-2">
                    <Pill className="h-6 w-6 text-[#5ba58c]" /> Receitas Médicas Ativas
                </h2>

                <div className="grid gap-4">
                    {receitas.map((r) => (
                        <Card key={r.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                            <CardContent className="p-0 flex flex-col sm:flex-row">
                                <div
                                    className="w-full sm:w-40 h-40 bg-gray-100 cursor-pointer relative group"
                                    onClick={() => openImage(r.foto_url)}
                                    role="button"
                                    aria-label={`Visualizar foto da receita de ${r.medicamento}`}
                                >
                                    <img src={r.foto_url} className="w-full h-full object-cover" alt={`Receita ${r.medicamento}`} />
                                    <div className="absolute inset-0 bg-black/12 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                        <Camera className="text-white h-6 w-6 opacity-80" />
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#255f4f]">{r.medicamento}</h3>
                                                <p className="text-sm text-[#5ba58c] font-bold">{r.dosagem} • {r.frequencia}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] bg-emerald-50 text-[#5ba58c] px-2 py-1 rounded-full font-bold uppercase">
                                                    Ativa
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center gap-2 text-sm text-[#6b8c7d]">
                                                <Stethoscope className="h-4 w-4 text-[#9db4aa]" />
                                                <span><strong>Médico:</strong> {r.medico} ({r.especialidade})</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-[#6b8c7d]">
                                                <Calendar className="h-4 w-4 text-[#9db4aa]" />
                                                <span><strong>Consulta:</strong> {r.data_consulta ? r.data_consulta : fmt(r.data_consulta)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <div className="text-[11px] text-[#9db4aa]">
                                            Início: {fmt(r.inicio)} • Validade: {fmt(r.validade)}
                                        </div>
                                        <button
                                            onClick={() => openImage(r.foto_url)}
                                            className="text-[#5ba58c] text-xs font-bold flex items-center gap-1 hover:underline"
                                            aria-label={`Ver receita completa de ${r.medicamento}`}
                                        >
                                            <FileText className="h-3 w-3" /> Ver Receita Completa
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Histórico de Consultas */}
            <section>
                <h2 className="text-xl font-bold text-[#255f4f] mb-4 flex items-center gap-2">
                    <CalendarCheck className="h-6 w-6 text-[#5ba58c]" /> Histórico de Consultas
                </h2>

                <div className="grid gap-3">
                    {consultasHistorico.map((c) => (
                        <Card key={c.id} className="rounded-2xl shadow-sm border-[#e9f3ee]">
                            <CardContent className="p-4 flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-bold text-[#255f4f]">{c.medico}</p>
                                    <p className="text-xs text-[#6b8c7d]">{c.local} • {c.tipo}</p>
                                </div>
                                <div className="text-sm text-[#5ba58c] font-bold text-right">{c.data}</div>
                            </CardContent>
                        </Card>
                    ))}

                    {consultasHistorico.length === 0 && (
                        <div className="text-sm text-[#9db4aa]">Nenhuma consulta registrada ainda.</div>
                    )}
                </div>
            </section>

            {/* Floating add button (mobile) */}
            <div className="fixed bottom-[calc(var(--mi-bottom-nav-height,88px)+16px)] left-4 right-4 md:hidden z-40">
                <Button onClick={openNewModal} className="w-full py-6 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-xl">
                    <Plus className="mr-2 h-6 w-6" /> Adicionar Receita
                </Button>
            </div>

            {/* Modal de Visualização de Imagem */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                    onClick={closeImage}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Visualizar imagem da receita"
                >
                    <div className="relative max-w-4xl w-full h-full flex items-center justify-center">
                        <img src={modalImage} className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" alt="Receita Ampliada" />
                        <button onClick={closeImage} className="absolute top-0 right-0 m-4 text-white p-2 bg-white/10 hover:bg-white/20 rounded-full transition" aria-label="Fechar">
                            <X className="h-8 w-8" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Nova Receita (protótipo, sem persistência) */}
            {showNewModal && (
                <div className="fixed inset-0 z-[1500] flex items-end md:items-center justify-center p-0 md:p-4">
                    <div className="absolute inset-0 bg-black/60" onClick={closeNewModal} />
                    <div
                        className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-auto p-6"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Formulário nova receita"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#255f4f]">Nova Receita</h3>
                            <button onClick={closeNewModal} className="p-2 bg-gray-100 rounded-full" aria-label="Fechar modal">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveNew} className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Medicamento <span className="text-rose-500">*</span></span>
                                    <input
                                        value={form.medicamento}
                                        onChange={(e) => setForm({ ...form, medicamento: e.target.value })}
                                        className="p-3 border rounded-lg"
                                        placeholder="Ex: Losartana"
                                        aria-required
                                    />
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Dosagem</span>
                                    <input value={form.dosagem} onChange={(e) => setForm({ ...form, dosagem: e.target.value })} className="p-3 border rounded-lg" placeholder="Ex: 50mg" />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Frequência</span>
                                    <input value={form.frequencia} onChange={(e) => setForm({ ...form, frequencia: e.target.value })} className="p-3 border rounded-lg" placeholder="Ex: 1x ao dia" />
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Médico <span className="text-rose-500">*</span></span>
                                    <input value={form.medico} onChange={(e) => setForm({ ...form, medico: e.target.value })} className="p-3 border rounded-lg" placeholder="Nome do médico" aria-required />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Especialidade</span>
                                    <input value={form.especialidade} onChange={(e) => setForm({ ...form, especialidade: e.target.value })} className="p-3 border rounded-lg" placeholder="Ex: Cardiologia" />
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Data da Consulta</span>
                                    <input value={form.data_consulta} onChange={(e) => setForm({ ...form, data_consulta: e.target.value })} className="p-3 border rounded-lg" placeholder="DD/MM/YYYY" />
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Início</span>
                                    <input value={form.inicio} onChange={(e) => setForm({ ...form, inicio: e.target.value })} className="p-3 border rounded-lg" type="date" />
                                </label>

                                <label className="flex flex-col">
                                    <span className="text-xs text-[#6b8c7d] mb-1">Validade</span>
                                    <input value={form.validade} onChange={(e) => setForm({ ...form, validade: e.target.value })} className="p-3 border rounded-lg" type="date" />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-[#6b8c7d]">Foto da Receita (apenas preview)</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#d1e5dc] rounded-2xl cursor-pointer hover:bg-gray-50 transition text-sm">
                                        <Camera className="h-5 w-5 text-[#5ba58c]" />
                                        <span className="mt-2 text-[#9db4aa]">Escolher imagem (apenas preview)</span>
                                        <input aria-label="Escolher foto da receita" type="file" accept="image/*" className="hidden" onChange={handleFakeUpload} />
                                    </label>
                                    {form.foto_url ? <img src={form.foto_url} className="w-20 h-20 object-cover rounded-lg border" alt="Preview da receita" /> : null}
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <Button type="button" onClick={closeNewModal} className="flex-1 bg-white border border-gray-200 text-[#255f4f]">Cancelar</Button>
                                <Button type="submit" className={clsx("flex-1", isSaveDisabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-[#5ba58c] text-white")} disabled={isSaveDisabled}>
                                    Salvar Receita
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}