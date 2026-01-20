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
    parceiroId: string | null;
    parceiroNome: string;
    open: boolean;
    onClose: () => void;
}

export default function GerenciarModulos({ parceiroId, parceiroNome, open, onClose }: Props) {
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [modulosAtivos, setModulosAtivos] = useState<string[]>([]); // IDs dos módulos ativos
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (open && parceiroId) {
            fetchDados();
        }
    }, [open, parceiroId]);

    async function fetchDados() {
        setLoading(true);

        // 1. Busca todos os módulos disponíveis no sistema
        const { data: todosModulos } = await supabase.from("modulos").select("*");

        // 2. Busca quais estão ativos para este parceiro
        const { data: ativos } = await supabase
            .from("parceiro_modulos")
            .select("modulo_id")
            .eq("parceiro_id", parceiroId)
            .eq("habilitado", true);

        if (todosModulos) setModulos(todosModulos);
        if (ativos) setModulosAtivos(ativos.map(a => a.modulo_id));

        setLoading(false);
    }

    async function toggleModulo(moduloId: string, habilitar: boolean) {
        if (!parceiroId) return;

        // Upsert: Insere ou atualiza a permissão do parceiro
        const { error } = await supabase
            .from("parceiro_modulos")
            .upsert({
                parceiro_id: parceiroId,
                modulo_id: moduloId,
                habilitado: habilitar
            }, { onConflict: 'parceiro_id,modulo_id' });

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
                    <DialogTitle>Gerenciar Módulos</DialogTitle>
                    <DialogDescription>
                        Ative ou desative as jornadas disponíveis para <strong>{parceiroNome}</strong>.
                    </DialogDescription>
                </DialogHeader>

                <Separator className="my-4" />

                <div className="space-y-6">
                    {loading ? (
                        <p className="text-center text-sm text-gray-500">Carregando permissões...</p>
                    ) : (
                        modulos.map((modulo) => (
                            <div key={modulo.id} className="flex items-center justify-between space-x-4">
                                <div className="flex flex-col space-y-1">
                                    <Label className="text-base font-semibold">{modulo.nome}</Label>
                                    <p className="text-sm text-gray-500">
                                        Permitir que este parceiro ofereça esta jornada.
                                    </p>
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