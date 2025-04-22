import React from 'react';
import { ArrowRight } from 'lucide-react';

const CTA = () => {
  return (
    <section className="py-20 bg-[#D4B74C]/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-6">
            Pronto para transformar a forma como preservamos{' '}
            <span className="text-[#D4B74C]">memórias</span>?
          </h2>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl mx-auto">
            Junte-se a nós na missão de honrar legados e trazer conforto 
            através de recordações. Seja você uma empresa de planos funerários 
            ou alguém buscando preservar memórias preciosas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#contato"
              className="bg-[#D4B74C] text-white px-8 py-4 rounded-md hover:bg-[#C3A53B] transition-colors font-medium text-center shadow-md flex items-center justify-center gap-2"
            >
              Fale Conosco <ArrowRight size={18} />
            </a>
            <a
              href="#parceiros"
              className="border-2 border-[#D4B74C] text-[#8A7A42] px-8 py-4 rounded-md hover:bg-[#F0ECD9] transition-colors font-medium text-center"
            >
              Conheça Nossos Parceiros
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;