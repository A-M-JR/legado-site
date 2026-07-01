import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import RecordacaoForm, { type HomenageadoInfo } from '@/components/recordacoes/RecordacaoForm';
import { Loader2 } from 'lucide-react';

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
            alert('Pessoa não encontrada. Não é possível enviar recordação.');
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
                alert('Erro ao enviar arquivo. Tente novamente.');
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
            alert('Erro ao enviar a recordação.');
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#e3f1eb] to-[#f8fcfb] flex items-center justify-center px-4 py-8 sm:py-12">
            <div className="bg-white w-full max-w-lg p-5 sm:p-8 rounded-3xl shadow-xl border border-[#d1e5dc]">
                {carregandoDependente ? (
                    <div className="flex flex-col items-center py-16 text-[#5ba58c] gap-3">
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
                        onSubmit={handleSubmit}
                    />
                ) : null}
            </div>
        </div>
    );
}
