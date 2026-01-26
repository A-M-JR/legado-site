// src/.../GerenciarUsuario.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Trash2, KeyRound, Save, Loader2, Eye, EyeOff,
    Upload, X, User, ShieldCheck, History, Smartphone
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type StatusUsuario = "ativo" | "inativo" | "inadimplente" | "vitalicio";

export default function GerenciarUsuario({ open, onClose, user, refresh }: any) {
    const [loading, setLoading] = useState(false);

    // Dados editáveis
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState<StatusUsuario>("ativo");
    const [parceiroId, setParceiroId] = useState<string>("none");

    // Foto
    const [fotoAtual, setFotoAtual] = useState<string | null>(null);
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    // Módulos
    const [moduloLegado, setModuloLegado] = useState(false);
    const [moduloIdoso, setModuloIdoso] = useState(false);
    const [moduloPaliativo, setModuloPaliativo] = useState(false);

    // Parceiros
    const [parceiros, setParceiros] = useState<any[]>([]);

    // Logs de Login
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    // Dialogs
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (open && user) {
            carregarDados();
            loadParceiros();
            carregarLogs();
        }
    }, [open, user]);

    async function carregarDados() {
        setModuloLegado(false);
        setModuloIdoso(false);
        setModuloPaliativo(false);

        // Se o usuário não tem titular_id, usa informações diretas do user
        if (!user?.titular_id) {
            setRole(user.role || "");
            setStatus((user.status as StatusUsuario) || "ativo");
            setParceiroId(user.parceiro_id ?? "none");
            return;
        }

        const { data: titular } = await supabase
            .from("titulares")
            .select("*")
            .eq("id", user.titular_id)
            .single();

        if (titular) {
            setNome(titular.nome || "");
            setCpf(titular.cpf || "");
            setTelefone(titular.telefone || "");
            setDataNascimento(titular.data_nascimento || "");
            setEmail(titular.email || "");
            setFotoAtual(titular.imagem_url || null);
            setFotoPreview(titular.imagem_url || null);

            // Preencher parceiroId caso exista no titular
            if ((titular.parceiro_id)) {
                setParceiroId(titular.parceiro_id);
            }
        }

        setRole(user.role || "");
        setStatus((user.status as StatusUsuario) || "ativo");
        setParceiroId(user.parceiro_id ?? parceiroId);

        const { data: modulos } = await supabase
            .from("titular_modulos")
            .select("modulo_id, modulos(nome)")
            .eq("titular_id", user.titular_id)
            .eq("habilitado", true);

        if (modulos) {
            modulos.forEach((m: any) => {
                const nome = m.modulos?.nome?.toLowerCase();
                if (nome?.includes("legado")) setModuloLegado(true);
                if (nome?.includes("idoso")) setModuloIdoso(true);
                if (nome?.includes("paliativo")) setModuloPaliativo(true);
            });
        }
    }

    async function loadParceiros() {
        const { data } = await supabase.from("parceiros").select("id, nome").eq("ativo", true).order("nome");
        if (data) setParceiros(data);
    }

    async function carregarLogs() {
        if (!user?.auth_id) return;
        setLoadingLogs(true);
        const { data } = await supabase
            .from("login_logs")
            .select("*")
            .eq("auth_id", user.auth_id)
            .order("login_at", { ascending: false })
            .limit(30);
        if (data) setLogs(data);
        setLoadingLogs(false);
    }

    async function salvar() {
        setLoading(true);

        // Validação: se for parceiro_admin obrigar seleção de parceiro
        if (role === "parceiro_admin" && (!parceiroId || parceiroId === "none")) {
            toast({ title: "Erro", description: "Selecione a empresa parceira para o papel Parceiro Admin", variant: "destructive" });
            setLoading(false);
            return;
        }

        try {
            // Atualiza usuários_app
            const { error: uErr } = await supabase.from("usuarios_app").update({
                role,
                status,
                parceiro_id: parceiroId === "none" ? null : parceiroId,
            }).eq("auth_id", user.auth_id);

            if (uErr) throw uErr;

            // Se houver titular, atualiza dados do titular (incluindo parceiro_id)
            if (user.titular_id) {
                let fotoUrl = fotoAtual;
                if (fotoFile) {
                    const fileName = `${user.auth_id}-${Date.now()}`;
                    const { error: upErr } = await supabase.storage.from("titulares").upload(fileName, fotoFile);
                    if (!upErr) {
                        const { data: urlData } = supabase.storage.from("titulares").getPublicUrl(fileName);
                        fotoUrl = urlData.publicUrl;
                    }
                }

                const { error: tErr } = await supabase.from("titulares").update({
                    nome,
                    cpf: cpf.replace(/\D/g, ""),
                    telefone,
                    data_nascimento: dataNascimento,
                    email,
                    imagem_url: fotoUrl,
                }).eq("id", user.titular_id);

                if (tErr) throw tErr;

                // Atualiza módulos do titular
                await supabase.from("titular_modulos").delete().eq("titular_id", user.titular_id);
                const { data: todosModulos } = await supabase.from("modulos").select("id, nome");
                if (todosModulos) {
                    const inserts: any[] = [];
                    if (moduloLegado) {
                        const m = todosModulos.find((x: any) => x.nome.toLowerCase().includes("legado"));
                        if (m) inserts.push({ titular_id: user.titular_id, modulo_id: m.id, habilitado: true });
                    }
                    if (moduloIdoso) {
                        const m = todosModulos.find((x: any) => x.nome.toLowerCase().includes("idoso"));
                        if (m) inserts.push({ titular_id: user.titular_id, modulo_id: m.id, habilitado: true });
                    }
                    if (moduloPaliativo) {
                        const m = todosModulos.find((x: any) => x.nome.toLowerCase().includes("paliativo"));
                        if (m) inserts.push({ titular_id: user.titular_id, modulo_id: m.id, habilitado: true });
                    }
                    if (inserts.length > 0) {
                        const { error: insErr } = await supabase.from("titular_modulos").insert(inserts);
                        if (insErr) throw insErr;
                    }
                }
            }

            toast({ title: "✅ Sucesso", description: "Usuário atualizado." });
            refresh();
            onClose();
        } catch (e: any) {
            toast({ title: "❌ Erro", description: e.message || "Erro ao salvar usuário", variant: "destructive" });
        } finally { setLoading(false); }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[95vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-2">
                        <DialogTitle className="text-2xl">Gerenciar Usuário</DialogTitle>
                        <DialogDescription>Ajuste permissões, dados e visualize o histórico.</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="dados" className="flex-1 flex flex-col overflow-hidden">
                        <div className="px-6">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="dados" className="flex items-center gap-2">
                                    <User className="h-4 w-4" /> Perfil e Acesso
                                </TabsTrigger>
                                <TabsTrigger value="logs" className="flex items-center gap-2">
                                    <History className="h-4 w-4" /> Logs de Login
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6">
                            {/* ABA 1: DADOS E ACESSO */}
                            <TabsContent value="dados" className="space-y-6 mt-0">

                                {/* Seção Foto e Dados Básicos */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-xl border border-dashed">
                                        <Label className="mb-4">Foto de Perfil</Label>
                                        <div className="relative group">
                                            {fotoPreview ? (
                                                <img src={fotoPreview} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-md">
                                                    <User className="h-12 w-12 text-gray-400" />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer">
                                                <Upload className="h-6 w-6 text-white" />
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setFotoFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setFotoPreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} className="hidden" />
                                            </label>
                                        </div>
                                        {fotoFile && (
                                            <Button variant="ghost" size="sm" className="mt-2 text-red-500" onClick={() => { setFotoFile(null); setFotoPreview(fotoAtual); }}>
                                                Desfazer
                                            </Button>
                                        )}
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Nome Completo</Label>
                                            <Input value={nome} onChange={e => setNome(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CPF</Label>
                                            <Input value={cpf} onChange={e => setCpf(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>E-mail</Label>
                                            <Input value={email} onChange={e => setEmail(e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Telefone</Label>
                                            <Input value={telefone} onChange={e => setTelefone(e.target.value)} />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Configurações de Acesso */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Permissões</h4>
                                        <div className="space-y-2">
                                            <Label>Papel (Role)</Label>
                                            <Select value={role} onValueChange={setRole}>
                                                <SelectTrigger><SelectValue placeholder="Selecione um papel" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin_master">🔑 Admin Master</SelectItem>
                                                    <SelectItem value="parceiro_admin">🏢 Parceiro Admin</SelectItem>
                                                    <SelectItem value="titular">👤 Titular</SelectItem>
                                                    <SelectItem value="familiar">👨‍👩‍👧 Familiar</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Status da Conta</Label>
                                            <Select value={status} onValueChange={(v) => setStatus(v as StatusUsuario)}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                                                    <SelectItem value="inativo">⚫ Inativo</SelectItem>
                                                    <SelectItem value="inadimplente">⚠️ Inadimplente</SelectItem>
                                                    <SelectItem value="vitalicio">⭐ Vitalício</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Novo: Seleção de Parceiro */}
                                        <div className="space-y-2">
                                            <Label>Empresa Parceira (atribuir)</Label>
                                            <Select value={parceiroId} onValueChange={(v) => setParceiroId(v)}>
                                                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">— Nenhuma —</SelectItem>
                                                    {parceiros.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {parceiroId !== "none" && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Selecionado: {parceiros.find(p => p.id === parceiroId)?.nome ?? "—"}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-1">
                                                Observação: selecione uma empresa parceira quando o usuário for um administrador de parceiro.
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold flex items-center gap-2">📦 Módulos Habilitados</h4>
                                        <div className="grid grid-cols-1 gap-3 bg-gray-50 p-4 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Checkbox id="legado" checked={moduloLegado} onCheckedChange={v => setModuloLegado(!!v)} />
                                                <Label htmlFor="legado" className="font-normal">📖 Legado (Memórias)</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Checkbox id="idoso" checked={moduloIdoso} onCheckedChange={v => setModuloIdoso(!!v)} />
                                                <Label htmlFor="idoso" className="font-normal">👴 Cuidados ao Idoso</Label>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Checkbox id="paliativo" checked={moduloPaliativo} onCheckedChange={v => setModuloPaliativo(!!v)} />
                                                <Label htmlFor="paliativo" className="font-normal">🕊️ Cuidados Paliativos</Label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                                    <Button className="flex-1 h-12 text-lg" onClick={salvar} disabled={loading}>
                                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />} Salvar Alterações
                                    </Button>
                                    <Button variant="outline" className="h-12" onClick={() => setShowPasswordDialog(true)}>
                                        <KeyRound className="mr-2 h-4 w-4" /> Senha
                                    </Button>
                                    <Button variant="destructive" className="h-12" onClick={() => setShowDeleteDialog(true)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* ABA 2: LOGS DE LOGIN */}
                            <TabsContent value="logs" className="mt-0">
                                <div className="bg-white rounded-xl border overflow-hidden">
                                    <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Últimos 30 acessos</span>
                                        {loadingLogs && <Loader2 className="h-4 w-4 animate-spin" />}
                                    </div>

                                    <div className="divide-y max-h-[500px] overflow-y-auto">
                                        {logs.length === 0 ? (
                                            <div className="p-12 text-center text-gray-400">Nenhum log encontrado.</div>
                                        ) : (
                                            logs.map((log) => (
                                                <div key={log.id} className="p-4 hover:bg-gray-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${log.sucesso ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                            <Smartphone className="h-4 w-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold">{log.sucesso ? 'Login realizado' : 'Falha no acesso'}</p>
                                                            <p className="text-xs text-gray-500">{new Date(log.login_at).toLocaleString('pt-BR')}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs font-mono text-gray-400">{log.ip || 'IP não registrado'}</p>
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{log.user_agent}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* DIALOGS AUXILIARES (SENHA E DELETE) MANTIDOS IGUAIS */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[400px] w-[90vw]">
                    <DialogHeader><DialogTitle>Alterar Senha</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nova Senha</Label>
                            <Input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Confirmar Senha</Label>
                            <Input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={async () => {
                            if (novaSenha !== confirmarSenha) return toast({ title: "Erro", description: "Senhas não conferem", variant: "destructive" });
                            setLoading(true);
                            const { error } = await supabase.rpc('alterar_senha_usuario', { user_id: user.auth_id, nova_senha: novaSenha });
                            setLoading(false);
                            if (!error) { toast({ title: "Sucesso", description: "Senha alterada" }); setShowPasswordDialog(false); }
                        }}>Confirmar Nova Senha</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="w-[90vw] sm:max-w-[450px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Inativar Usuário?</AlertDialogTitle>
                        <AlertDialogDescription>O usuário perderá o acesso imediatamente, mas os dados serão mantidos no banco.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600" onClick={async () => {
                            await supabase.from("usuarios_app").update({ status: "inativo" }).eq("auth_id", user.auth_id);
                            refresh(); onClose();
                        }}>Sim, Inativar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}