import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { FaUserCircle } from 'react-icons/fa';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const supabaseAnon = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!,
    {
        global: {
            fetch: window.fetch,
        },
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
        },
    }
);

export default function RecordacaoPublica() {
    const { id: dependenteId } = useParams();
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [anonimo, setAnonimo] = useState(false);
    const [imagem, setImagem] = useState<File | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [dependente, setDependente] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDependente = async () => {
            if (!dependenteId) return;
            const cleanId = dependenteId.trim();
            // Tenta buscar como dependente
            let { data, error } = await supabaseAnon
                .from('dependentes')
                .select('nome, data_nascimento, data_falecimento, imagem_url')
                .eq('id', cleanId)
                .single();

            if (!data || error) {
                // Se não achar, tenta como titular
                const { data: titularData, error: titularError } = await supabaseAnon
                    .from('titulares')
                    .select('nome, data_nascimento, data_falecimento, imagem_url')
                    .eq('id', cleanId)
                    .single();

                if (titularData && !titularError) {
                    setDependente(titularData);
                    return;
                } else {
                    setDependente(null);
                    return;
                }
            }
            setDependente(data);
        };

        fetchDependente();
    }, [dependenteId]);

    // Atualiza preview ao selecionar imagem
    useEffect(() => {
        if (!imagem) {
            setImagemPreview(null);
            return;
        }
        const url = URL.createObjectURL(imagem);
        setImagemPreview(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [imagem]);

    const handleUpload = async () => {
        if (!dependenteId || !mensagem) return;
        setEnviando(true);

        // 1. Tenta encontrar como dependente
        let found = false;
        let tipo = ""; // "dependente" ou "titular"

        const { data: dep, error: depError } = await supabase
            .from('dependentes')
            .select('id')
            .eq('id', dependenteId)
            .maybeSingle();

        if (dep && !depError) {
            found = true;
            tipo = "dependente";
        }

        // 2. Se não encontrou como dependente, tenta titular
        if (!found) {
            const { data: tit, error: titError } = await supabase
                .from('titulares')
                .select('id')
                .eq('id', dependenteId)
                .maybeSingle();

            if (tit && !titError) {
                found = true;
                tipo = "titular";
            }
        }

        if (!found) {
            alert("Pessoa não encontrada (titular ou dependente). Não é possível enviar recordação.");
            setEnviando(false);
            return;
        }

        // prossegue upload normalmente...
        let imagem_url: string | null = null;

        if (imagem) {
            const filename = `recordacao-${Date.now()}.${imagem.name.split('.').pop()}`;
            const { error: uploadError } = await supabase
                .storage
                .from('recordacoes')
                .upload(`publicas/${filename}`, imagem);

            if (!uploadError) {
                const { data: urlData } = supabase
                    .storage
                    .from('recordacoes')
                    .getPublicUrl(`publicas/${filename}`);
                imagem_url = urlData?.publicUrl ?? null;
            } else {
                alert('Erro ao fazer upload da imagem.');
                setEnviando(false);
                return;
            }
        }

        const remetente = anonimo ? 'Anônimo' : nome || 'Anônimo';

        const { error: insertError } = await supabase.from('recordacoes').insert({
            dependente_id: dependenteId,
            mensagem: `${mensagem}\n\n– ${remetente}`,
            imagem_url,
        });

        setEnviando(false);

        if (!insertError) {
            setSucesso(true);
            setMensagem('');
            setNome('');
            setImagem(null);
            setImagemPreview(null);
            setTimeout(() => navigate(`/recordacoes-publicas/sucesso/${dependenteId}`), 1800);
        } else {
            alert('Erro ao enviar a recordação.');
        }
    };

    return (
        <div className="min-h-screen bg-[#E3F1EB] flex items-center justify-center px-4 py-10">
            <div className="bg-white w-full max-w-xl p-6 rounded-2xl shadow-xl border border-[#D1F2EB] animate-fade-in">
                {dependente && (
                    <div className="flex flex-col items-center mb-8">
                        {dependente.imagem_url ? (
                            <img
                                src={dependente.imagem_url}
                                alt={dependente.nome}
                                className="w-28 h-28 rounded-full object-cover mb-3 border-4 border-[#5BA58C] shadow-md"
                            />
                        ) : (
                            <FaUserCircle
                                size={112}
                                className="text-gray-400 mb-3"
                            />
                        )}
                        <h2 className="text-xl font-bold text-[#007080]">{dependente.nome}</h2>
                        <div className="text-sm text-gray-600 mt-1 text-center">
                            {dependente.data_nascimento && <p>Nascimento: {dependente.data_nascimento}</p>}
                            {dependente.data_falecimento && <p>Falecimento: {dependente.data_falecimento}</p>}
                        </div>
                    </div>
                )}

                <h1 className="text-2xl font-bold text-center mb-6 text-[#007080]">
                    Deixe sua recordação 💙
                </h1>

                <textarea
                    placeholder="Escreva sua mensagem com carinho..."
                    className="w-full p-4 text-[#2D2D2D] border border-[#B2D8D8] rounded-lg mb-4 placeholder-gray-400 focus:ring-2 focus:ring-[#5BA58C] focus:outline-none transition"
                    rows={5}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/*"
                    className="mb-4 text-sm text-gray-600 block w-full"
                    onChange={(e) => setImagem(e.target.files?.[0] || null)}
                />

                {imagemPreview && (
                    <img
                        src={imagemPreview}
                        alt="Preview da imagem selecionada"
                        className="w-48 h-48 object-cover rounded-lg mb-4 mx-auto border border-gray-300"
                    />
                )}
                <label
                    htmlFor="inputImagem"
                    className="block cursor-pointer mb-4 text-center py-3 bg-[#5BA58C] text-white rounded-lg font-semibold hover:bg-[#4a8c75] transition"
                >
                    Selecionar imagem
                </label>
                <input
                    id="inputImagem"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImagem(e.target.files?.[0] || null)}
                />

                <input
                    type="text"
                    placeholder="Seu nome (opcional)"
                    disabled={anonimo}
                    className={`w-full p-4 border border-[#B2D8D8] rounded-lg mb-4 text-[#2D2D2D] placeholder-gray-400 transition ${anonimo ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-[#5BA58C]'
                        }`}
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <label className="flex items-center gap-2 text-sm text-[#007080] font-medium mb-4">
                    <input
                        type="checkbox"
                        checked={anonimo}
                        onChange={(e) => setAnonimo(e.target.checked)}
                        className="accent-[#5BA58C]"
                    />
                    Enviar como anônimo
                </label>

                <button
                    onClick={handleUpload}
                    disabled={enviando}
                    className="w-full bg-[#5BA58C] text-white py-3 rounded-lg font-bold hover:bg-[#4a8c75] transition disabled:opacity-60"
                >
                    {enviando ? 'Enviando...' : 'Enviar recordação'}
                </button>

                {sucesso && (
                    <div className="mt-4 bg-green-100 text-green-700 text-center p-3 rounded-lg shadow-sm">
                        Recordação enviada com sucesso 💙
                    </div>
                )}
            </div>
        </div>
    );
}
