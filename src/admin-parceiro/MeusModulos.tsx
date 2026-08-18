import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Grid, Loader2, CheckCircle2, Lock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
    open: boolean;
    onClose: () => void;
    parceiroId: string | null;
    parceiroNome?: string;
}

interface ModuloItem {
    id: string;
    nome: string;
    liberado: boolean;
}

export default function MeusModulos({ open, onClose, parceiroId, parceiroNome }: Props) {
    const [modulos, setModulos] = useState<ModuloItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && parceiroId) {
            loadModulos();
        } else if (!open) {
            setModulos([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, parceiroId]);

    async function loadModulos() {
        setLoading(true);
        try {
            // 1) módulos liberados para este parceiro (join para pegar o nome)
            const { data: doParceiro, error: pErr } = await supabase
                .from("parceiro_modulos")
                .select("modulo_id, habilitado, modulos(nome)")
                .eq("parceiro_id", parceiroId);

            if (pErr) throw pErr;

            const mapaParceiro = new Map<string, { nome: string; habilitado: boolean }>();
            (doParceiro || []).forEach((p: any) => {
                mapaParceiro.set(p.modulo_id, {
                    nome: p.modulos?.nome || "Módulo",
                    habilitado: !!p.habilitado,
                });
            });

            // 2) catálogo de módulos ativos do sistema (para mostrar também o que não é contratado)
            const { data: catalogo } = await supabase
                .from("modulos")
                .select("id, nome")
                .eq("ativo", true)
                .order("nome");

            const lista: ModuloItem[] =
                catalogo && catalogo.length > 0
                    ? catalogo.map((m: any) => ({
                          id: m.id,
                          nome: m.nome,
                          liberado: mapaParceiro.get(m.id)?.habilitado ?? false,
                      }))
                    : Array.from(mapaParceiro.entries()).map(([id, m]) => ({
                          id,
                          nome: m.nome,
                          liberado: m.habilitado,
                      }));

            setModulos(lista);
        } catch (err: any) {
            console.error("Erro ao carregar módulos do parceiro:", err);
            toast({
                title: "Erro",
                description: "Não foi possível carregar os módulos.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    const liberados = modulos.filter((m) => m.liberado).length;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#255f4f]">
                        <Grid className="h-5 w-5 text-[#5ba58c]" />
                        Meus Módulos
                    </DialogTitle>
                    <DialogDescription>
                        Jornadas liberadas para <strong>{parceiroNome || "sua unidade"}</strong>. Para
                        contratar novos módulos, fale com a administração da plataforma.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-2" />

                {loading ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10 text-[#6b8c7d]">
                        <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        <span className="text-sm">Carregando módulos...</span>
                    </div>
                ) : modulos.length === 0 ? (
                    <div className="py-10 text-center text-sm text-[#6b8c7d]">
                        Nenhum módulo configurado para este parceiro.
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {modulos.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                                        m.liberado
                                            ? "border-[#d1e5dc] bg-[#f4fbf8]"
                                            : "border-gray-200 bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {m.liberado ? (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5ba58c]" />
                                        ) : (
                                            <Lock className="h-4 w-4 shrink-0 text-gray-400" />
                                        )}
                                        <span
                                            className={`truncate text-sm font-semibold ${
                                                m.liberado ? "text-[#255f4f]" : "text-gray-500"
                                            }`}
                                        >
                                            {m.nome}
                                        </span>
                                    </div>
                                    <Badge
                                        className={
                                            m.liberado
                                                ? "border-none bg-[#e3f1eb] text-[#255f4f] hover:bg-[#e3f1eb]"
                                                : "border-none bg-gray-200 text-gray-600 hover:bg-gray-200"
                                        }
                                    >
                                        {m.liberado ? "Liberado" : "Não contratado"}
                                    </Badge>
                                </div>
                            ))}
                        </div>

                        <p className="pt-2 text-xs text-[#6b8c7d]">
                            {liberados} de {modulos.length} módulos liberados.
                        </p>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
