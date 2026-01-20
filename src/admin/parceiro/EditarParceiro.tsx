import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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
import { Loader2, Upload, X, FileText } from "lucide-react";

interface EditarParceiroProps {
    open: boolean;
    onClose: () => void;
    parceiro: any;
    onSuccess: () => void;
}

export default function EditarParceiro({
    open,
    onClose,
    parceiro,
    onSuccess,
}: EditarParceiroProps) {
    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("clinica");
    const [cnpj, setCnpj] = useState("");
    const [status, setStatus] = useState("ativo");
    const [observacoes, setObservacoes] = useState("");

    // LOGO
    const [logoAtual, setLogoAtual] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    // CONTRATO
    const [contratoAtual, setContratoAtual] = useState<string | null>(null);
    const [contratoFile, setContratoFile] = useState<File | null>(null);
    const [contratoPreview, setContratoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (parceiro) {
            setNome(parceiro.nome || "");
            setTipo(parceiro.tipo || "clinica");
            setCnpj(parceiro.cnpj || "");
            setStatus(parceiro.status || "ativo");
            setObservacoes(parceiro.observacoes || "");
            setLogoAtual(parceiro.logo_url || null);
            setContratoAtual(parceiro.contrato_url || null);
        }
    }, [parceiro]);

    function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    }

    function removeLogoNovo() {
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

    function removeContratoNovo() {
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
            let logoUrl = logoAtual;
            let contratoUrl = contratoAtual;
            let dataContrato = parceiro.data_contrato as string | null;

            // Upload nova LOGO
            if (logoFile) {
                const ext = logoFile.name.split(".").pop();
                const fileName = `logo-${parceiro.id}-${Date.now()}.${ext}`;
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

            // Upload novo CONTRATO
            if (contratoFile) {
                const ext = contratoFile.name.split(".").pop();
                const fileName = `contrato-${parceiro.id}-${Date.now()}.${ext}`;
                const { error: uploadError } = await supabase.storage
                    .from("parceiros-contratos")
                    .upload(fileName, contratoFile);

                if (!uploadError) {
                    const { data } = supabase.storage
                        .from("parceiros-contratos")
                        .getPublicUrl(fileName);
                    contratoUrl = data.publicUrl;
                    dataContrato = new Date().toISOString();
                }
            }

            const { error } = await supabase
                .from("parceiros")
                .update({
                    nome,
                    tipo,
                    cnpj: cnpj.trim() || null,
                    status,
                    observacoes: observacoes.trim() || null,
                    logo_url: logoUrl,
                    contrato_url: contratoUrl,
                    data_contrato: dataContrato,
                    ativo: status === "ativo",
                })
                .eq("id", parceiro.id);

            if (error) throw error;

            toast({
                title: "Parceiro atualizado",
                description: `${nome} foi atualizado com sucesso.`,
            });

            onSuccess();
        } catch (err: any) {
            toast({
                title: "Erro ao atualizar parceiro",
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
                    <DialogTitle>Editar Parceiro</DialogTitle>
                    <DialogDescription>
                        Atualize as informações e arquivos do parceiro.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Nome */}
                    <div>
                        <Label>Nome do Parceiro *</Label>
                        <Input
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Nome"
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
                            onChange={(e) => setCnpj(e.target.value)}
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

                    {/* LOGO ATUAL */}
                    <div>
                        <Label>Logo do Parceiro</Label>
                        {logoPreview ? (
                            <div className="space-y-2">
                                <img
                                    src={logoPreview}
                                    alt="Nova logo"
                                    className="h-16 rounded border bg-gray-50 p-2 object-contain"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={removeLogoNovo}
                                >
                                    <X className="mr-1 h-4 w-4" />
                                    Remover nova logo
                                </Button>
                            </div>
                        ) : logoAtual ? (
                            <div className="space-y-2">
                                <img
                                    src={logoAtual}
                                    alt="Logo atual"
                                    className="h-16 rounded border bg-gray-50 p-2 object-contain"
                                />
                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-3 hover:border-gray-400">
                                    <Upload className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Substituir logo
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        ) : (
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:border-gray-400">
                                <Upload className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">
                                    Enviar logo do parceiro
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

                    {/* CONTRATO ATUAL */}
                    <div>
                        <Label>Contrato</Label>
                        {contratoAtual && !contratoFile ? (
                            <div className="space-y-2">
                                <a
                                    href={contratoAtual}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                >
                                    <FileText className="h-4 w-4" />
                                    Ver contrato atual
                                </a>
                                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-3 hover:border-gray-400">
                                    <Upload className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        Substituir contrato
                                    </span>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleContratoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        ) : (
                            <div>
                                {contratoPreview ? (
                                    <div className="flex items-center gap-2 rounded-md border bg-gray-50 p-3">
                                        <span className="flex-1 truncate text-sm">
                                            {contratoPreview}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={removeContratoNovo}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-3 hover:border-gray-400">
                                        <Upload className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">
                                            Enviar novo contrato (opcional)
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
                        )}
                    </div>

                    {/* Observações */}
                    <div>
                        <Label>Observações</Label>
                        <Textarea
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={3}
                            placeholder="Informações adicionais..."
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
                                    Salvando...
                                </>
                            ) : (
                                "Salvar alterações"
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}