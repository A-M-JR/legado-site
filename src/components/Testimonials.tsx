import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    content:
      'Preservar as memórias da minha família trouxe paz e união. O Legado é um espaço onde o amor e as histórias continuam vivos, mesmo quando a saudade aperta.',
    name: 'Ana Paula',
    role: 'Usuária Acolhida',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  },
  {
    id: 2,
    content:
      'Encontrar um lugar seguro para guardar as lembranças do meu avô foi fundamental para minha família. Aqui, celebramos a vida e mantemos viva a sua presença.',
    name: 'Carlos Eduardo',
    role: 'Membro da Família',
    image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
  },
  {
    id: 3,
    content:
      'O Instituto me ajudou a transformar a dor da perda em gratidão, criando um memorial digital que conecta gerações e fortalece os laços familiares.',
    name: 'Mariana Souza',
    role: 'Usuária Emocionada',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const { content, name, role, image } = testimonials[index];

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    const interval = setInterval(next, 8000); // muda a cada 8s
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="depoimentos" className="py-24 bg-legado-mid bg-opacity-10 border-t border-legado-gold/10">
      <div className="container mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark mb-6">
          Vozes que <span className="text-legado-gold">celebram a vida</span>
        </h2>
        <p className="text-lg text-legado-dark/70 mb-16 max-w-2xl mx-auto italic font-medium">
          "Depoimentos reais de pessoas que encontraram conforto e conexão ao preservar suas histórias."
        </p>

        <div className="relative max-w-3xl mx-auto bg-legado-white rounded-3xl shadow-2xl p-10 md:p-16 border-l-[6px] border-legado-gold transition-all duration-500 transform hover:scale-[1.01]">
          <div className="absolute top-8 left-8 text-legado-gold/20 opacity-50">
             <svg width="45" height="45" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 21C14.017 21 13 21 13 20C13 15 15 12 18 10L19.5 11.5C18 12.5 17 14 17 16H18.017C19.1216 16 20.017 16.8954 20.017 18V21C20.017 22.1046 19.1216 23 18.017 23H15.017C13.9124 23 13.017 22.1046 13.017 21ZM3.017 21L3.017 18C3.017 16.8954 3.91243 16 5.017 16H8.017C9.12157 16 10.017 16.8954 10.017 18V21C10.017 22.1046 9.12157 23 8.017 23H5.017C3.91243 23 3.017 22.1046 3.017 21ZM3.017 21C3.017 21 2 21 2 20C2 15 4 12 7 10L8.5 11.5C7 12.5 6 14 6 16H7.017C8.12157 16 9.017 16.8954 9.017 18V21C9.017 22.1046 8.12157 23 7.017 23H4.017C2.91243 23 2.017 22.1046 2.017 21Z"></path></svg>
          </div>
          
          <p className="text-xl md:text-2xl text-legado-dark italic mb-10 leading-relaxed font-serif">
            {content}
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 border-t border-legado-gold/10 pt-10">
            <img
              src={image}
              alt={`Foto de ${name}`}
              loading="lazy"
              className="h-24 w-24 rounded-full object-cover border-4 border-legado-gold shadow-lg"
            />
            <div className="text-center md:text-left">
              <h4 className="text-legado-dark font-bold text-xl uppercase tracking-wider">{name}</h4>
              <p className="text-legado-gold font-medium">{role}</p>
            </div>
          </div>

          {/* Controles */}
          <div className="mt-12 flex items-center justify-between">
            <button
              onClick={prev}
              className="p-3 bg-legado-gold text-legado-dark rounded-full shadow-lg hover:bg-legado-dark hover:text-white transition-all transform hover:scale-110"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex space-x-4">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndex(idx)}
                  className={`h-4 w-4 rounded-full transition-all duration-500 ${idx === index ? 'bg-legado-gold w-8 shadow-md' : 'bg-legado-gold/30 hover:bg-legado-gold/50'
                    }`}
                  aria-label={`Ir para depoimento ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-3 bg-legado-gold text-legado-dark rounded-full shadow-lg hover:bg-legado-dark hover:text-white transition-all transform hover:scale-110"
              aria-label="Próximo"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}