import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { QRCodeCanvas } from 'qrcode.react';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function ConsultaRecordacao() {
    const [cpf, setCpf] = useState('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');
    const [copiado, setCopiado] = useState(false);

    const buscarPorCpf = async () => {
        setErro('');
        setData(null);
        setLoading(true);

        const { data, error } = await supabase
            .from('dependentes')
            .select('*')
            .eq('cpf', cpf)
            .maybeSingle();

        setLoading(false);

        if (error || !data) {
            setErro('CPF não encontrado. Verifique e tente novamente.');
        } else {
            setData(data);
        }
    };

    const qrLink = data ? `https://legadoeconforto.com.br/recordacoes-publicas/${data.id}` : '';

    return (
        <div className="min-h-screen bg-[#E3F1EB] flex items-center justify-center px-4 py-12">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-xl p-8 border border-[#D1F2EB] text-center">
                <h1 className="text-2xl font-bold text-[#007080] mb-6">Consulta de Homenagem</h1>

                <input
                    type="text"
                    placeholder="Digite o CPF"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    className="w-full mb-4 px-4 py-3 rounded-lg border border-[#B2D8D8] text-[#2D2D2D] focus:ring-2 focus:ring-[#5BA58C] outline-none"
                />

                <button
                    onClick={buscarPorCpf}
                    disabled={loading}
                    className="w-full bg-[#5BA58C] text-white py-3 rounded-lg font-bold hover:bg-[#4a8c75] transition mb-6"
                >
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>

                {erro && <p className="text-red-500 font-medium mb-4">{erro}</p>}

                {data && (
                    <div className="animate-fade-in">
                        <img
                            src={data.imagem_url || '/placeholder.jpg'}
                            alt={data.nome}
                            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-[#5BA58C] mb-4"
                        />

                        <h2 className="text-lg font-bold text-[#007080] mb-2">{data.nome}</h2>
                        <p className="text-sm text-gray-700 mb-6">
                            É com pesar que comunicamos o falecimento de <span className="font-semibold">{data.nome}</span>.
                            As informações sobre o velório serão divulgadas em breve.
                            Caso você deseje, já pode deixar aqui carinho e conforto para a família.
                        </p>

                        <QRCodeCanvas value={qrLink} size={180} className="mx-auto mb-4" />

                        <div className="space-y-2">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(qrLink);
                                    setCopiado(true);
                                    setTimeout(() => setCopiado(false), 2000);
                                }}
                                className="w-full bg-[#D1F2EB] text-[#007080] font-bold py-2 rounded-lg hover:bg-[#c1e8df] transition"
                            >
                                {copiado ? 'Link copiado!' : 'Copiar link'}
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="w-full border border-[#5BA58C] text-[#5BA58C] font-bold py-2 rounded-lg hover:bg-[#f1fdf9] transition"
                            >
                                Imprimir QR Code
                            </button>

                            <a
                                href={qrLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full bg-[#5BA58C] text-white text-center font-bold py-2 rounded-lg hover:bg-[#4a8c75] transition"
                            >
                                Abrir página de homenagem
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
