import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Heart, Home, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function Sucesso() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [nome, setNome] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            const { data: dep } = await supabase
                .from("dependentes")
                .select("nome")
                .eq("id", id)
                .maybeSingle();
            if (dep?.nome) {
                setNome(dep.nome);
                return;
            }
            const { data: tit } = await supabase
                .from("titulares")
                .select("nome")
                .eq("id", id)
                .maybeSingle();
            if (tit?.nome) setNome(tit.nome);
        })();
    }, [id]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e3f1eb] to-[#f8fcfb] flex items-center justify-center px-4 py-10">
            <div className="bg-white w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-xl border border-[#d1e5dc] text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto w-16 h-16 rounded-full bg-[#e3f1eb] flex items-center justify-center mb-5">
                    <CheckCircle2 className="h-9 w-9 text-[#5ba58c]" strokeWidth={2.5} />
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                    <Heart className="h-5 w-5 text-[#5ba58c] fill-[#5ba58c]/25" />
                    <h1 className="text-xl sm:text-2xl font-bold text-[#255f4f]">
                        Obrigado por sua homenagem
                    </h1>
                    <span aria-hidden>💙</span>
                </div>

                <p className="text-[#6b8c7d] text-sm sm:text-base leading-relaxed mb-2">
                    Sua recordação foi enviada com sucesso
                    {nome ? (
                        <> e fará parte da memória de <strong className="text-[#255f4f]">{nome}</strong>.</>
                    ) : (
                        <> e fará parte da memória daqueles que já se foram.</>
                    )}
                </p>

                <p className="text-xs text-[#9db4aa] mb-8">
                    Seu carinho chegou com segurança e será guardado com respeito.
                </p>

                <div className="flex flex-col gap-3">
                    {id && (
                        <button
                            type="button"
                            onClick={() => navigate(`/recordacoes-publicas/${id}`)}
                            className="w-full flex items-center justify-center gap-2 bg-[#5ba58c] hover:bg-[#4a8a75] text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition active:scale-[0.99]"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Deixar outra recordação
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#c2e1d4] text-[#255f4f] hover:bg-[#f8fcfb] font-semibold py-3.5 px-6 rounded-2xl transition"
                    >
                        <Home className="h-5 w-5" />
                        Conheça nossa página
                    </button>
                </div>
            </div>
        </div>
    );
}
