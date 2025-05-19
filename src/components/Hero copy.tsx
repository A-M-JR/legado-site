import React from 'react';
import { ArrowRight } from 'lucide-react';
import imagem from '../assets/imagem.png';


export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative isolate overflow-hidden bg-gradient-to-b from-[#F5F3E4] to-[#F8F6E9] py-28 sm:py-36"
    >
      {/* Decorativa */}
      <div className="absolute inset-x-0 -top-20 -z-10 transform-gpu blur-3xl">
        <div className="aspect-[1155/678] w-full bg-gradient-to-tr from-[#D4B74C] to-[#8A7A42] opacity-10 rounded-full h-96 mx-auto rotate-45" />
      </div>

      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid max-w-7xl grid-cols-1 md:grid-cols-2 items-center gap-12">

          {/* Texto */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-serif font-bold tracking-tight text-[#8A7A42] sm:text-5xl lg:text-6xl">
              Honre quem partiu,{' '}
              <span className="text-[#D4B74C]">preserve quem vive em você!</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-700 max-w-xl">
              Com o <strong>Legado & Conforto</strong>, você eterniza memórias com amor.
              Deixe homenagens e mantenha viva a presença de quem é eterno em sua história.

            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <a
                href="#contato"
                className="inline-flex items-center justify-center rounded-md bg-legado-gold px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-[#C3A53B] transition"
              >
                Saiba mais
                <ArrowRight size={18} className="ml-2" />
              </a>
              <a
                href="#recursos"
                className="inline-flex items-center justify-center rounded-md border-2 border-[#D4B74C] px-6 py-3 text-base font-semibold text-[#8A7A42] hover:bg-[#f5f3e4] transition"
              >
                Ver recursos
              </a>
            </div>
          </div>

          {/* Imagem com glow */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-md rounded-3xl shadow-lg overflow-hidden">
              <div className="absolute -inset-2 bg-legado-gold/30 blur-xl rounded-3xl animate-pulse -z-10"></div>
              <img
                src={imagem}
                alt="Pessoa segurando foto antiga"
                className="w-full object-cover h-[380px] md:h-[460px] rounded-3xl transition-transform duration-300 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
