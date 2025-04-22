import React from 'react';
import { Heart, Clock, Shield, Users } from 'lucide-react';

const About = () => {
  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Sobre o <span className="text-[#D4B74C]">Legado</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Mais do que um aplicativo, somos uma plataforma que conecta 
            memórias, emoções e pessoas. Ajudamos empresas de planos 
            funerários a oferecerem um valor único aos seus clientes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Heart className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Cuidado Emocional</h3>
            <p className="text-gray-600">
              Fornecemos suporte emocional através da preservação de memórias e 
              conexão com suporte psicológico profissional.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Clock className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Acesso Permanente</h3>
            <p className="text-gray-600">
              Oferecemos um espaço digital onde recordações podem ser preservadas 
              e acessadas por gerações futuras.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Shield className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Segurança e Privacidade</h3>
            <p className="text-gray-600">
              Protegemos suas memórias e informações pessoais com os mais altos 
              padrões de segurança digital.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Conexão Familiar</h3>
            <p className="text-gray-600">
              Facilitamos o compartilhamento de recordações entre familiares, 
              fortalecendo laços mesmo após a partida.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-[#F5F3E4] p-8 md:p-12 rounded-2xl shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#8A7A42] mb-4">
                Nossa Missão
              </h3>
              <p className="text-gray-600 mb-4">
                O Legado nasceu da compreensão de que a dor da perda pode ser 
                amenizada quando transformamos luto em celebração de memórias.
              </p>
              <p className="text-gray-600">
                Trabalhamos com empresas de planos funerários para oferecer uma 
                solução tecnológica que transcende o serviço tradicional, 
                proporcionando conforto e preservação de histórias de vida para 
                as famílias.
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src="https://images.pexels.com/photos/7641915/pexels-photo-7641915.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="Pessoa olhando foto antiga"
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;