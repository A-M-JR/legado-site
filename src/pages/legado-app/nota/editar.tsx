import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ExternalLink, Eye, Loader2, Plus, Save, Share2, Trash2 } from "lucide-react";
import "@/styles/legado-app.css";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { maskTelefone } from "@/lib/masks";
import LegadoNav, { LEGADO_NAV_ESPACO } from "@/components/legado/LegadoNav";
import {
    FRASES_SUGERIDAS,
    TIPOS_CERIMONIA,
    buscarHomenageado,
    buscarNota,
    mensagemWhatsApp,
    numeroWhatsApp,
    type Cerimonia,
    type Homenageado,
} from "@/lib/notaFalecimento";

const MAX_CERIMONIAS = 6;
const MAX_FRASE = 300;

const cerimoniaVazia = (tipo: string): Cerimonia => ({ tipo, local: "", endereco: "", data: "", hora: "" });

export default function EditarNotaFalecimentoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pessoa, setPessoa] = useState<Homenageado | null>(null);
    const [frase, setFrase] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [cerimonias, setCerimonias] = useState<Cerimonia[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [jaSalvouAntes, setJaSalvouAntes] = useState(false);
    // "Salvo" enquanto o formulário for igual ao que acabou de ser gravado; qualquer edição volta para "Salvar alterações".
    const [snapshotSalvo, setSnapshotSalvo] = useState<string | null>(null);
    const salvo = snapshotSalvo !== null && snapshotSalvo === JSON.stringify({ frase, whatsapp, cerimonias });

    useEffect(() => {
        if (!id) return;
        (async () => {
            const [p, nota] = await Promise.all([buscarHomenageado(id), buscarNota(id)]);
            setPessoa(p);
            if (nota) {
                setJaSalvouAntes(true);
                setFrase(nota.frase ?? "");
                setWhatsapp(maskTelefone(nota.whatsapp_flores ?? ""));
                setCerimonias(nota.cerimonias);
            } else {
                setFrase(FRASES_SUGERIDAS[0]);
                setCerimonias([cerimoniaVazia("Velório"), cerimoniaVazia("Sepultamento")]);
            }
            setCarregando(false);
        })();
    }, [id]);

    function atualizarCerimonia(index: number, campo: keyof Cerimonia, valor: string) {
        setCerimonias((prev) => prev.map((c, i) => (i === index ? { ...c, [campo]: valor } : c)));
    }

    async function salvar(): Promise<boolean> {
        if (!id) return false;
        // Blocos sem local são descartados (o usuário pode ter deixado um em branco).
        const preenchidas = cerimonias
            .map((c) => ({ ...c, local: c.local.trim(), endereco: c.endereco?.trim() }))
            .filter((c) => c.local);
        if (whatsapp.trim() && !numeroWhatsApp(whatsapp)) {
            toast({ title: "WhatsApp inválido", description: "Informe DDD + número.", variant: "destructive" });
            return false;
        }

        setSalvando(true);
        const { error } = await supabase.from("notas_falecimento").upsert({
            homenageado_id: id,
            frase: frase.trim() || null,
            whatsapp_flores: whatsapp.trim() || null,
            cerimonias: preenchidas,
            updated_at: new Date().toISOString(),
        });
        setSalvando(false);

        if (error) {
            toast({ title: "Não foi possível salvar", description: "Tente novamente em instantes.", variant: "destructive" });
            return false;
        }
        setCerimonias(preenchidas);
        setSnapshotSalvo(JSON.stringify({ frase, whatsapp, cerimonias: preenchidas }));
        setJaSalvouAntes(true);
        return true;
    }

    async function salvarECompartilhar() {
        if (!pessoa) return;
        // Abre a aba já no clique (antes do await) para não cair no bloqueador de pop-up.
        const janela = window.open("", "_blank");
        if (!(await salvar())) {
            janela?.close();
            return;
        }
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagemWhatsApp(pessoa))}`;
        if (janela) janela.location.href = url;
        else window.location.href = url;
    }

    if (carregando) {
        return (
            <div className="legado-app-wrapper min-h-screen flex items-center justify-center text-tema-primaria">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!pessoa) {
        return (
            <div className="legado-app-wrapper min-h-screen flex items-center justify-center px-4">
                <p className="text-tema-titulo font-semibold">Pessoa não encontrada.</p>
            </div>
        );
    }

    return (
        <div className={`legado-app-wrapper min-h-screen items-center px-4 pt-4 bg-gradient-to-b from-tema-fundo-topo to-tema-fundo-base ${LEGADO_NAV_ESPACO}`}>
            <div className="w-full max-w-md md:max-w-xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-tema-titulo font-bold text-sm bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl hover:bg-white transition-all active:scale-95 shadow-sm"
                    >
                        <ChevronLeft size={18} /> Voltar
                    </button>
                    <a
                        href={`/nota/${pessoa.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-tema-destaque font-bold text-sm px-3 py-2"
                    >
                        Ver nota <ExternalLink size={14} />
                    </a>
                </div>

                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-tema-titulo">Nota de falecimento</h2>
                    <p className="text-base text-tema-texto opacity-80">
                        Informações do velório e homenagens a {pessoa.nome}
                    </p>
                </div>

                {!pessoa.falecido && (
                    <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                        Esta pessoa não está marcada como falecida. A nota só fica visível publicamente após marcar o falecimento no menu.
                    </div>
                )}

                <div className="bg-white rounded-2xl p-5 shadow-lg border border-tema-borda space-y-4">
                    <div>
                        <label className="legado-form-label text-base">Frase de homenagem (opcional)</label>
                        <textarea
                            className="legado-input text-base min-h-[80px] resize-y"
                            placeholder="Ex.: A saudade é grande e o nosso amor é para sempre"
                            value={frase}
                            maxLength={MAX_FRASE}
                            onChange={(e) => setFrase(e.target.value)}
                        />
                        <p className="text-xs font-semibold text-tema-suave mt-3 mb-2">Sugestões — toque para usar</p>
                        <div className="flex flex-wrap gap-2">
                            {FRASES_SUGERIDAS.map((f) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFrase(f)}
                                    className={`text-left text-xs leading-snug px-3 py-2 rounded-xl border transition ${
                                        frase === f
                                            ? "bg-tema-titulo border-tema-titulo text-white"
                                            : "bg-tema-claro-2 border-tema-borda-forte text-tema-titulo hover:bg-tema-claro-2"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="legado-form-label text-base">WhatsApp para coroa de flores (opcional)</label>
                        <input
                            className="legado-input text-base"
                            type="tel"
                            inputMode="tel"
                            placeholder="(11) 99999-9999"
                            value={whatsapp}
                            maxLength={15}
                            onChange={(e) => setWhatsapp(maskTelefone(e.target.value))}
                        />
                        <p className="text-xs text-tema-apagado mt-1">
                            Se preenchido, a nota exibe o botão "Enviar coroa de flores".
                        </p>
                    </div>
                </div>

                {cerimonias.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-lg border border-tema-borda space-y-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Tipo de cerimônia">
                                {TIPOS_CERIMONIA.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        role="radio"
                                        aria-checked={c.tipo === t}
                                        onClick={() => atualizarCerimonia(i, "tipo", t)}
                                        className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition ${
                                            c.tipo === t
                                                ? "bg-tema-titulo border-tema-titulo text-white shadow-sm"
                                                : "bg-white border-tema-borda-forte text-tema-texto hover:bg-tema-claro-2"
                                        }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => setCerimonias((prev) => prev.filter((_, idx) => idx !== i))}
                                className="text-[#c33] hover:bg-red-50 p-2 rounded-lg shrink-0"
                                aria-label={`Remover ${c.tipo}`}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div>
                            <label className="legado-form-label text-base">Local *</label>
                            <input
                                className="legado-input text-base"
                                placeholder="Ex.: Cemitério da Paz"
                                value={c.local}
                                maxLength={120}
                                onChange={(e) => atualizarCerimonia(i, "local", e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="legado-form-label text-base">Endereço</label>
                            <input
                                className="legado-input text-base"
                                placeholder="Rua, número, bairro - cidade / UF"
                                value={c.endereco ?? ""}
                                maxLength={200}
                                onChange={(e) => atualizarCerimonia(i, "endereco", e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="legado-form-label text-base">Data</label>
                                <input
                                    className="legado-input text-base"
                                    type="date"
                                    value={c.data ?? ""}
                                    onChange={(e) => atualizarCerimonia(i, "data", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="legado-form-label text-base">Horário</label>
                                <input
                                    className="legado-input text-base"
                                    type="time"
                                    value={c.hora ?? ""}
                                    onChange={(e) => atualizarCerimonia(i, "hora", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {cerimonias.length < MAX_CERIMONIAS && (
                    <button
                        type="button"
                        onClick={() =>
                            setCerimonias((prev) => [...prev, cerimoniaVazia(prev.length === 0 ? "Velório" : "Sepultamento")])
                        }
                        className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-tema-borda-forte rounded-2xl py-3 text-tema-titulo font-bold hover:bg-tema-claro-2 transition"
                    >
                        <Plus size={18} /> Adicionar cerimônia
                    </button>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        type="button"
                        onClick={salvar}
                        disabled={salvando}
                        className={`flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition active:scale-95 disabled:opacity-60 ${
                            salvo
                                ? "bg-tema-claro-2 text-tema-titulo border border-tema-borda-forte"
                                : "bg-tema-primaria text-white shadow-lg hover:shadow-xl"
                        }`}
                    >
                        {salvando ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : salvo ? (
                            <CheckCircle2 size={20} />
                        ) : (
                            <Save size={20} />
                        )}
                        {salvando ? "Salvando..." : salvo ? "Salvo" : jaSalvouAntes ? "Salvar alterações" : "Salvar"}
                    </button>

                    {salvo && (
                        <div className="flex items-start gap-3 rounded-2xl bg-white border border-tema-borda-forte px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300" role="status">
                            <CheckCircle2 size={20} className="text-tema-primaria shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-tema-titulo text-sm">Nota salva com sucesso</p>
                                <p className="text-xs text-tema-suave mt-0.5">
                                    {pessoa.falecido
                                        ? "Ela já está disponível para familiares e amigos."
                                        : "Ela ficará visível assim que o falecimento for marcado no menu."}
                                </p>
                            </div>
                        </div>
                    )}

                    <a
                        href={`/nota/${pessoa.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 bg-white border-2 border-tema-titulo text-tema-titulo font-bold py-3.5 rounded-2xl hover:bg-tema-claro-2 transition active:scale-95"
                    >
                        <Eye size={20} /> Ver nota de falecimento
                    </a>
                    <button
                        type="button"
                        onClick={salvarECompartilhar}
                        disabled={salvando || !pessoa.falecido}
                        className="flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition active:scale-95 disabled:opacity-60"
                    >
                        <Share2 size={20} /> Salvar e compartilhar no WhatsApp
                    </button>
                </div>
            </div>
            <LegadoNav />
        </div>
    );
}
