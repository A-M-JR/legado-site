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
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Contamos com profissionais especializados para oferecer suporte
            emocional e psicológico a quem enfrenta o processo de luto.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 bg-[#D4B74C]/10">
              <div className="h-full flex items-center justify-center p-8">
                <img
                  src="https://images.pexels.com/photos/5699456/pexels-photo-5699456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                  alt="Dra. Ana Beatriz Silva"
                  className="rounded-full h-48 w-48 object-cover border-4 border-[#D4B74C]/30"
                />
              </div>
            </div>
            
            <div className="md:w-2/3 p-8">
              <div className="uppercase tracking-wide text-sm text-[#D4B74C] font-semibold">
                Psicóloga Parceira
              </div>
              <h3 className="mt-2 text-2xl font-serif font-semibold text-[#8A7A42]">
                Dra. Ana Beatriz Silva
              </h3>
              <p className="mt-1 text-[#D4B74C]">
                CRP: 06/12345 - Especialista em Luto e Processos de Perda
              </p>
              
              <p className="mt-4 text-gray-600">
                Profissional com 15 anos de experiência no acompanhamento de 
                pessoas em processo de luto. Oferece suporte terapêutico 
                especializado, ajudando no enfrentamento da dor da perda e na 
                reconexão com memórias positivas.
              </p>
              
              <div className="mt-6 space-y-3">
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
        
        <div className="text-center mt-16">
          <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-4">
            Empresas Parceiras
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
            Trabalhamos com diversas empresas de planos funerários para oferecer 
            nossos serviços digitais como complemento ao atendimento tradicional.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 opacity-70">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xl font-serif text-[#8A7A42]">Plano Paz</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xl font-serif text-[#8A7A42]">Memorial Vida</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xl font-serif text-[#8A7A42]">Grupo Serenidade</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <p className="text-xl font-serif text-[#8A7A42]">Eterniza</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;