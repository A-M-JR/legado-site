import React from 'react';
import { ArrowRight } from 'lucide-react';
import banner from '../assets/tela-frase.png';

export default function Hero() {
  return (
    <div className="relative w-full">
      {/* Banner responsivo */}
      <img
        src={banner}
        alt="Legado Banner"
        className="w-full h-auto object-cover"
      />

      {/* Container semi-transparente para melhor legibilidade */}
      {/* <div className="flex items-center justify-center px-4 w-full max-w-screen-sm mx-auto mt-10 md:mt-20">
        <div className="bg-white/60 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 w-full max-w-xs md:max-w-none">
          <a
            href="#contato"
            className="inline-flex items-center justify-center rounded-md bg-legado-mid px-8 py-4 text-lg font-semibold text-legado-white shadow-lg hover:bg-legado-dark transition w-full md:w-auto"
          >
            Saiba mais
            <ArrowRight size={20} className="ml-2" />
          </a>
          <a
            href="#recursos"
            className="inline-flex items-center justify-center rounded-md border-2 border-legado-mid px-8 py-4 text-lg font-semibold text-legado-dark hover:bg-legado-mid/20 transition w-full md:w-auto"
          >
            Ver recursos
          </a>
        </div>
      </div> */}
    </div>
  );
};
