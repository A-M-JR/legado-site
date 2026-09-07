import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Pill, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { fmtData } from "@/modules/medicina-preventiva/lib/datas";
import type { ReceitaMp } from "@/modules/medicina-preventiva/types";
import { getParceiroScope, listPacientes, type PacienteResumo } from "../services/parceiroScope";
import { receitasParceiroService } from "../services/receitasParceiroService";

export default function ReceitasParceiroPage() {
    const [pacientes, setPacientes] = useState<PacienteResumo[]>([]);
    const [busca, setBusca] = useState("");
    const [selecionado, setSelecionado] = useState<PacienteResumo | null>(null);
    const [receitas, setReceitas] = useState<ReceitaMp[]>([]);
    const [carregandoPacientes, setCarregandoPacientes] = useState(true);
    const [carregandoReceitas, setCarregandoReceitas] = useState(false);
    const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const scope = await getParceiroScope();
            if (!scope?.parceiroId) {
                setCarregandoPacientes(false);
                return;
            }
            setPacientes(await listPacientes(scope.parceiroId));
            setCarregandoPacientes(false);
        })();
    }, []);

    useEffect(() => {
        if (!selecionado) {
            setReceitas([]);
            return;
        }
        setCarregandoReceitas(true);
        receitasParceiroService.list(selecionado.titularId).then((lista) => {
            setReceitas(lista);
            setCarregandoReceitas(false);
        });
    }, [selecionado]);

    const termo = busca.trim().toLowerCase();
    const filtrados = useMemo(
        () =>
            termo
                ? pacientes.filter((p) => p.nome.toLowerCase().includes(termo))
                : pacientes,
        [pacientes, termo]
    );

    const ativas = receitas.filter((r) => r.ativa);
    const inativas = receitas.filter((r) => !r.ativa);

    function renderReceita(r: ReceitaMp) {
        return (
            <Card key={r.id}>
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        {r.fotoUrl ? (
                            <button type="button" onClick={() => setFotoAmpliada(r.fotoUrl!)} className="shrink-0">
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
                            <p className={r.ativa ? "font-bold text-[#255f4f]" : "font-bold text-[#9db4aa]"}>
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
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#255f4f]">Receitas dos pacientes</h1>
                <p className="text-sm text-[#6b8c7d]">
                    As receitas que o paciente cadastrou no app. Selecione um paciente para ver.
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <div className="space-y-3">
                    <Input
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        placeholder="Buscar paciente..."
                    />
                    {carregandoPacientes ? (
                        <div className="py-8 flex justify-center">
                            <Loader2 className="h-5 w-5 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-[60vh] overflow-auto pr-1">
                            {filtrados.map((p) => (
                                <button
                                    key={p.titularId}
                                    type="button"
                                    onClick={() => setSelecionado(p)}
                                    className={
                                        "w-full text-left px-3 py-2.5 rounded-xl border transition text-sm " +
                                        (selecionado?.titularId === p.titularId
                                            ? "bg-[#e3f1eb] border-[#c2e1d4] text-[#255f4f] font-semibold"
                                            : "bg-white border-[#e6efe9] text-[#4f665a] hover:bg-[#f4fbf8]")
                                    }
                                >
                                    {p.nome || "Paciente"}
                                </button>
                            ))}
                            {filtrados.length === 0 && (
                                <p className="text-xs text-[#9db4aa] px-1 py-4">
                                    Nenhum paciente encontrado.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    {!selecionado ? (
                        <Card>
                            <CardContent className="py-16 text-center text-sm text-[#6b8c7d]">
                                Selecione um paciente para ver as receitas.
                            </CardContent>
                        </Card>
                    ) : carregandoReceitas ? (
                        <div className="py-16 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : receitas.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center text-sm text-[#6b8c7d]">
                                {selecionado.nome} ainda não cadastrou receitas.
                            </CardContent>
                        </Card>
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
                </div>
            </div>

            <Dialog open={!!fotoAmpliada} onOpenChange={() => setFotoAmpliada(null)}>
                <DialogContent className="sm:max-w-[640px] p-2">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Foto da receita</DialogTitle>
                        <DialogDescription>Imagem ampliada</DialogDescription>
                    </DialogHeader>
                    {fotoAmpliada && (
                        <img src={fotoAmpliada} alt="Receita ampliada" className="w-full rounded-xl" />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
