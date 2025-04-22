import React from 'react';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section
      id="inicio"
      className="pt-28 pb-20 md:pt-32 md:pb-24 bg-gradient-to-b from-[#F5F3E4] to-[#F8F6E9]"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#8A7A42] leading-tight mb-4">
              Preservando memórias,{' '}
              <span className="text-[#D4B74C]">honrando legados</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-lg">
              O aplicativo que ajuda você a manter vivas as recordações dos seus 
              entes queridos, transformando a dor da perda na beleza da memória.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contato"
                className="bg-[#D4B74C] text-white px-6 py-3 rounded-md hover:bg-[#C3A53B] transition-colors font-medium text-center flex items-center justify-center gap-2 shadow-md"
              >
                Saiba Mais <ArrowRight size={18} />
              </a>
              <a
                href="#recursos"
                className="border-2 border-[#D4B74C] text-[#8A7A42] px-6 py-3 rounded-md hover:bg-[#F0ECD9] transition-colors font-medium text-center"
              >
                Ver Recursos
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-[#D4B74C]/20 rounded-full blur-xl animate-pulse"></div>
              <img
                src="https://images.pexels.com/photos/7108344/pexels-photo-7108344.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
                alt="Familia recordando memorias"
                className="relative rounded-2xl shadow-lg max-w-full h-auto object-cover z-10"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;