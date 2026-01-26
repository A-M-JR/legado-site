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
      'O aplicativo me ajudou a transformar a dor da perda em gratidão, criando um memorial digital que conecta gerações e fortalece os laços familiares.',
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
    <section id="depoimentos" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-serif font-bold text-legado-dark mb-6">
          Vozes que <span className="text-legado-gold">celebram a vida</span>
        </h2>
        <p className="text-base text-legado-dark/70 mb-16 max-w-2xl mx-auto">
          Depoimentos reais de pessoas que encontraram conforto, conexão e significado ao preservar suas memórias.
        </p>

        <div className="relative max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-12 transition-all duration-500">
          <p className="text-lg text-legado-dark italic mb-8 leading-relaxed">{content}</p>
          <div className="flex items-center justify-center space-x-4">
            <img
              src={image}
              alt={`Foto de ${name}`}
              loading="lazy"
              className="h-20 w-20 rounded-full object-cover border-4 border-legado-gold"
            />
            <div className="text-left">
              <h4 className="text-legado-dark font-semibold text-lg">{name}</h4>
              <p className="text-legado-gold text-sm">{role}</p>
            </div>
          </div>

          {/* Controles */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={prev}
              className="p-2 bg-legado-white rounded-full shadow hover:bg-legado-light transition"
              aria-label="Anterior"
            >
              <ChevronLeft className="text-legado-dark" />
            </button>

            <div className="flex space-x-3">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setIndex(idx)}
                  className={`h-3 w-3 rounded-full transition-all duration-300 ${idx === index ? 'bg-legado-gold scale-125' : 'bg-legado-gold/40'
                    }`}
                  aria-label={`Ir para depoimento ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="p-2 bg-legado-white rounded-full shadow hover:bg-legado-light transition"
              aria-label="Próximo"
            >
              <ChevronRight className="text-legado-dark" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}