import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { UserPlus, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { equipeService, type MembroEquipe } from "../services/equipeService";
import { isParceiroAdmin } from "../services/parceiroScope";

const FORM_INICIAL = { nome: "", email: "", senha: "" };

export default function EquipePage() {
    const navigate = useNavigate();
    const { userProfile } = useOutletContext<{ userProfile?: { role?: string } }>();
    const podeEditar = isParceiroAdmin(userProfile?.role);

    const [membros, setMembros] = useState<MembroEquipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [salvando, setSalvando] = useState(false);

    async function carregar() {
        setLoading(true);
        setMembros(await equipeService.list());
        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    async function criar(e: React.FormEvent) {
        e.preventDefault();
        if (salvando) return;

        if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6) {
            toast({
                title: "Dados incompletos",
                description: "Preencha nome, e-mail e uma senha de ao menos 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        setSalvando(true);
        try {
            await equipeService.criarOperador({
                nome: form.nome.trim(),
                email: form.email.trim(),
                senha: form.senha,
            });
            setForm(FORM_INICIAL);
            setModalAberto(false);
            toast({
                title: "Operadora cadastrada",
                description: "Ela já pode entrar com o e-mail e a senha informados.",
            });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao cadastrar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    async function alternarStatus(m: MembroEquipe) {
        try {
            await equipeService.setStatus(m.id, m.status === "ativo" ? "inativo" : "ativo");
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    if (!podeEditar) {
        return (
            <Card>
                <CardContent className="py-16 text-center space-y-3">
                    <ShieldCheck className="h-8 w-8 mx-auto text-[#9db4aa]" />
                    <p className="text-sm text-[#6b8c7d]">
                        Somente o administrador da clínica gerencia a equipe.
                    </p>
                    <Button variant="outline" onClick={() => navigate("/admin-parceiro/agenda")}>
                        Ir para a agenda
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Equipe da clínica</h1>
                    <p className="text-sm text-[#6b8c7d]">
                        Operadoras acessam agenda, sintomas e exames — não mexem em configurações.
                    </p>
                </div>
                <Button onClick={() => setModalAberto(true)} className="bg-[#5ba58c] text-white">
                    <UserPlus className="mr-2 h-4 w-4" /> Nova operadora
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-[#255f4f]">
                        {membros.length} acesso(s)
                    </CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {loading ? (
                        <div className="py-12 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead>Papel</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {membros.map((m) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium text-[#255f4f]">
                                            {m.nome || "—"}
                                        </TableCell>
                                        <TableCell>{m.email || "—"}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    m.role === "parceiro_admin"
                                                        ? "default"
                                                        : "secondary"
                                                }
                                            >
                                                {m.role === "parceiro_admin"
                                                    ? "Administrador"
                                                    : "Operadora"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={
                                                    m.status === "ativo"
                                                        ? "text-emerald-600 text-sm font-semibold"
                                                        : "text-rose-500 text-sm font-semibold"
                                                }
                                            >
                                                {m.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {m.role === "parceiro_operador" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => alternarStatus(m)}
                                                >
                                                    {m.status === "ativo" ? "Desativar" : "Ativar"}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Nova operadora</DialogTitle>
                        <DialogDescription>
                            Ela entra pelo mesmo login e cai direto no painel da clínica.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={criar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Nome completo
                            </label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">E-mail</label>
                            <Input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Senha provisória
                            </label>
                            <div className="relative">
                                <Input
                                    type={mostrarSenha ? "text" : "password"}
                                    value={form.senha}
                                    onChange={(e) =>
                                        setForm((f) => ({ ...f, senha: e.target.value }))
                                    }
                                    minLength={6}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9db4aa]"
                                    aria-label="Mostrar senha"
                                >
                                    {mostrarSenha ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[11px] text-[#9db4aa]">
                                Combine com ela para trocar a senha no primeiro acesso.
                            </p>
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
                                {salvando ? "Criando..." : "Criar acesso"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
