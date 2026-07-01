import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { maskCPF, maskTelefone } from "@/lib/masks";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface NovoTitularDialogProps {
    open: boolean;
    onClose: () => void;
    refresh: () => void;
}

export default function NovoTitularDialog({ open, onClose, refresh }: NovoTitularDialogProps) {
    const [loading, setLoading] = useState(false);

    // Dados pessoais
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Foto
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    // Parceiro
    const [parceiros, setParceiros] = useState<any[]>([]);
    const [parceiroId, setParceiroId] = useState<string>("none");

    // Módulos
    const [moduloLegado, setModuloLegado] = useState(true);
    const [moduloIdoso, setModuloIdoso] = useState(false);
    const [moduloPaliativo, setModuloPaliativo] = useState(false);

    useEffect(() => {
        if (open) {
            loadParceiros();
        }
    }, [open]);

    async function loadParceiros() {
        const { data } = await supabase
            .from("parceiros")
            .select("id, nome")
            .eq("ativo", true)
            .order("nome");
        if (data) setParceiros(data);
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
        setFotoPreview(null);
    }

    function validarCampos() {
        if (!nome.trim()) {
            toast({
                title: "Nome obrigatório",
                description: "Preencha o nome do titular.",
                variant: "destructive",
            });
            return false;
        }

        if (!cpf.trim() || cpf.replace(/\D/g, "").length !== 11) {
            toast({
                title: "CPF inválido",
                description: "O CPF deve ter 11 dígitos.",
                variant: "destructive",
            });
            return false;
        }

        if (!telefone.trim()) {
            toast({
                title: "Telefone obrigatório",
                description: "Preencha o telefone do titular.",
                variant: "destructive",
            });
            return false;
        }

        if (!dataNascimento) {
            toast({
                title: "Data de nascimento obrigatória",
                description: "Preencha a data de nascimento.",
                variant: "destructive",
            });
            return false;
        }

        if (!email.trim() || !email.includes("@")) {
            toast({
                title: "E-mail inválido",
                description: "Preencha um e-mail válido.",
                variant: "destructive",
            });
            return false;
        }

        if (!senha || senha.length < 6) {
            toast({
                title: "Senha inválida",
                description: "A senha deve ter no mínimo 6 caracteres.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    }

    function traduzirErro(mensagem: string) {
        const erros: Record<string, string> = {
            "User already registered":
                "Este e-mail já existe na autenticação. Use outro e-mail ou remova o cadastro incompleto no painel do Supabase.",
            "A user with this email address has already been registered":
                "Este e-mail já existe na autenticação. Use outro e-mail ou remova o cadastro incompleto no painel do Supabase.",
        };
        return erros[mensagem] ?? mensagem;
    }

    async function verificarDuplicados() {
        const emailNorm = email.trim().toLowerCase();
        const cpfLimpo = cpf.replace(/\D/g, "");

        const { data: porEmail } = await supabase
            .from("titulares")
            .select("id")
            .ilike("email", emailNorm)
            .maybeSingle();

        if (porEmail) {
            toast({
                title: "E-mail já cadastrado",
                description: "Já existe um titular com este e-mail.",
                variant: "destructive",
            });
            return false;
        }

        const { data: porCpf } = await supabase
            .from("titulares")
            .select("id")
            .eq("cpf", cpfLimpo)
            .maybeSingle();

        if (porCpf) {
            toast({
                title: "CPF já cadastrado",
                description: "Já existe um titular com este CPF.",
                variant: "destructive",
            });
            return false;
        }

        return true;
    }

    async function finalizarCadastro(authId: string) {
            let fotoUrl = null;
            if (fotoFile) {
                const fileName = `${authId}-${Date.now()}.${fotoFile.name.split(".").pop()}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from("titulares")
                    .upload(fileName, fotoFile);

                if (uploadError) {
                    console.error("Erro ao fazer upload da foto:", uploadError);
                } else {
                    const { data: urlData } = supabase.storage
                        .from("titulares")
                        .getPublicUrl(fileName);
                    fotoUrl = urlData.publicUrl;
                }
            }

            // 3. Criar titular
            const { data: titularData, error: titularError } = await supabase
                .from("titulares")
                .insert({
                    auth_id: authId,
                    nome,
                    cpf: cpf.replace(/\D/g, ""),
                    telefone: telefone.replace(/\D/g, ""),
                    data_nascimento: dataNascimento,
                    email,
                    imagem_url: fotoUrl,
                })
                .select("id")
                .single();

            if (titularError) throw titularError;

            const titularId = titularData.id;

            // 4. Criar entrada em usuarios_app
            const { error: usuarioAppError } = await supabase.from("usuarios_app").insert({
                auth_id: authId,
                role: "titular",
                titular_id: titularId,
                parceiro_id: parceiroId === "none" ? null : parceiroId,
                status: "ativo",
            });

            if (usuarioAppError) throw usuarioAppError;

            // 5. Habilitar módulos selecionados
            const { data: modulos } = await supabase.from("modulos").select("id, nome");

            if (modulos) {
                const modulosParaHabilitar = [];

                if (moduloLegado) {
                    const legado = modulos.find((m) => m.nome === "Legado");
                    if (legado) modulosParaHabilitar.push({ titular_id: titularId, modulo_id: legado.id, habilitado: true });
                }

                if (moduloIdoso) {
                    const idoso = modulos.find((m) => m.nome === "Cuidados ao Idoso");
                    if (idoso) modulosParaHabilitar.push({ titular_id: titularId, modulo_id: idoso.id, habilitado: true });
                }

                if (moduloPaliativo) {
                    const paliativo = modulos.find((m) => m.nome === "Cuidados Paliativos");
                    if (paliativo) modulosParaHabilitar.push({ titular_id: titularId, modulo_id: paliativo.id, habilitado: true });
                }

                if (modulosParaHabilitar.length > 0) {
                    await supabase.from("titular_modulos").insert(modulosParaHabilitar);
                }
            }

            toast({
                title: "Titular criado com sucesso!",
                description: `${nome} foi cadastrado e já pode acessar o sistema.`,
            });

            limparFormulario();
            refresh();
            onClose();
    }

    async function criarTitular() {
        if (!validarCampos()) return;

        setLoading(true);

        const { data: { session: adminSession } } = await supabase.auth.getSession();

        try {
            if (!(await verificarDuplicados())) return;

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email.trim(),
                password: senha,
            });

            if (authError) throw new Error(traduzirErro(authError.message));
            if (!authData.user) throw new Error("Erro ao criar usuário na autenticação");

            await finalizarCadastro(authData.user.id);
        } catch (error: any) {
            toast({
                title: "Erro ao criar titular",
                description: error.message ?? "Tente novamente em alguns instantes.",
                variant: "destructive",
            });
        } finally {
            if (adminSession) {
                await supabase.auth.setSession({
                    access_token: adminSession.access_token,
                    refresh_token: adminSession.refresh_token,
                });
            }
            setLoading(false);
        }
    }

    function limparFormulario() {
        setNome("");
        setCpf("");
        setTelefone("");
        setDataNascimento("");
        setEmail("");
        setSenha("");
        setFotoFile(null);
        setFotoPreview(null);
        setParceiroId("none");
        setModuloLegado(true);
        setModuloIdoso(false);
        setModuloPaliativo(false);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cadastrar Novo Titular</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar um novo titular no sistema.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Foto de Perfil */}
                    <div className="flex flex-col items-center gap-3">
                        <Label>Foto de Perfil (opcional)</Label>

                        {fotoPreview ? (
                            <div className="relative">
                                <img
                                    src={fotoPreview}
                                    alt="Preview"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={removerFoto}
                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
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
                    </div>

                    <Separator />

                    {/* Nome */}
                    <div>
                        <Label>Nome Completo *</Label>
                        <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: João da Silva"
                        />
                    </div>

                    {/* CPF */}
                    <div>
                        <Label>CPF *</Label>
                        <Input
                            value={cpf}
                            onChange={(e) => setCpf(maskCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            maxLength={14}
                        />
                    </div>

                    {/* Telefone */}
                    <div>
                        <Label>Telefone *</Label>
                        <Input
                            value={telefone}
                            onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                        />
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                        <Label>Data de Nascimento *</Label>
                        <Input
                            type="date"
                            value={dataNascimento}
                            onChange={(e) => setDataNascimento(e.target.value)}
                        />
                    </div>

                    <Separator />

                    {/* E-mail */}
                    <div>
                        <Label>E-mail (login) *</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    {/* Senha */}
                    <div>
                        <Label>Senha *</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
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

                    <Separator />

                    {/* Parceiro */}
                    <div>
                        <Label>Parceiro (opcional)</Label>
                        <Select value={parceiroId} onValueChange={setParceiroId}>
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

                    {/* Botões */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                                limparFormulario();
                                onClose();
                            }}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>

                        <Button className="flex-1" onClick={criarTitular} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                "Criar Titular"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}