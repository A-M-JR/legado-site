import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

export default function Sucesso() {
    const navigate = useNavigate();
    const { id } = useParams(); // pega o ID do dependente para voltar às recordações

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#eafbf7] to-[#d7f1ed] flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <FaHeart className="text-[#007080] text-4xl mb-4 mx-auto" />
                <h1 className="text-2xl font-bold text-[#007080] mb-2">Obrigado por sua homenagem 💙</h1>
                <p className="text-gray-700 mb-6">
                    Sua recordação foi enviada com sucesso e fará parte da memória daqueles que já se foram.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(`/recordacoes-publicas/${id}`)}
                        className="bg-[#007080] hover:bg-[#005f66] text-white font-bold py-2 px-6 rounded transition"
                    >
                        Voltar para as recordações
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-white border border-[#007080] text-[#007080] hover:bg-[#eafbf7] font-bold py-2 px-6 rounded transition"
                    >
                        Conheça nossa página
                    </button>
                </div>
            </div>
        </div>
    );
}
