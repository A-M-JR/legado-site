import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { ChevronLeft, PlusCircle, QrCode, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";

import { toast } from "@/hooks/use-toast";

import { useMelhorIdade } from "../context/MelhorIdadeContext";

import { familiaMemoriasService } from "../services/familiaMemoriasService";

import { getContaDados } from "../services/miScope";

import type { FamiliaMemoria } from "../types";

import { MiRecordacaoModal } from "../components/MiRecordacaoModal";

import { MiConviteRecordacao } from "../components/MiConviteRecordacao";

import { MiFullscreenMedia } from "../components/MiFullscreenMedia";

import { isVideoMediaUrl } from "@/lib/validation";

import { confirmDialog } from "@/components/ui/confirm-dialog";



function formatarDataHora(data: string) {

    return new Date(data).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

}



export default function FamiliaMemoriasPage() {

    const { id: pessoaId } = useParams();

    const navigate = useNavigate();

    const { profile } = useMelhorIdade();

    const [memorias, setMemorias] = useState<FamiliaMemoria[]>([]);

    const [titularId, setTitularId] = useState<string | null>(null);

    const [modalOpen, setModalOpen] = useState(false);

    const [conviteOpen, setConviteOpen] = useState(false);

    const [mediaTelaCheia, setMediaTelaCheia] = useState<{

        url: string;

        tipo?: "foto" | "video";

        alt?: string;

    } | null>(null);



    useEffect(() => {

        getContaDados().then((d) => setTitularId(d?.titularId ?? null));

    }, []);



    useEffect(() => {

        if (pessoaId) familiaMemoriasService.list(pessoaId).then(setMemorias);

    }, [pessoaId]);



    const pessoa = useMemo(() => {

        if (pessoaId === "eu") {

            return {

                id: "eu",

                nome: profile.nome || "Você",

                fotoUrl: profile.fotoUrl,

                relacao: "Titular",

            };

        }

        const rede = profile.rede.find((p) => p.id === pessoaId);

        return rede

            ? { id: rede.id, nome: rede.nome, fotoUrl: rede.fotoUrl, relacao: rede.relacao }

            : null;

    }, [pessoaId, profile]);



    async function salvar(data: {

        mensagem: string;

        nome: string;

        anonimo: boolean;

        file: File | null;

    }) {

        if (!pessoaId) return;



        try {

            setMemorias(

                await familiaMemoriasService.add(

                    {

                        pessoaId,

                        mensagem: data.mensagem,

                        remetente: data.anonimo ? "Anônimo" : data.nome,

                        anonimo: data.anonimo,

                    },

                    data.file

                )

            );

            toast({ title: "Recordação enviada 💙" });

        } catch {

            toast({ title: "Erro ao enviar recordação", variant: "destructive" });

        }

    }



    async function excluir(memoriaId: string) {

        const ok = await confirmDialog({
            title: "Excluir esta recordação?",
            description: "Essa ação não pode ser desfeita.",
        });
        if (!ok) return;

        setMemorias(await familiaMemoriasService.remove(memoriaId, pessoaId));

    }



    if (!pessoa) {

        return (

            <div className="text-center py-12 text-[#6b8c7d]">

                <p>Perfil não encontrado.</p>

                <Button variant="link" onClick={() => navigate("/melhor-idade/familia")} className="text-[#5ba58c]">

                    Voltar

                </Button>

            </div>

        );

    }



    return (

        <div className="space-y-5 pb-4">

            <button

                type="button"

                onClick={() => navigate("/melhor-idade/familia")}

                className="flex items-center gap-2 text-[#255f4f] font-bold text-sm bg-white px-3 py-2 rounded-xl border border-[#e6efe9] shadow-sm"

            >

                <ChevronLeft size={18} />

                Voltar

            </button>



            <div className="text-center space-y-3">

                {pessoa.fotoUrl ? (

                    <img

                        src={pessoa.fotoUrl}

                        alt={pessoa.nome}

                        className="w-24 h-24 rounded-full object-cover border-4 border-[#c2e1d4] mx-auto shadow-md"

                    />

                ) : (

                    <div className="w-24 h-24 rounded-full bg-[#e3f1eb] flex items-center justify-center mx-auto border-4 border-white shadow-md">

                        <User className="h-10 w-10 text-[#5ba58c]" />

                    </div>

                )}

                <div>

                    <h1 className="text-xl font-bold text-[#255f4f]">Memórias de {pessoa.nome}</h1>

                    <p className="text-sm text-[#6b8c7d]">{pessoa.relacao}</p>

                </div>

                <p className="text-sm text-[#6b8c7d] max-w-md mx-auto">

                    Mensagens e fotos compartilhadas com carinho — só do Melhor Idade.

                </p>

            </div>



            {titularId && (

                <button

                    type="button"

                    onClick={() => setConviteOpen(true)}

                    className="w-full flex items-center justify-center gap-2 bg-[#D1F2EB] border border-[#5BA58C] rounded-2xl py-3 font-bold text-[#007080] shadow-sm hover:shadow-md transition"

                >

                    <QrCode size={20} />

                    Convidar por QR Code ou WhatsApp

                </button>

            )}



            <div className="space-y-3">

                {memorias.length === 0 ? (

                    <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#d1e5dc] bg-white/60">

                        <p className="font-semibold text-[#255f4f]">Ainda não há recordações aqui.</p>

                        <p className="text-sm text-[#6b8c7d] mt-1">Seja o primeiro a deixar uma mensagem ou convide alguém.</p>

                    </div>

                ) : (

                    memorias.map((item) => (

                        <article

                            key={item.id}

                            className="bg-white border border-[#e6f4f1] rounded-2xl p-4 shadow-sm"

                        >

                            <div className="flex items-start gap-3">

                                <div className="w-10 h-10 rounded-full bg-[#e3f1eb] flex items-center justify-center shrink-0">

                                    <User size={18} className="text-[#255f4f]" />

                                </div>

                                <div className="flex-1 min-w-0">

                                    <div className="flex justify-between gap-2">

                                        <div>

                                            <p className="font-bold text-[#255f4f]">{item.remetente}</p>

                                            <p className="text-[10px] text-[#9db4aa]">{formatarDataHora(item.criadoEm)}</p>

                                        </div>

                                        <button

                                            type="button"

                                            onClick={() => excluir(item.id)}

                                            className="text-[#c33] hover:bg-red-50 p-2 rounded-lg shrink-0"

                                            aria-label="Excluir"

                                        >

                                            <Trash2 size={16} />

                                        </button>

                                    </div>

                                    <p className="text-sm text-[#4f665a] mt-2 whitespace-pre-wrap">{item.mensagem}</p>

                                    {item.mediaUrl && (

                                        <button

                                            type="button"

                                            onClick={() =>

                                                setMediaTelaCheia({

                                                    url: item.mediaUrl!,

                                                    tipo: item.mediaTipo,

                                                    alt: `Recordação de ${item.remetente}`,

                                                })

                                            }

                                            className="mt-3 w-full rounded-xl overflow-hidden border border-[#e6efe9] text-left focus:outline-none focus:ring-2 focus:ring-[#5ba58c]"

                                            aria-label="Abrir mídia em tela cheia"

                                        >

                                            {item.mediaTipo === "video" || isVideoMediaUrl(item.mediaUrl) ? (

                                                <video

                                                    src={item.mediaUrl}

                                                    controls

                                                    className="w-full max-h-56 object-contain bg-black pointer-events-none"

                                                />

                                            ) : (

                                                <img

                                                    src={item.mediaUrl}

                                                    alt=""

                                                    className="w-full max-h-56 object-cover"

                                                />

                                            )}

                                        </button>

                                    )}

                                </div>

                            </div>

                        </article>

                    ))

                )}

            </div>



            <Button

                onClick={() => setModalOpen(true)}

                className="w-full py-5 rounded-2xl bg-[#5ba58c] text-white font-bold shadow-lg"

            >

                <PlusCircle className="mr-2 h-5 w-5" />

                Deixar recordação

            </Button>



            <MiRecordacaoModal

                open={modalOpen}

                onOpenChange={setModalOpen}

                person={{

                    nome: pessoa.nome,

                    imagem_url: pessoa.fotoUrl,

                }}

                onSubmit={salvar}

            />



            {titularId && pessoaId && (

                <MiConviteRecordacao

                    open={conviteOpen}

                    onClose={() => setConviteOpen(false)}

                    titularId={titularId}

                    pessoaId={pessoaId}

                    pessoaNome={pessoa.nome}

                />

            )}



            <MiFullscreenMedia

                open={!!mediaTelaCheia}

                url={mediaTelaCheia?.url ?? null}

                tipo={mediaTelaCheia?.tipo}

                alt={mediaTelaCheia?.alt}

                onClose={() => setMediaTelaCheia(null)}

            />

        </div>

    );

}

