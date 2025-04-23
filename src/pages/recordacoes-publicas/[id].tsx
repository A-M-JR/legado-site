import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Instância do Supabase
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function RecordacaoPublica() {
    const { id } = useParams();
    const [nome, setNome] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [anonimo, setAnonimo] = useState(false);
    const [imagem, setImagem] = useState<File | null>(null);
    const [enviando, setEnviando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const navigate = useNavigate();


    const handleUpload = async () => {
        if (!id || !mensagem) return;

        setEnviando(true);
        let imagem_url: string | null = null;

        if (imagem) {
            const filename = `recordacao-${Date.now()}.${imagem.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage
                .from('recordacoes')
                .upload(`publicas/${filename}`, imagem);

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('recordacoes')
                    .getPublicUrl(`publicas/${filename}`);

                if (urlData?.publicUrl) {
                    imagem_url = urlData.publicUrl;
                }

            }
        }

        const remetente = anonimo ? 'Anônimo' : nome || 'Anônimo';

        const { error: insertError } = await supabase.from('recordacoes').insert({
            dependente_id: id,
            mensagem: `${mensagem}\n\n– ${remetente}`,
            imagem_url,
        });

        setEnviando(false);

        if (!insertError) {
            navigate('/recordacoes-publicas/sucesso');
        } else {
            alert('Erro ao enviar a recordação.');
        }
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eafbf7] to-[#d7f1ed] flex flex-col items-center justify-center px-4 py-10">
            <div className="bg-white shadow-md rounded-xl w-full max-w-xl p-6">
                <h1 className="text-2xl font-bold text-center mb-6 text-[#007080]">Deixe sua recordação</h1>

                <textarea
                    placeholder="Escreva sua mensagem..."
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                    rows={5}
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                />

                <input
                    type="file"
                    accept="image/*"
                    className="mb-4"
                    onChange={(e) => setImagem(e.target.files?.[0] || null)}
                />

                <input
                    type="text"
                    placeholder="Seu nome (opcional)"
                    disabled={anonimo}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-2"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                />

                <label className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <input
                        type="checkbox"
                        checked={anonimo}
                        onChange={(e) => setAnonimo(e.target.checked)}
                    />
                    Enviar como anônimo
                </label>

                <button
                    onClick={handleUpload}
                    disabled={enviando}
                    className="w-full bg-[#007080] text-white py-3 rounded-lg font-bold hover:bg-[#005f66] transition"
                >
                    {enviando ? 'Enviando...' : 'Enviar recordação'}
                </button>

                {sucesso && (
                    <div className="mt-4 bg-green-100 text-green-700 text-center p-3 rounded-lg">
                        Recordação enviada com sucesso 💙
                    </div>
                )}
            </div>
        </div>
    );
}
