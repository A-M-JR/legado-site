import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Partners = () => {
  return (
    <section id="parceiros" className="py-20 bg-[#F8F6E9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Nossos <span className="text-[#D4B74C]">Parceiros</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Contamos com profissionais especializados para oferecer suporte
            emocional e psicológico a quem enfrenta o processo de luto.
          </p>
        </div>

        {/* Profissional Parceira (exemplo comentado para uso futuro) */}
        {/* 
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-[#D4B74C]/10 flex items-center justify-center p-8">
              <img
                src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg"
                alt="Dra. Ana Beatriz Silva"
                className="rounded-full h-48 w-48 object-cover border-4 border-[#D4B74C]/30"
              />
            </div>
            <div className="md:w-2/3 p-8">
              <span className="uppercase tracking-wide text-sm text-[#D4B74C] font-semibold">
                Psicóloga Parceira
              </span>
              <h3 className="mt-2 text-2xl font-serif font-semibold text-[#8A7A42]">
                Dra. Ana Beatriz Silva
              </h3>
              <p className="mt-1 text-[#D4B74C]">
                CRP: 06/12345 - Especialista em Luto e Processos de Perda
              </p>
              <p className="mt-4 text-gray-600 leading-relaxed text-justify">
                Profissional com 15 anos de experiência no acompanhamento de 
                pessoas em processo de luto. Oferece suporte terapêutico 
                especializado, ajudando no enfrentamento da dor da perda e na 
                reconexão com memórias positivas.
              </p>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-[#D4B74C] mr-3" />
                  <span className="text-gray-600">(11) 98765-4321</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#D4B74C] mr-3" />
                  <span className="text-gray-600">
                    dra.anabeatriz@consultorio.com.br
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-[#D4B74C] mr-3" />
                  <span className="text-gray-600">
                    Av. Paulista, 1000 - Conjunto 123, São Paulo/SP
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <a
                  href="#contato"
                  className="inline-flex items-center px-4 py-2 bg-[#D4B74C] text-white rounded-md hover:bg-[#C3A53B] transition-colors"
                >
                  Solicitar Atendimento
                </a>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Empresas Parceiras */}
        <div className="text-center mt-20">
          <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
            Empresas Parceiras
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Se a sua empresa de Plano Assistencial deseja inovar e se destacar, o App Legado pode ser o diferencial que você procura. Entre em contato conosco e descubra como integrar o App ao seu portfólio, agregando valor, fortalecendo a relação com seus clientes e tornando seu plano ainda mais competitivo e relevante no mercado. Vamos juntos oferecer mais significado e cuidado a quem confia em você.
          </p>

          {/* Cards de empresas (comentado para uso futuro) */}
          {/* 
          <div className="flex flex-wrap justify-center gap-6 opacity-80">
            {['Plano Paz', 'Memorial Vida', 'Grupo Serenidade', 'Eterniza'].map((nome, index) => (
              <div
                key={index}
                className="bg-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 min-w-[180px]"
              >
                <p className="text-xl font-serif font-medium text-[#8A7A42]">{nome}</p>
              </div>
            ))}
          </div>
          */}
        </div>
      </div>
    </section>
  );
};

export default Partners;
