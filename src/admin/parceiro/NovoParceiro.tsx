import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { maskCNPJ } from "@/lib/masks";

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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface NovoParceiroProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function NovoParceiro({
    open,
    onClose,
    onSuccess,
}: NovoParceiroProps) {
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("clinica");
    const [cnpj, setCnpj] = useState("");
    const [status, setStatus] = useState("ativo");
    const [observacoes, setObservacoes] = useState("");

    // LOGO
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // CONTRATO (opcional)
    const [contratoFile, setContratoFile] = useState<File | null>(null);
    const [contratoPreview, setContratoPreview] = useState<string | null>(null);

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    function removeLogo() {
        setLogoFile(null);
        setLogoPreview(null);
    }

    function handleContratoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setContratoFile(file);
            setContratoPreview(file.name);
        }
    }

    function removeContrato() {
        setContratoFile(null);
        setContratoPreview(null);
    }

    async function handleSubmit() {
        if (!nome.trim()) {
            toast({
                title: "Nome obrigatório",
                description: "Informe o nome do parceiro.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            let logoUrl: string | null = null;
            let contratoUrl: string | null = null;

            // Upload da LOGO
            if (logoFile) {
                const ext = logoFile.name.split(".").pop();
                const fileName = `logo-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("parceiros-logos")
                    .upload(fileName, logoFile);

                if (!uploadError) {
                    const { data } = supabase.storage
                        .from("parceiros-logos")
                        .getPublicUrl(fileName);
                    logoUrl = data.publicUrl;
                }
            }

            // Upload do CONTRATO (se quiser usar)
            if (contratoFile) {
                const ext = contratoFile.name.split(".").pop();
                const fileName = `contrato-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("parceiros-contratos")
                    .upload(fileName, contratoFile);

                if (!uploadError) {
                    const { data } = supabase.storage
                        .from("parceiros-contratos")
                        .getPublicUrl(fileName);
                    contratoUrl = data.publicUrl;
                }
            }

            const { error } = await supabase.from("parceiros").insert({
                nome,
                tipo,
                cnpj: cnpj.replace(/\D/g, "") || null,
                status,
                observacoes: observacoes.trim() || null,
                logo_url: logoUrl,
                contrato_url: contratoUrl,
                data_contrato: contratoUrl ? new Date().toISOString() : null,
                ativo: status === "ativo",
            });

            if (error) throw error;

            toast({
                title: "Parceiro cadastrado",
                description: `${nome} foi adicionado com sucesso.`,
            });

            // Reset
            setNome("");
            setTipo("clinica");
            setCnpj("");
            setStatus("ativo");
            setObservacoes("");
            removeLogo();
            removeContrato();

            onSuccess();
        } catch (err: any) {
            toast({
                title: "Erro ao cadastrar parceiro",
                description: err.message ?? "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Novo Parceiro</DialogTitle>
                    <DialogDescription>
                        Cadastre uma clínica, funerária, prefeitura ou outro parceiro.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Nome */}
                    <div>
                        <Label>Nome do Parceiro *</Label>
                        <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Clínica São José"
                        />
                    </div>

                    {/* Tipo */}
                    <div>
                        <Label>Tipo</Label>
                        <Select value={tipo} onValueChange={setTipo}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="clinica">Clínica</SelectItem>
                                <SelectItem value="funeraria">Funerária</SelectItem>
                                <SelectItem value="prefeitura">Prefeitura</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* CNPJ */}
                    <div>
                        <Label>CNPJ</Label>
                        <Input
                            value={cnpj}
                            onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                            placeholder="00.000.000/0000-00"
                            maxLength={18}
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <Label>Status</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ativo">🟢 Ativo</SelectItem>
                                <SelectItem value="suspenso">🟡 Suspenso</SelectItem>
                                <SelectItem value="inativo">🔴 Inativo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* LOGO */}
                    <div>
                        <Label>Logo do Parceiro</Label>
                        {logoPreview ? (
                            <div className="space-y-2">
                                <img
                                    src={logoPreview}
                                    alt="Pré-visualização"
                                    className="h-16 rounded border bg-gray-50 p-2 object-contain"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={removeLogo}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Remover logo
                                </Button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:border-gray-400">
                                <Upload className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Clique para enviar a logo
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* CONTRATO (opcional) */}
                    <div>
                        <Label>Contrato (PDF/JPG/PNG) – opcional</Label>
                        {contratoPreview ? (
                            <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
                                <span className="flex-1 truncate text-sm">
                                    {contratoPreview}
                                </span>
                                <button
                                    type="button"
                                    onClick={removeContrato}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:border-gray-400">
                                <Upload className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Clique para enviar o contrato (opcional)
                                </span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleContratoChange}
                                    className="hidden"
                                />
                            </label>
                        )}
                    </div>

                    {/* Observações */}
                    <div>
                        <Label>Observações</Label>
                        <Textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={3}
                            placeholder="Informações adicionais sobre o parceiro..."
                        />
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-1"
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Cadastrando...
                                </>
                            ) : (
                                "Cadastrar Parceiro"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}