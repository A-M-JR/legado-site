import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Megaphone, Send, Camera, Loader2, Power, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { toast } from "@/hooks/use-toast";
import { uploadImagem } from "@/lib/uploadImage";
import { MP_STORAGE_BUCKET } from "@/modules/medicina-preventiva/lib/storage";
import {
    campanhasService,
    type Campanha,
    type PacienteWhatsapp,
} from "../services/campanhasService";

const CAMPANHAS_FOLDER = "mp/campanhas";

const FORM_INICIAL = { titulo: "", texto: "", link: "", mediaUrl: "" };

export default function CampanhasPage() {
    const [campanhas, setCampanhas] = useState<Campanha[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviandoFoto, setEnviandoFoto] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Disparo por canais (sino/mensagem)
    const [disparoAlvo, setDisparoAlvo] = useState<Campanha | null>(null);
    const [canalSino, setCanalSino] = useState(true);
    const [canalMensagem, setCanalMensagem] = useState(true);
    const [disparando, setDisparando] = useState(false);

    // WhatsApp
    const [wppAlvo, setWppAlvo] = useState<Campanha | null>(null);
    const [wppPacientes, setWppPacientes] = useState<PacienteWhatsapp[]>([]);
    const [wppLoading, setWppLoading] = useState(false);

    async function carregar() {
        setLoading(true);
        setCampanhas(await campanhasService.list());
        setLoading(false);
    }

    useEffect(() => {
        carregar();
    }, []);

    async function handleFoto(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        setEnviandoFoto(true);
        const url = await uploadImagem({ file, folder: CAMPANHAS_FOLDER, bucket: MP_STORAGE_BUCKET });
        setEnviandoFoto(false);
        if (!url) {
            toast({ title: "Erro no upload", variant: "destructive" });
            return;
        }
        setForm((f) => ({ ...f, mediaUrl: url }));
    }

    async function criar(e: React.FormEvent) {
        e.preventDefault();
        if (!form.titulo.trim() || salvando || enviandoFoto) return;
        setSalvando(true);
        try {
            await campanhasService.create({
                titulo: form.titulo.trim(),
                texto: form.texto.trim(),
                link: form.link.trim() || null,
                mediaUrl: form.mediaUrl || null,
                mediaTipo: form.mediaUrl ? "foto" : null,
                ativo: true,
            });
            setForm(FORM_INICIAL);
            toast({ title: "Campanha criada", description: "O banner já aparece para os pacientes." });
            carregar();
        } catch (err) {
            toast({
                title: "Erro ao criar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setSalvando(false);
        }
    }

    async function alternarAtivo(c: Campanha) {
        try {
            await campanhasService.setAtivo(c.id, !c.ativo);
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function remover(c: Campanha) {
        if (!window.confirm(`Remover a campanha "${c.titulo}"?`)) return;
        try {
            await campanhasService.remove(c.id);
            carregar();
        } catch (err) {
            toast({
                title: "Erro",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        }
    }

    async function confirmarDisparo() {
        if (!disparoAlvo || disparando) return;
        const canais: string[] = [];
        if (canalSino) canais.push("sino");
        if (canalMensagem) canais.push("mensagem");
        if (canais.length === 0) {
            toast({ title: "Escolha ao menos um canal", variant: "destructive" });
            return;
        }
        setDisparando(true);
        try {
            const total = await campanhasService.disparar(disparoAlvo.id, canais);
            toast({
                title: "Campanha enviada",
                description: `Enviado para ${total} paciente${total === 1 ? "" : "s"}.`,
            });
            setDisparoAlvo(null);
        } catch (err) {
            toast({
                title: "Erro ao enviar",
                description: err instanceof Error ? err.message : "Tente novamente.",
                variant: "destructive",
            });
        } finally {
            setDisparando(false);
        }
    }

    async function abrirWhatsapp(c: Campanha) {
        setWppAlvo(c);
        setWppLoading(true);
        setWppPacientes(await campanhasService.pacientesComTelefone());
        setWppLoading(false);
    }

    function wppLink(p: PacienteWhatsapp, c: Campanha): string {
        const tel = p.telefone.replace(/\D/g, "");
        const numero = tel.length <= 11 ? `55${tel}` : tel;
        const texto = [c.titulo, c.texto, c.link].filter(Boolean).join("\n\n");
        return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-[#255f4f]">Campanhas e folders</h1>
                <p className="text-sm text-[#6b8c7d]">
                    Envie um folder de uma ação para todos os pacientes: banner no app, aviso no
                    sino, mensagem e WhatsApp.
                </p>
            </div>

            <Card>
                <CardContent className="p-5">
                    <form onSubmit={criar} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Título</label>
                            <Input
                                value={form.titulo}
                                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                                placeholder="Ex.: Campanha de vacinação da gripe"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">Texto</label>
                            <Textarea
                                value={form.texto}
                                onChange={(e) => setForm((f) => ({ ...f, texto: e.target.value }))}
                                rows={3}
                                placeholder="Detalhes da ação, datas, como participar..."
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Link (opcional)
                            </label>
                            <Input
                                value={form.link}
                                onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-[#4f665a]">
                                Folder (imagem)
                            </label>
                            <div className="flex items-center gap-3">
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-[#c2e1d4] text-sm text-[#5ba58c] font-semibold">
                                    {enviandoFoto ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Camera className="h-4 w-4" />
                                    )}
                                    {enviandoFoto ? "Enviando..." : "Escolher imagem"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFoto}
                                    />
                                </label>
                                {form.mediaUrl && (
                                    <img
                                        src={form.mediaUrl}
                                        alt="Prévia do folder"
                                        className="h-14 w-14 rounded-xl object-cover border border-[#e6efe9]"
                                    />
                                )}
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={salvando || enviandoFoto}
                            className="bg-[#5ba58c] text-white"
                        >
                            {salvando ? "Criando..." : "Criar campanha"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {loading ? (
                <div className="py-16 flex justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                </div>
            ) : campanhas.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center text-sm text-[#6b8c7d]">
                        Nenhuma campanha criada ainda.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-3">
                    {campanhas.map((c) => (
                        <Card key={c.id} className={c.ativo ? "border-[#c2e1d4]" : ""}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    {c.mediaUrl ? (
                                        <img
                                            src={c.mediaUrl}
                                            alt={c.titulo}
                                            className="h-16 w-16 rounded-xl object-cover border border-[#e6efe9] shrink-0"
                                        />
                                    ) : (
                                        <div className="shrink-0 p-3 rounded-xl bg-[#e3f1eb] text-[#5ba58c]">
                                            <Megaphone className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-[#255f4f]">{c.titulo}</p>
                                            <span
                                                className={
                                                    "text-[10px] font-bold px-2 py-0.5 rounded-full " +
                                                    (c.ativo
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-100 text-slate-500")
                                                }
                                            >
                                                {c.ativo ? "Banner ativo" : "Inativa"}
                                            </span>
                                        </div>
                                        {c.texto && (
                                            <p className="text-sm text-[#4f665a] mt-1 line-clamp-2">
                                                {c.texto}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCanalSino(true);
                                                    setCanalMensagem(true);
                                                    setDisparoAlvo(c);
                                                }}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-[#5ba58c] hover:underline"
                                            >
                                                <Send className="h-3.5 w-3.5" /> Disparar (sino/mensagem)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => abrirWhatsapp(c)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] hover:underline"
                                            >
                                                <FaWhatsapp className="h-3.5 w-3.5" /> WhatsApp
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => alternarAtivo(c)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:underline"
                                            >
                                                <Power className="h-3.5 w-3.5" />
                                                {c.ativo ? "Desativar banner" : "Ativar banner"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remover(c)}
                                                className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:underline"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Disparo sino/mensagem */}
            <Dialog open={!!disparoAlvo} onOpenChange={(v) => !v && setDisparoAlvo(null)}>
                <DialogContent className="sm:max-w-[440px]">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Disparar campanha</DialogTitle>
                        <DialogDescription>
                            Enviar "{disparoAlvo?.titulo}" para todos os pacientes.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                checked={canalSino}
                                onCheckedChange={(v) => setCanalSino(v === true)}
                            />
                            <span className="text-sm text-[#255f4f]">Aviso no sino do app</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                checked={canalMensagem}
                                onCheckedChange={(v) => setCanalMensagem(v === true)}
                            />
                            <span className="text-sm text-[#255f4f]">
                                Mensagem no mural do paciente
                            </span>
                        </label>
                        <p className="text-xs text-[#9db4aa]">
                            O banner no app já fica visível enquanto a campanha estiver ativa.
                        </p>
                        <div className="flex gap-2 pt-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setDisparoAlvo(null)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-[#5ba58c] text-white"
                                onClick={confirmarDisparo}
                                disabled={disparando}
                            >
                                {disparando ? "Enviando..." : "Enviar"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* WhatsApp */}
            <Dialog open={!!wppAlvo} onOpenChange={(v) => !v && setWppAlvo(null)}>
                <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[#255f4f]">Enviar por WhatsApp</DialogTitle>
                        <DialogDescription>
                            O envio em massa por WhatsApp não é automático. Abra a conversa de cada
                            paciente com o texto já preenchido.
                        </DialogDescription>
                    </DialogHeader>
                    {wppLoading ? (
                        <div className="py-10 flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-[#5ba58c]" />
                        </div>
                    ) : wppPacientes.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#6b8c7d]">
                            Nenhum paciente com telefone cadastrado.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {wppAlvo &&
                                wppPacientes.map((p) => (
                                    <a
                                        key={p.titularId}
                                        href={wppLink(p, wppAlvo)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border border-[#e6efe9] hover:bg-[#f4fbf8]"
                                    >
                                        <span className="text-sm text-[#255f4f] truncate">{p.nome}</span>
                                        <span className="flex items-center gap-1.5 text-xs font-semibold text-[#25D366] shrink-0">
                                            <FaWhatsapp className="h-4 w-4" /> Abrir
                                        </span>
                                    </a>
                                ))}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
