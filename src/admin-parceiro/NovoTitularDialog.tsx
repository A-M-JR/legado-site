import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NovoTitularDialogProps {
    open: boolean;
    onClose: () => void;
    refresh: () => void;
    parceiroId: string;
}

export default function NovoTitularDialog({ open, onClose, refresh, parceiroId }: NovoTitularDialogProps) {
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Estados do formulário
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);

    function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    async function criarTitular() {
        if (!nome || !cpf || !email || !senha) {
            toast({ title: "Campos obrigatórios", description: "Preencha os dados básicos.", variant: "destructive" });
            return;
        }

        setLoading(true);

        try {
            // 1. Criar usuário no Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: senha,
                options: { data: { full_name: nome } }
            });

            if (authError) throw authError;
            const authId = authData.user?.id;

            // 2. Upload da Foto
            let fotoUrl = null;
            if (fotoFile && authId) {
                const fileExt = fotoFile.name.split('.').pop();
                const fileName = `${authId}-${Math.random()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage
                    .from("titulares")
                    .upload(fileName, fotoFile);

                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from("titulares").getPublicUrl(fileName);
                    fotoUrl = urlData.publicUrl;
                }
            }

            // 3. Inserir na tabela Titulares
            const { data: titular, error: tError } = await supabase
                .from("titulares")
                .insert([{
                    nome,
                    email,
                    cpf: cpf.replace(/\D/g, ""),
                    telefone,
                    data_nascimento: dataNascimento,
                    imagem_url: fotoUrl,
                    auth_id: authId
                }])
                .select()
                .single();

            if (tError) throw tError;

            // 4. Criar vínculo em usuarios_app
            const { error: uAppError } = await supabase
                .from("usuarios_app")
                .insert([{
                    auth_id: authId,
                    titular_id: titular.id,
                    parceiro_id: parceiroId,
                    role: 'titular',
                    status: 'ativo'
                }]);

            if (uAppError) throw uAppError;

            // 5. HERANÇA AUTOMÁTICA DE MÓDULOS
            // Busca o que o parceiro tem habilitado
            const { data: pModulos } = await supabase
                .from("parceiro_modulos")
                .select("modulo_id")
                .eq("parceiro_id", parceiroId)
                .eq("habilitado", true);

            if (pModulos && pModulos.length > 0) {
                const modulosParaInserir = pModulos.map(m => ({
                    titular_id: titular.id,
                    modulo_id: m.modulo_id,
                    habilitado: true
                }));

                await supabase.from("titular_modulos").insert(modulosParaInserir);
            }

            toast({ title: "Sucesso!", description: "Cliente cadastrado com os módulos do parceiro." });
            limparEFechar();
        } catch (error: any) {
            toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    function limparEFechar() {
        setNome(""); setCpf(""); setTelefone(""); setDataNascimento("");
        setEmail(""); setSenha(""); setFotoFile(null); setFotoPreview(null);
        refresh();
        onClose();
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                    <DialogDescription>Os módulos serão ativados automaticamente conforme seu plano de parceiro.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col items-center gap-2">
                        <Label className="cursor-pointer">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-gray-50">
                                {fotoPreview ? <img src={fotoPreview} className="w-full h-full object-cover" /> : <Upload className="text-gray-400" />}
                            </div>
                            <input type="file" className="hidden" onChange={handleFotoChange} accept="image/*" />
                        </Label>
                        <span className="text-xs text-gray-500">Foto de Perfil</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Nome do paciente" />
                        </div>
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input value={cpf} onChange={e => setCpf(e.target.value)} placeholder="000.000.000-00" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(00) 00000-0000" />
                        </div>
                        <div className="space-y-2">
                            <Label>Data de Nascimento</Label>
                            <Input type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>E-mail de Acesso</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="paciente@email.com" />
                    </div>

                    <div className="space-y-2">
                        <Label>Senha Provisória</Label>
                        <div className="relative">
                            <Input type={showPassword ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-400">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose}>Cancelar</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={criarTitular} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Finalizar Cadastro
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}