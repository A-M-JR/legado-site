// src/admin/parceiro/EditTitularDialog.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { maskCPF, maskTelefone } from "@/lib/masks";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Loader2, Upload, X, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
    open: boolean;
    onClose: () => void;
    titularId: string | null;
    parceiroId: string;
    refresh: () => void;
}

export default function EditTitularDialog({ open, onClose, titularId, parceiroId, refresh }: Props) {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // form
    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [telefone, setTelefone] = useState("");
    const [dataNascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<string | null>(null);

    // foto
    const [fotoFile, setFotoFile] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string | null>(null);
    const [existingImagemUrl, setExistingImagemUrl] = useState<string | null>(null);

    useEffect(() => {
        if (open && titularId) {
            loadTitular();
        } else {
            limpar();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, titularId]);

    async function loadTitular() {
        setLoadingData(true);
        try {
            const { data: tData, error } = await supabase
                .from("titulares")
                .select("id, nome, email, cpf, telefone, data_nascimento, imagem_url")
                .eq("id", titularId)
                .single();

            if (error) throw error;

            setNome(tData.nome || "");
            setCpf(maskCPF(tData.cpf || ""));
            setTelefone(maskTelefone(tData.telefone || ""));
            setDataNascimento(tData.data_nascimento || "");
            setEmail(tData.email || "");
            setExistingImagemUrl(tData.imagem_url || null);

            // load status from usuarios_app
            const { data: ua } = await supabase
                .from("usuarios_app")
                .select("status")
                .eq("titular_id", titularId)
                .single();

            setStatus(ua?.status || null);
            setFotoPreview(tData.imagem_url || null);
        } catch (err: any) {
            console.error("Erro ao carregar titular:", err);
            toast({ title: "Erro", description: "Não foi possível carregar os dados do titular", variant: "destructive" });
        } finally {
            setLoadingData(false);
        }
    }

    function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setFotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    function removerFoto() {
        setFotoFile(null);
        setFotoPreview(null);
    }

    function validar() {
        if (!nome.trim()) { toast({ title: "Nome obrigatório", description: "Preencha o nome.", variant: "destructive" }); return false; }
        if (!cpf.trim() || cpf.replace(/\D/g, "").length !== 11) { toast({ title: "CPF inválido", description: "CPF deve ter 11 dígitos.", variant: "destructive" }); return false; }
        if (!email.trim() || !email.includes("@")) { toast({ title: "E-mail inválido", description: "Informe um e-mail válido.", variant: "destructive" }); return false; }
        return true;
    }

    async function salvar() {
        if (!titularId) return;
        if (!validar()) return;
        setLoading(true);

        try {
            // upload foto se houver mudança
            let imagemUrl = existingImagemUrl;
            if (fotoFile) {
                const fileExt = fotoFile.name.split(".").pop();
                const fileName = `${titularId}-${Date.now()}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from("titulares").upload(fileName, fotoFile, { upsert: true });
                if (!uploadError) {
                    const { data: urlData } = supabase.storage.from("titulares").getPublicUrl(fileName);
                    imagemUrl = urlData.publicUrl;
                } else {
                    console.warn("Erro upload foto:", uploadError);
                }
            }

            // update titulares
            const { error: errTit } = await supabase
                .from("titulares")
                .update({
                    nome,
                    cpf: cpf.replace(/\D/g, ""),
                    telefone: telefone.replace(/\D/g, ""),
                    data_nascimento: dataNascimento,
                    email,
                    imagem_url: imagemUrl,
                })
                .eq("id", titularId);

            if (errTit) throw errTit;

            // update usuarios_app.status (opcional: permitir ativar/desativar)
            if (typeof status === "string") {
                const { data: uaData, error: uaErr } = await supabase
                    .from("usuarios_app")
                    .select("id")
                    .eq("titular_id", titularId)
                    .single();

                if (!uaErr && uaData) {
                    await supabase.from("usuarios_app").update({ status }).eq("id", uaData.id);
                }
            }

            toast({ title: "Sucesso", description: "Titular atualizado." });
            refresh();
            onClose();
        } catch (err: any) {
            console.error("Erro ao salvar titular:", err);
            toast({ title: "Erro", description: err.message || "Tente novamente", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }

    function limpar() {
        setNome(""); setCpf(""); setTelefone(""); setDataNascimento(""); setEmail(""); setFotoFile(null); setFotoPreview(null); setExistingImagemUrl(null); setStatus(null);
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>

                {loadingData ? (
                    <div className="py-8 text-center">Carregando...</div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-col items-center gap-3">
                            <Label>Foto de Perfil</Label>
                            {fotoPreview ? (
                                <div className="relative">
                                    <img src={fotoPreview} alt="preview" className="w-28 h-28 rounded-full object-cover" />
                                    <button onClick={removerFoto} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer">
                                    <Upload className="h-6 w-6 text-gray-400" />
                                    <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
                                </label>
                            )}
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Nome</Label>
                                <Input value={nome} onChange={(e) => setNome(e.target.value)} />
                            </div>
                            <div>
                                <Label>CPF</Label>
                                <Input value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" maxLength={14} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Telefone</Label>
                                <Input value={telefone} onChange={(e) => setTelefone(maskTelefone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} />
                            </div>
                            <div>
                                <Label>Data de Nascimento</Label>
                                <Input type="date" value={dataNascimento ?? ""} onChange={(e) => setDataNascimento(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <Label>E-mail</Label>
                            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <div>
                            <Label>Status</Label>
                            <select value={status ?? "ativo"} onChange={(e) => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="suspenso">Suspenso</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => { limpar(); onClose(); }} disabled={loading}>Cancelar</Button>
                            <Button onClick={salvar} className="bg-emerald-600" disabled={loading}>
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Salvar
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}