import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

export default function Sucesso() {
    const navigate = useNavigate();
    const { id } = useParams(); // agora virá corretamente com o fix na navegação

    return (
        <div className="min-h-screen bg-[#E3F1EB] flex items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full border border-[#D1F2EB]">
                <FaHeart className="text-[#5BA58C] text-4xl mb-4 mx-auto" />
                <h1 className="text-2xl font-bold text-[#007080] mb-2">Obrigado por sua homenagem 💙</h1>
                <p className="text-[#444] mb-6">
                    Sua recordação foi enviada com sucesso e fará parte da memória daqueles que já se foram.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(id ? `/recordacoes-publicas/${id}` : '/')}
                        className="bg-[#5BA58C] hover:bg-[#4a8c75] text-white font-bold py-2 px-6 rounded transition"
                    >
                        Voltar para as recordações
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-white border border-[#5BA58C] text-[#007080] hover:bg-[#D1F2EB] font-bold py-2 px-6 rounded transition"
                    >
                        Conheça nossa página
                    </button>
                </div>
            </div>
        </div>
    );
}
