import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import logoVerde from '@/assets/Legado - Verde.png';
import { COR } from '@/components/recordacoes/Ornamentos';
import { supabase } from '@/lib/supabaseClient';
import RecordacaoForm, { type HomenageadoInfo } from '@/components/recordacoes/RecordacaoForm';
import { Loader2, ScrollText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function RecordacaoPublica() {
    const { id: dependenteId } = useParams();
    const [enviando, setEnviando] = useState(false);
    const [carregandoDependente, setCarregandoDependente] = useState(true);
    const [dependenteNaoEncontrado, setDependenteNaoEncontrado] = useState(false);
    const [dependente, setDependente] = useState<HomenageadoInfo | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDependente = async () => {
            if (!dependenteId) return;
            setCarregandoDependente(true);
            setDependenteNaoEncontrado(false);
            const cleanId = dependenteId.trim();

            let { data, error } = await supabase
                .from('dependentes')
                .select('nome, data_nascimento, data_falecimento, imagem_url, falecido')
                .eq('id', cleanId)
                .single();

            if (!data || error) {
                const { data: titularData, error: titularError } = await supabase
                    .from('titulares')
                    .select('nome, data_nascimento, data_falecimento, imagem_url, falecido')
                    .eq('id', cleanId)
                    .single();

                if (titularData && !titularError) {
                    setDependente(titularData);
                } else {
                    setDependente(null);
                    setDependenteNaoEncontrado(true);
                }
            } else {
                setDependente(data);
            }
            setCarregandoDependente(false);
        };

        fetchDependente();
    }, [dependenteId]);

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
        if (!dependenteId) return;

        setEnviando(true);

        let found = false;
        const { data: dep } = await supabase.from('dependentes').select('id').eq('id', dependenteId).maybeSingle();
        if (dep) found = true;

        if (!found) {
            const { data: tit } = await supabase.from('titulares').select('id').eq('id', dependenteId).maybeSingle();
            if (tit) found = true;
        }

        if (!found) {
            toast({
                title: 'Pessoa não encontrada',
                description: 'Não é possível enviar a recordação.',
                variant: 'destructive',
            });
            setEnviando(false);
            return;
        }

        let imagem_url: string | null = null;

        if (file) {
            const ext = file.name.split('.').pop() || 'bin';
            const filename = `recordacao-${Date.now()}.${ext}`;
            const path = `publicas/${filename}`;
            const { error: uploadError } = await supabase.storage.from('recordacoes').upload(path, file);

            if (uploadError) {
                toast({
                    title: 'Erro ao enviar arquivo',
                    description: 'Tente novamente em instantes.',
                    variant: 'destructive',
                });
                setEnviando(false);
                return;
            }

            const { data: urlData } = supabase.storage.from('recordacoes').getPublicUrl(path);
            imagem_url = urlData?.publicUrl ?? null;
        }

        const remetente = anonimo ? 'Anônimo' : nome || 'Anônimo';
        const { error: insertError } = await supabase.from('recordacoes').insert({
            dependente_id: dependenteId,
            mensagem: `${mensagem}\n\n– ${remetente}`,
            imagem_url,
        });

        setEnviando(false);

        if (!insertError) {
            navigate(`/recordacoes-publicas/sucesso/${dependenteId}`);
        } else {
            toast({
                title: 'Erro ao enviar a recordação',
                description: 'Tente novamente em instantes.',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-3 py-6 sm:px-4 sm:py-10" style={{ background: "#f6f1e8" }}>
            <div
                className="relative w-full max-w-lg overflow-hidden rounded-[28px] px-5 pt-6 pb-8 sm:px-8 shadow-[0_10px_40px_rgba(140,110,60,0.12)]"
                style={{ background: COR.fundo, border: `1.5px solid ${COR.moldura}` }}
            >
                <header className="flex items-start justify-between gap-4 mb-4">
                    <img src={logoVerde} alt="Legado" className="h-9" />
                    {dependente?.falecido && dependenteId ? (
                        <Link
                            to={`/nota/${dependenteId}`}
                            className="flex items-center gap-1 text-xs sm:text-sm font-semibold pt-1"
                            style={{ color: COR.titulo }}
                        >
                            <ScrollText className="h-4 w-4" /> Ver nota de falecimento
                        </Link>
                    ) : (
                        <p className="font-serif italic text-xs text-right leading-snug max-w-[180px]" style={{ color: COR.suave }}>
                            Porque toda vida merece ser lembrada com carinho!
                        </p>
                    )}
                </header>
                {carregandoDependente ? (
                    <div className="flex flex-col items-center py-16 gap-3" style={{ color: COR.folhaEscura }}>
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-sm font-medium">Carregando...</span>
                    </div>
                ) : dependenteNaoEncontrado ? (
                    <div className="text-center py-16">
                        <p className="text-red-600 font-semibold">Homenageado não encontrado.</p>
                    </div>
                ) : dependente ? (
                    <RecordacaoForm
                        person={dependente}
                        loading={enviando}
                        tema="memorial"
                        onSubmit={handleSubmit}
                    />
                ) : null}
                <p className="font-serif mt-6 text-center text-xs tracking-wide" style={{ color: COR.suave }}>
                    Instituto Legado e Conforto · legadoeconforto.com.br
                </p>
            </div>
        </div>
    );
}
