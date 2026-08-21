import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import RecordacaoForm, { type HomenageadoInfo } from "@/components/recordacoes/RecordacaoForm";
import { familiaMensagensService } from "@/modules/medicina-preventiva/services/familiaMensagensService";
import { toast } from "@/hooks/use-toast";

export default function MpMensagemPublicaPage() {
    const { titularId, pessoaId } = useParams();
    const navigate = useNavigate();

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [naoEncontrado, setNaoEncontrado] = useState(false);
    const [erroMsg, setErroMsg] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState(false);
    const [person, setPerson] = useState<HomenageadoInfo | null>(null);

    useEffect(() => {
        (async () => {
            if (!titularId || !pessoaId) return;
            setCarregando(true);
            setNaoEncontrado(false);
            setErroMsg(null);

            const { data, error } = await supabase.rpc("mp_get_pessoa_publica", {
                p_titular_id: titularId,
                p_pessoa_id: pessoaId,
            });

            if (error) {
                setPerson(null);
                setNaoEncontrado(true);
                setErroMsg(
                    error.message?.includes("mp_get_pessoa_publica")
                        ? "Função do banco não instalada. Rode a migration 013 no Supabase."
                        : error.message
                );
                setCarregando(false);
                return;
            }

            const parsed =
                typeof data === "string"
                    ? (JSON.parse(data) as { nome?: string; imagem_url?: string })
                    : (data as { nome?: string; imagem_url?: string } | null);

            if (!parsed?.nome) {
                setPerson(null);
                setNaoEncontrado(true);
            } else {
                setPerson({
                    nome: String(parsed.nome),
                    imagem_url: parsed.imagem_url ? String(parsed.imagem_url) : undefined,
                });
            }
            setCarregando(false);
        })();
    }, [titularId, pessoaId]);

    async function handleSubmit({
        mensagem,
        nome,
        anonimo,
        file,
    }: {
        mensagem: string;
        nome: string;
        anonimo: boolean;
        file: File | null;
    }) {
        if (!titularId || !pessoaId) return;

        setEnviando(true);
        const ok = await familiaMensagensService.enviarPublica({
            titularId,
            pessoaId,
            mensagem,
            remetente: anonimo ? "Anônimo" : nome || "Anônimo",
            anonimo,
            file,
        });
        setEnviando(false);

        if (ok) {
            setSucesso(true);
        } else {
            toast({
                title: "Erro ao enviar a mensagem",
                description: "Tente novamente em instantes.",
                variant: "destructive",
            });
        }
    }

    if (sucesso) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#e3f1eb] to-[#f8fcfb] flex items-center justify-center px-4 py-8">
                <div className="bg-white w-full max-w-lg p-8 rounded-3xl shadow-xl border border-[#d1e5dc] text-center space-y-4">
                    <CheckCircle2 className="h-16 w-16 text-[#5ba58c] mx-auto" />
                    <h1 className="text-2xl font-bold text-[#255f4f]">Mensagem enviada</h1>
                    <p className="text-[#6b8c7d]">
                        Obrigado! {person?.nome} vai ver sua mensagem no aplicativo.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSucesso(false);
                            navigate(0);
                        }}
                        className="text-[#5ba58c] font-bold hover:underline"
                    >
                        Enviar outra mensagem
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e3f1eb] to-[#f8fcfb] flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="w-full max-w-lg">
                {carregando ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-[#5ba58c]" />
                    </div>
                ) : naoEncontrado || !person ? (
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-[#d1e5dc] text-center space-y-3">
                        <h1 className="text-xl font-bold text-[#255f4f]">Link inválido</h1>
                        <p className="text-sm text-[#6b8c7d]">
                            {erroMsg || "Este convite não está mais disponível."}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#d1e5dc]">
                        <RecordacaoForm
                            person={person}
                            title={`Deixe uma mensagem para ${person.nome}`}
                            subtitle="Escreva com carinho. Você pode anexar uma foto ou um vídeo curto."
                            loading={enviando}
                            onSubmit={handleSubmit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
