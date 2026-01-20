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
import { Trash2, KeyRound, Save, Loader2, Eye, EyeOff, Upload, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function GerenciarUsuario({ open, onClose, user, refresh }: any) {
    const [loading, setLoading] = useState(false);

    // Dados editáveis
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("ativo");
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
        if (!user?.titular_id) {
            // Se não for titular, só carrega role, status e parceiro
            setRole(user.role || "");
            setStatus(user.status || "ativo");
            setParceiroId(user.parceiro_id ?? "none");
            return;
        }

        // Buscar dados completos do titular
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
        }

        setRole(user.role || "");
        setStatus(user.status || "ativo");
        setParceiroId(user.parceiro_id ?? "none");

        // Carregar módulos habilitados
        const { data: modulos } = await supabase
            .from("titular_modulos")
            .select("modulo_id, modulos(nome)")
            .eq("titular_id", user.titular_id);

        if (modulos) {
            modulos.forEach((m: any) => {
                if (m.modulos.nome === "Legado") setModuloLegado(true);
                if (m.modulos.nome === "Cuidados ao Idoso") setModuloIdoso(true);
                if (m.modulos.nome === "Cuidados Paliativos") setModuloPaliativo(true);
            });
        }
    }

    async function loadParceiros() {
        const { data } = await supabase
            .from("parceiros")
            .select("id, nome")
            .eq("ativo", true)
            .order("nome");
        if (data) setParceiros(data);
    }

    async function carregarLogs() {
        if (!user?.auth_id) return;
        setLoadingLogs(true);

        const { data, error } = await supabase
            .from("login_logs")
            .select("*")
            .eq("auth_id", user.auth_id)
            .order("login_at", { ascending: false })
            .limit(50);

        if (!error && data) setLogs(data);
        setLoadingLogs(false);
    }

    function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    function removerFoto() {
        setFotoFile(null);
        setFotoPreview(fotoAtual);
    }

    async function salvar() {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Atualizar usuarios_app (role, status e parceiro)
            const { error: usuarioAppError } = await supabase
                .from("usuarios_app")
                .update({
                    role,
                    status,
                    parceiro_id: parceiroId === "none" ? null : parceiroId,
                })
                .eq("auth_id", user.auth_id);

            if (usuarioAppError) throw usuarioAppError;

            // 2. Se for titular, atualizar dados pessoais
            if (user.titular_id) {
                let fotoUrl = fotoAtual;

                // Upload de nova foto
                if (fotoFile) {
                    const fileName = `${user.auth_id}-${Date.now()}.${fotoFile.name.split(".").pop()}`;
                    const { error: uploadError } = await supabase.storage
                        .from("titulares")
                        .upload(fileName, fotoFile);

                    if (!uploadError) {
                        const { data: urlData } = supabase.storage
                            .from("titulares")
                            .getPublicUrl(fileName);
                        fotoUrl = urlData.publicUrl;
                    }
                }

                const { error: titularError } = await supabase
                    .from("titulares")
                    .update({
                        nome,
                        cpf: cpf.replace(/\D/g, ""),
                        telefone,
                        data_nascimento: dataNascimento,
                        email,
                        imagem_url: fotoUrl,
                    })
                    .eq("id", user.titular_id);

                if (titularError) throw titularError;

                // 3. Atualizar módulos
                await supabase.from("titular_modulos").delete().eq("titular_id", user.titular_id);

                const { data: modulos } = await supabase.from("modulos").select("id, nome");

                if (modulos) {
                    const modulosParaHabilitar = [];

                    if (moduloLegado) {
                        const legado = modulos.find((m) => m.nome === "Legado");
                        if (legado) modulosParaHabilitar.push({ titular_id: user.titular_id, modulo_id: legado.id });
                    }

                    if (moduloIdoso) {
                        const idoso = modulos.find((m) => m.nome === "Cuidado ao Idoso");
                        if (idoso) modulosParaHabilitar.push({ titular_id: user.titular_id, modulo_id: idoso.id, habilitado: true });
                    }

                    if (moduloPaliativo) {
                        const paliativo = modulos.find((m) => m.nome === "Cuidados Paliativos");
                        if (paliativo) modulosParaHabilitar.push({ titular_id: user.titular_id, modulo_id: paliativo.id });
                    }

                    if (modulosParaHabilitar.length > 0) {
                        await supabase.from("titular_modulos").insert(modulosParaHabilitar);
                    }
                }
            }

            toast({
                title: "Usuário atualizado",
                description: "As alterações foram salvas com sucesso.",
            });

            refresh();
            onClose();
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar usuário",
                description: error.message ?? "Tente novamente em alguns instantes.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    async function alterarSenha() {
        if (!user?.auth_id) {
            toast({
                title: "Erro",
                description: "Usuário não encontrado.",
                variant: "destructive",
            });
            return;
        }

        if (!novaSenha || novaSenha.length < 6) {
            toast({
                title: "Senha inválida",
                description: "A senha deve ter no mínimo 6 caracteres.",
                variant: "destructive",
            });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            toast({
                title: "As senhas não coincidem",
                description: "Verifique os campos e tente novamente.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.rpc("alterar_senha_usuario", {
                user_id: user.auth_id,
                nova_senha: novaSenha,
            });

            if (error) throw error;

            if (data?.success) {
                toast({
                    title: "Senha alterada",
                    description: `A senha de ${user.nome} foi atualizada com sucesso.`,
                });
                setShowPasswordDialog(false);
                setNovaSenha("");
                setConfirmarSenha("");
            } else {
                toast({
                    title: "Não foi possível alterar a senha",
                    description: data?.message || "Tente novamente mais tarde.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Erro ao alterar senha",
                description: error.message ?? "Tente novamente mais tarde.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    async function inativarUsuario() {
        if (!user) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from("usuarios_app")
                .update({ status: "inativo" })
                .eq("auth_id", user.auth_id);

            if (error) throw error;

            toast({
                title: "Usuário inativado",
                description: "O usuário foi inativado com sucesso. Os dados foram preservados.",
            });

            setShowDeleteDialog(false);
            refresh();
            onClose();
        } catch (error: any) {
            toast({
                title: "Erro ao inativar usuário",
                description: error.message ?? "Tente novamente em alguns instantes.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    function getStatusBadge(statusValue: string) {
        const badges: any = {
            ativo: { label: "✅ Ativo", color: "bg-green-100 text-green-800" },
            inativo: { label: "⚫ Inativo", color: "bg-gray-100 text-gray-800" },
            inadimplente: { label: "⚠️ Inadimplente", color: "bg-yellow-100 text-yellow-800" },
            vitalicio: { label: "⭐ Vitalício", color: "bg-purple-100 text-purple-800" },
        };
        return badges[statusValue] || badges.ativo;
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Gerencie os dados, papel, status, vínculo e ações deste usuário.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {user?.titular_id && (
                            <>
                                {/* Foto de Perfil */}
                                <div className="flex flex-col items-center gap-3">
                                    <Label>Foto de Perfil</Label>

                                    {fotoPreview ? (
                                        <div className="relative">
                                            <img
                                                src={fotoPreview}
                                                alt="Preview"
                                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                            />
                                            {fotoFile && (
                                                <button
                                                    type="button"
                                                    onClick={removerFoto}
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <label className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition">
                                            <Upload className="h-8 w-8 text-gray-400" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    {!fotoFile && fotoPreview && (
                                        <label className="text-sm text-blue-600 cursor-pointer hover:underline">
                                            Alterar foto
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                <Separator />

                                {/* Nome */}
                                <div>
                                    <Label>Nome Completo</Label>
                                    <Input
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                        placeholder="Nome completo"
                                    />
                                </div>

                                {/* CPF */}
                                <div>
                                    <Label>CPF</Label>
                                    <Input
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                        placeholder="000.000.000-00"
                                        maxLength={14}
                                    />
                                </div>

                                {/* Telefone */}
                                <div>
                                    <Label>Telefone</Label>
                                    <Input
                                        value={telefone}
                                        onChange={(e) => setTelefone(e.target.value)}
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>

                                {/* Data de Nascimento */}
                                <div>
                                    <Label>Data de Nascimento</Label>
                                    <Input
                                        type="date"
                                        value={dataNascimento}
                                        onChange={(e) => setDataNascimento(e.target.value)}
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <Label>E-mail</Label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <Separator />

                                {/* Módulos */}
                                <div>
                                    <Label className="mb-3 block">Módulos Habilitados</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="legado"
                                                checked={moduloLegado}
                                                onCheckedChange={(checked) => setModuloLegado(!!checked)}
                                            />
                                            <label htmlFor="legado" className="text-sm cursor-pointer">
                                                📖 Legado
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="idoso"
                                                checked={moduloIdoso}
                                                onCheckedChange={(checked) => setModuloIdoso(!!checked)}
                                            />
                                            <label htmlFor="idoso" className="text-sm cursor-pointer">
                                                👴 Cuidados ao Idoso
                                            </label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="paliativo"
                                                checked={moduloPaliativo}
                                                onCheckedChange={(checked) => setModuloPaliativo(!!checked)}
                                            />
                                            <label htmlFor="paliativo" className="text-sm cursor-pointer">
                                                🕊️ Cuidados Paliativos
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <Separator />
                            </>
                        )}

                        {/* Role */}
                        <div>
                            <Label>Role (Papel)</Label>
                            <Select value={role} onValueChange={setRole} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha um papel" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin_master">🔑 Admin Master</SelectItem>
                                    <SelectItem value="parceiro_admin">🏢 Parceiro Admin</SelectItem>
                                    <SelectItem value="titular">👤 Titular</SelectItem>
                                    <SelectItem value="familiar">👨‍👩‍👧 Familiar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div>
                            <Label>Status do Usuário</Label>
                            <Select value={status} onValueChange={setStatus} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Escolha um status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ativo">✅ Ativo</SelectItem>
                                    <SelectItem value="inativo">⚫ Inativo</SelectItem>
                                    <SelectItem value="inadimplente">⚠️ Inadimplente</SelectItem>
                                    <SelectItem value="vitalicio">⭐ Vitalício</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500 mt-1">
                                {status === "ativo" && "Usuário com acesso total ao sistema"}
                                {status === "inativo" && "Usuário bloqueado, mas dados preservados"}
                                {status === "inadimplente" && "Acesso suspenso por falta de pagamento"}
                                {status === "vitalicio" && "Acesso permanente e irrestrito"}
                            </p>
                        </div>

                        {/* Parceiro */}
                        <div>
                            <Label>Parceiro (opcional)</Label>
                            <Select value={parceiroId} onValueChange={setParceiroId} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um parceiro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {parceiros.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full" onClick={salvar} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>

                        <Separator />

                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-gray-700">Ações Avançadas</p>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setShowPasswordDialog(true)}
                                disabled={loading}
                            >
                                <KeyRound className="h-4 w-4 mr-2" />
                                Alterar Senha
                            </Button>

                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => setShowDeleteDialog(true)}
                                disabled={loading}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Inativar Usuário
                            </Button>
                        </div>

                        <Separator />

                        {/* 🔥 NOVA SEÇÃO: LOGS DE LOGIN */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                📜 Logs de Login
                            </h3>

                            {loadingLogs ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                    <span className="ml-2 text-sm text-gray-500">Carregando logs...</span>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed">
                                    <p className="text-sm text-gray-500">📭 Nenhum login registrado ainda.</p>
                                </div>
                            ) : (
                                <div className="max-h-72 overflow-y-auto border rounded-lg bg-gray-50">
                                    <div className="divide-y">
                                        {logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="p-4 bg-white hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium flex items-center gap-2">
                                                            {log.sucesso ? (
                                                                <span className="text-green-600">✅ Login bem-sucedido</span>
                                                            ) : (
                                                                <span className="text-red-600">❌ Falha no login</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            🕒 {new Date(log.login_at).toLocaleString("pt-BR", {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                second: "2-digit",
                                                            })}
                                                        </p>
                                                        {log.ip && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                🌐 IP: <span className="font-mono">{log.ip}</span>
                                                            </p>
                                                        )}
                                                        {log.user_agent && (
                                                            <p className="text-xs text-gray-500 mt-1 truncate max-w-md">
                                                                💻 {log.user_agent}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <p className="text-xs text-gray-500 mt-2 text-center">
                                Exibindo os últimos 50 logins registrados
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de Alteração de Senha */}
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle>🔐 Alterar Senha</DialogTitle>
                        <DialogDescription>
                            Defina uma nova senha para <strong>{user?.nome}</strong>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="Mínimo 6 caracteres"
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <Label>Confirmar Nova Senha</Label>
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="Digite novamente"
                            />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => {
                                    setShowPasswordDialog(false);
                                    setNovaSenha("");
                                    setConfirmarSenha("");
                                }}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button className="flex-1" onClick={alterarSenha} disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Alterando...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound className="h-4 w-4 mr-2" />
                                        Confirmar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog de Confirmação de Inativação */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Inativar este usuário?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                            <p>
                                O usuário <strong>{user?.nome}</strong> ({user?.email}) será{" "}
                                <strong className="text-yellow-600">inativado</strong>.
                            </p>
                            <p className="text-green-600 font-semibold">
                                ✅ Todos os dados serão preservados:
                            </p>
                            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                                <li>Recordações</li>
                                <li>Diários</li>
                                <li>Exercícios</li>
                                <li>Dependentes vinculados</li>
                                <li>Módulos habilitados</li>
                                <li>Perfil completo</li>
                            </ul>
                            <p className="text-sm text-gray-600 mt-3">
                                O usuário não poderá fazer login, mas você pode reativá-lo a qualquer momento.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={inativarUsuario}
                            disabled={loading}
                            className="bg-yellow-600 hover:bg-yellow-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Inativando...
                                </>
                            ) : (
                                "Sim, inativar usuário"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}