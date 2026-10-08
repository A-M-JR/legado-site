import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Home, PlusCircle, ScrollText } from "lucide-react";
import logoVerde from "@/assets/Legado - Verde.png";
import { COR, Coroa, Divisor } from "@/components/recordacoes/Ornamentos";
import { buscarHomenageado, type Homenageado } from "@/lib/notaFalecimento";

export default function Sucesso() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [pessoa, setPessoa] = useState<Homenageado | null>(null);

    useEffect(() => {
        if (!id) return;
        buscarHomenageado(id).then(setPessoa);
    }, [id]);

    return (
        <div className="min-h-screen flex items-center justify-center px-3 py-8 sm:px-4" style={{ background: "#f6f1e8" }}>
            <div
                className="w-full max-w-md rounded-[28px] px-6 pt-6 pb-8 sm:px-10 text-center shadow-[0_10px_40px_rgba(140,110,60,0.12)] animate-in fade-in zoom-in-95 duration-500"
                style={{ background: COR.fundo, border: `1.5px solid ${COR.moldura}`, color: COR.texto }}
            >
                <img src={logoVerde} alt="Legado" className="h-9 mx-auto" />

                <div className="relative mx-auto mt-4" style={{ width: 150, height: 150 }}>
                    <Coroa size={150} />
                    <div
                        className="absolute rounded-full overflow-hidden flex items-center justify-center"
                        style={{ top: 30, left: 30, width: 90, height: 90, border: "4px solid #ffffff", boxShadow: "0 6px 18px rgba(47,107,92,0.18)", background: "#eef3f1" }}
                    >
                        {pessoa?.imagem_url ? (
                            <img src={pessoa.imagem_url} alt={pessoa.nome} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-3xl" aria-hidden>💙</span>
                        )}
                    </div>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold mt-2" style={{ color: COR.titulo }}>
                    Obrigado por sua homenagem 💙
                </h1>

                <p className="font-serif mt-3 leading-relaxed">
                    Sua recordação foi enviada com sucesso
                    {pessoa?.nome ? (
                        <> e fará parte da memória de <strong style={{ color: COR.titulo }}>{pessoa.nome}</strong>.</>
                    ) : (
                        <> e fará parte da memória daqueles que já se foram.</>
                    )}
                </p>
                <p className="font-serif italic text-sm mt-2" style={{ color: COR.suave }}>
                    Seu carinho chegou com segurança e será guardado com respeito.
                </p>

                <div className="my-6">
                    <Divisor />
                </div>

                <div className="flex flex-col gap-3">
                    {pessoa?.falecido && id && (
                        <button
                            type="button"
                            onClick={() => navigate(`/nota/${id}`)}
                            className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition hover:brightness-110 active:scale-[0.99]"
                            style={{ background: COR.titulo }}
                        >
                            <ScrollText className="h-5 w-5" />
                            Ver nota de falecimento
                        </button>
                    )}
                    {id && (
                        <button
                            type="button"
                            onClick={() => navigate(`/recordacoes-publicas/${id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-white font-bold py-3.5 px-6 rounded-2xl border-2 transition hover:brightness-95 active:scale-[0.99]"
                            style={{ borderColor: COR.titulo, color: COR.titulo }}
                        >
                            <PlusCircle className="h-5 w-5" />
                            Deixar outra recordação
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-2xl transition hover:bg-white/60"
                        style={{ color: COR.suave }}
                    >
                        <Home className="h-4 w-4" />
                        Conheça o Instituto Legado
                    </button>
                </div>
            </div>
        </div>
    );
}
