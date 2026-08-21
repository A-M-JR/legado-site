import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { catalogoSintomasService } from "../services/sintomasParceiroService";
import { isParceiroAdmin } from "../services/parceiroScope";
import type { SintomaCatalogo } from "@/modules/medicina-preventiva/types";

const GRAVIDADES: { id: SintomaCatalogo["gravidadePadrao"]; label: string; cor: string }[] = [
    { id: "baixa", label: "Baixa", cor: "text-emerald-600" },
    { id: "media", label: "Média", cor: "text-amber-600" },
    { id: "alta", label: "Alta", cor: "text-rose-600" },
];

const FORM_INICIAL = {
    nome: "",
    categoria: "",
    descricao: "",
    gravidadePadrao: "media" as SintomaCatalogo["gravidadePadrao"],
};

export default function CatalogoSintomasPage() {
    const { userProfile } = useOutletContext<{ userProfile?: { role?: string } }>();
    const podeEditar = isParceiroAdmin(userProfile?.role);

    const [sintomas, setSintomas] = useState<SintomaCatalogo[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [salvando, setSalvando] = useState(false);
    const [carregandoSugeridos, setCarregandoSugeridos] = useState(false);

    async function carregar() {
        setLoading(true);
        setSintomas(await catalogoSintomasService.list());
        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    async function salvar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.nome.trim() || salvando) return;

        setSalvando(true);
        try {
            await catalogoSintomasService.create({
                nome: form.nome.trim(),
                categoria: form.categoria.trim(),
                descricao: form.descricao.trim(),
                gravidadePadrao: form.gravidadePadrao,
            });
            setForm(FORM_INICIAL);
            setModalAberto(false);
            toast({ title: "Sintoma cadastrado" });
            carregar();
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

    async function alternarAtivo(s: SintomaCatalogo) {
        try {
            await catalogoSintomasService.update(s.id, { ativo: !s.ativo });
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function remover(s: SintomaCatalogo) {
        try {
            await catalogoSintomasService.remove(s.id);
            toast({ title: "Sintoma removido" });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao remover",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function carregarSugeridos() {
        setCarregandoSugeridos(true);
        try {
            const total = await catalogoSintomasService.carregarSugeridos();
            toast({
                title: total > 0 ? `${total} sintomas adicionados` : "Nada novo a adicionar",
            });
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setCarregandoSugeridos(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Cadastro de sintomas</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        A lista que os pacientes desta clínica veem no app.
                    </p>
                </div>
                {podeEditar && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={carregarSugeridos}
                            disabled={carregandoSugeridos}
                        >
                            {carregandoSugeridos ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                            )}
                            Lista sugerida
                        </Button>
                        <Button
                            onClick={() => setModalAberto(true)}
                            className="bg-[#5ba58c] text-white"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Novo sintoma
                        </Button>
                    </div>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">
                        {sintomas.length} sintoma(s) cadastrado(s)
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : sintomas.length === 0 ? (
                        <p className="py-12 text-center text-sm text-[#6b8c7d]">
                            Nenhum sintoma cadastrado. Use “Lista sugerida” para começar rápido.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Sintoma</TableHead>
                                    <TableHead>Categoria</TableHead>
                                    <TableHead>Gravidade</TableHead>
                                    <TableHead>Visível no app</TableHead>
                                    {podeEditar && <TableHead className="text-right">Ações</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sintomas.map((s) => {
                                    const gravidade = GRAVIDADES.find(
                                        (g) => g.id === s.gravidadePadrao
                                    );
                                    return (
                                        <TableRow key={s.id}>
                                            <TableCell className="font-medium text-[#255f4f]">
                                                {s.nome}
                                                {s.descricao && (
                                                    <span className="block text-xs text-[#9db4aa]">
                                                        {s.descricao}
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{s.categoria || "—"}</TableCell>
                                            <TableCell className={gravidade?.cor}>
                                                {gravidade?.label}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={s.ativo}
                                                    disabled={!podeEditar}
                                                    onCheckedChange={() => alternarAtivo(s)}
                                                />
                                            </TableCell>
                                            {podeEditar && (
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => remover(s)}
                                                        className="text-rose-500 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[460px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Novo sintoma</DialogTitle>
                        <DialogDescription>
                            Ele aparece como opção para o paciente marcar.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={salvar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Nome</label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                                placeholder="Ex.: Dor no peito"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Categoria
                                </label>
                                <Input
                                    value={form.categoria}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, categoria: e.target.value }))
                                    }
                                    placeholder="Cardiovascular"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-[#4f665a]">
                                    Gravidade
                                </label>
                                <select
                                    value={form.gravidadePadrao}
                                    onChange={(e) =>
                                        setForm((f) => ({
                                            ...f,
                                            gravidadePadrao: e.target
                                                .value as SintomaCatalogo["gravidadePadrao"],
                                        }))
                                    }
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                >
                                    {GRAVIDADES.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Descrição (opcional)
                            </label>
                            <Input
                                value={form.descricao}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, descricao: e.target.value }))
                                }
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setModalAberto(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={salvando}
                                className="flex-1 bg-[#5ba58c] text-white"
                            >
                                {salvando ? "Salvando..." : "Salvar"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
