import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Loader2, MessageCircle } from "lucide-react";
import { mensagensClinicaService } from "./services/mensagensClinicaService";

interface Props {
    open: boolean;
    onClose: () => void;
    titularId: string | null;
    titularNome: string;
    remetente: string;
}

export default function MensagemClinicaDialog({
    open,
    onClose,
    titularId,
    titularNome,
    remetente,
}: Props) {
    const [mensagem, setMensagem] = useState("");
    const [enviando, setEnviando] = useState(false);

    async function enviar() {
        if (!titularId || !mensagem.trim() || enviando) return;
        setEnviando(true);
        try {
            await mensagensClinicaService.enviar({
                titularId,
                mensagem: mensagem.trim(),
                remetente,
            });
            toast({ title: "Mensagem enviada ao paciente" });
            setMensagem("");
            onClose();
        } catch (err) {
            toast({
                title: "Erro ao enviar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setEnviando(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="text-[#255f4f] flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-[#5ba58c]" />
                        Mensagem para {titularNome || "o paciente"}
                    </DialogTitle>
                    <DialogDescription>
                        O paciente recebe no app, em "Minha família", como mensagem da clínica.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Textarea
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        rows={5}
                        placeholder="Escreva a mensagem para o paciente..."
                    />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onClose}
                            disabled={enviando}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            className="flex-1 bg-[#5ba58c] text-white"
                            onClick={enviar}
                            disabled={enviando || !mensagem.trim()}
                        >
                            {enviando ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                                </>
                            ) : (
                                "Enviar"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
