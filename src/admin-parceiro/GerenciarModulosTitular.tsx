import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
    open: boolean;
    onClose: () => void;
    titularId: string | null;
    titularNome?: string;
    parceiroId: string;
    refresh?: () => Promise<void> | void; // <-- opcional
}

interface Modulo {
    id: string;
    nome: string;
    habilitadoParaTitular?: boolean;
}

export default function GerenciarModulosTitular({
    open,
    onClose,
    titularId,
    titularNome,
    parceiroId,
    refresh,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [modulos, setModulos] = useState<Modulo[]>([]);

    useEffect(() => {
        if (open && titularId) {
            loadData();
        } else if (!open) {
            setModulos([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, titularId]);

    async function loadData() {
        if (!parceiroId) {
            setModulos([]);
            return;
        }

        setLoadingData(true);
        try {
            // 1) módulos que o parceiro oferece (join com modulos para ter nome)
            const { data: parceiroMods, error: pErr } = await supabase
                .from("parceiro_modulos")
                .select("modulo_id, modulos(nome)")
                .eq("parceiro_id", parceiroId)
                .eq("habilitado", true);

            if (pErr) throw pErr;

            const available = (parceiroMods || []).map((p: any) => ({
                id: p.modulo_id,
                nome: p.modulos?.nome || "Módulo",
                habilitadoParaTitular: false,
            })) as Modulo[];

            // 2) módulos já habilitados para o titular
            const { data: tMods, error: tErr } = await supabase
                .from("titular_modulos")
                .select("modulo_id, habilitado")
                .eq("titular_id", titularId);

            if (tErr) throw tErr;

            const titularMap = new Map<string, boolean>();
            (tMods || []).forEach((tm: any) => titularMap.set(tm.modulo_id, !!tm.habilitado));

            // merge
            const merged = available.map((m) => ({
                ...m,
                habilitadoParaTitular: titularMap.has(m.id) ? titularMap.get(m.id) : false,
            }));

            setModulos(merged);
        } catch (err: any) {
            console.error("Erro ao carregar módulos:", err);
            toast({
                title: "Erro",
                description: "Não foi possível carregar módulos.",
                variant: "destructive",
            });
        } finally {
            setLoadingData(false);
        }
    }

    function toggleModulo(id: string) {
        setModulos((prev) => prev.map((m) => (m.id === id ? { ...m, habilitadoParaTitular: !m.habilitadoParaTitular } : m)));
    }

    async function salvarMudancas() {
        if (!titularId) return;
        setLoading(true);

        try {
            const moduloIds = modulos.map((m) => m.id);

            // buscar estado atual de titular_modulos para este titular e estes módulos
            const { data: existings } = await supabase
                .from("titular_modulos")
                .select("id, modulo_id, habilitado")
                .eq("titular_id", titularId)
                .in("modulo_id", moduloIds);

            const existingMap = new Map<string, any>();
            (existings || []).forEach((e: any) => existingMap.set(e.modulo_id, e));

            const inserts: any[] = [];
            const updates: any[] = [];

            modulos.forEach((m) => {
                const current = existingMap.get(m.id);
                const desired = !!m.habilitadoParaTitular;

                if (!current && desired) {
                    inserts.push({ titular_id: titularId, modulo_id: m.id, habilitado: true });
                } else if (current && current.habilitado !== desired) {
                    updates.push({ id: current.id, habilitado: desired });
                }
            });

            if (inserts.length > 0) {
                const { error: iErr } = await supabase.from("titular_modulos").insert(inserts);
                if (iErr) throw iErr;
            }

            if (updates.length > 0) {
                // atualiza cada registro que precisa de mudança
                await Promise.all(
                    updates.map((u) => supabase.from("titular_modulos").update({ habilitado: u.habilitado }).eq("id", u.id))
                );
            }

            toast({ title: "Sucesso", description: "Módulos atualizados." });
            // chama refresh se foi passado
            if (refresh) await refresh();
            onClose();
        } catch (err: any) {
            console.error("Erro ao salvar módulos:", err);
            toast({
                title: "Erro",
                description: "Não foi possível atualizar os módulos.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gerenciar Módulos {titularNome ? `- ${titularNome}` : ""}</DialogTitle>
                </DialogHeader>

                {loadingData ? (
                    <div className="py-8 text-center">Carregando módulos...</div>
                ) : (
                    <>
                        <div className="space-y-3 py-2">
                            {modulos.length === 0 ? (
                                <div className="text-sm text-gray-500">Este parceiro não possui módulos configurados.</div>
                            ) : (
                                modulos.map((m) => (
                                    <div key={m.id} className="flex items-center justify-between border-b py-2">
                                        <div>
                                            <div className="font-medium">{m.nome}</div>
                                        </div>
                                        <div>
                                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={!!m.habilitadoParaTitular}
                                                    onChange={() => toggleModulo(m.id)}
                                                />
                                                <span className="text-sm text-gray-600">{m.habilitadoParaTitular ? "Ativo" : "Inativo"}</span>
                                            </label>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Separator />

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => onClose()} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={salvarMudancas} className="bg-emerald-600" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Salvar Módulos
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}