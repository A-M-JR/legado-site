import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Modulo {
    id: string;
    nome: string;
    slug: string;
}

interface Props {
    titularId: string | null;
    titularNome: string;
    parceiroId: string;
    open: boolean;
    onClose: () => void;
}

export default function GerenciarModulosTitular({ titularId, titularNome, parceiroId, open, onClose }: Props) {
    const [modulosPermitidos, setModulosPermitidos] = useState<Modulo[]>([]);
    const [modulosAtivos, setModulosAtivos] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && titularId && parceiroId) {
            fetchDados();
        }
    }, [open, titularId, parceiroId]);

    async function fetchDados() {
        setLoading(true);

        // 1. Busca módulos que a CLÍNICA tem permissão de oferecer
        const { data: permissaoParceiro } = await supabase
            .from("parceiro_modulos")
            .select("modulos (id, nome, slug)")
            .eq("parceiro_id", parceiroId)
            .eq("habilitado", true);

        // 2. Busca módulos que o CLIENTE já tem ativos
        const { data: ativosCliente } = await supabase
            .from("titular_modulos")
            .select("modulo_id")
            .eq("titular_id", titularId)
            .eq("habilitado", true);

        if (permissaoParceiro) {
            const formatados = permissaoParceiro.map((p: any) => p.modulos);
            setModulosPermitidos(formatados);
        }

        if (ativosCliente) {
            setModulosAtivos(ativosCliente.map(a => a.modulo_id));
        }

        setLoading(false);
    }

    async function toggleModulo(moduloId: string, habilitar: boolean) {
        if (!titularId) return;

        const { error } = await supabase
            .from("titular_modulos")
            .upsert({
                titular_id: titularId,
                modulo_id: moduloId,
                habilitado: habilitar
            }, { onConflict: 'titular_id,modulo_id' });

        if (!error) {
            setModulosAtivos(prev =>
                habilitar ? [...prev, moduloId] : prev.filter(id => id !== moduloId)
            );
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ativar Jornadas</DialogTitle>
                    <DialogDescription>
                        Selecione quais jornadas o cliente <strong>{titularNome}</strong> poderá acessar.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-4" />

                <div className="space-y-6">
                    {loading ? (
                        <p className="text-center text-sm text-gray-500">Carregando...</p>
                    ) : modulosPermitidos.length === 0 ? (
                        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded">
                            Sua clínica ainda não tem módulos liberados pelo administrador master.
                        </p>
                    ) : (
                        modulosPermitidos.map((modulo) => (
                            <div key={modulo.id} className="flex items-center justify-between space-x-4">
                                <div className="flex flex-col space-y-1">
                                    <Label className="text-base font-semibold">{modulo.nome}</Label>
                                </div>
                                <Switch
                                    checked={modulosAtivos.includes(modulo.id)}
                                    onCheckedChange={(checked) => toggleModulo(modulo.id, checked)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}