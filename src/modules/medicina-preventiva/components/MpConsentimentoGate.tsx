import { useState } from "react";
import { HeartPulse, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { consentimentoService } from "../services/consentimentoService";
import { MP_TERMO_TEXTO, MP_TERMO_TITULO, MP_TERMO_VERSAO } from "../lib/termo";

export function MpConsentimentoGate({ onAceito }: { onAceito: () => void }) {
    const [marcado, setMarcado] = useState(false);
    const [salvando, setSalvando] = useState(false);

    async function aceitar() {
        if (!marcado || salvando) return;
        setSalvando(true);
        try {
            await consentimentoService.registrarAceite(MP_TERMO_VERSAO);
            onAceito();
        } catch (err) {
            toast({
                title: "Não foi possível registrar o aceite",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#f8fcfb] flex flex-col">
            <header className="h-16 bg-white border-b border-[#d1e5dc] flex items-center gap-2 px-4 md:px-6 shrink-0">
                <div className="bg-[#5ba58c] p-2 rounded-xl">
                    <HeartPulse className="text-white h-5 w-5" />
                </div>
                <span className="text-[#255f4f] font-bold text-lg">Medicina Preventiva</span>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="max-w-2xl mx-auto space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#e3f1eb] text-[#5ba58c]">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[#255f4f]">{MP_TERMO_TITULO}</h1>
                            <p className="text-sm text-[#6b8c7d]">
                                Leia e aceite para continuar usando o módulo.
                            </p>
                        </div>
                    </div>

                    <div className="bg-white border border-[#e6efe9] rounded-2xl p-5 whitespace-pre-line text-sm leading-relaxed text-[#4f665a] max-h-[45vh] overflow-y-auto">
                        {MP_TERMO_TEXTO}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer bg-white border border-[#e6efe9] rounded-2xl p-4">
                        <Checkbox
                            checked={marcado}
                            onCheckedChange={(v) => setMarcado(v === true)}
                            className="mt-0.5"
                        />
                        <span className="text-sm font-medium text-[#255f4f]">
                            Li e concordo com o termo de consentimento acima.
                        </span>
                    </label>

                    <Button
                        type="button"
                        onClick={aceitar}
                        disabled={!marcado || salvando}
                        className="w-full bg-[#5ba58c] text-white rounded-xl h-12 text-base font-bold"
                    >
                        {salvando ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Registrando...
                            </>
                        ) : (
                            "Aceitar e continuar"
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
