import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    content:
      'O Legado trouxe conforto durante um momento muito difícil. Poder ver e compartilhar memórias do meu pai com toda a família nos ajudou a transformar a dor em celebração da vida dele.',
    name: 'Mariana Silva',
    role: 'Usuária do Aplicativo',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
  },
  {
    id: 2,
    content:
      'A plataforma é intuitiva e respeitosa. Consigo manter vivas as histórias da minha avó de uma forma que nunca imaginei ser possível. É um verdadeiro tesouro digital.',
    name: 'Roberto Almeida',
    role: 'Usuário do Aplicativo',
    image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
  },
];

export default function Testimonials() {
  const [index, setIndex] = useState(0);
  const { content, name, role, image } = testimonials[index];

  const next = () => setIndex((i) => (i + 1) % testimonials.length);
  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="depoimentos" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-serif font-bold text-legado-dark mb-6">
          O que dizem sobre <span className="text-legado-gold">Legado</span>
        </h2>
        <p className="text-base text-legado-dark/70 mb-16 max-w-2xl mx-auto">
          Histórias reais de pessoas que encontraram conforto e valor com o APP Legado.
        </p>

        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="relative bg-legado-white rounded-3xl shadow-2xl p-8 md:p-12 overflow-hidden"
            >
              {/* Accent background shape */}
              <div className="absolute inset-0 bg-legado-gold/10 rotate-6 origin-center scale-150"></div>

              <div className="relative z-10">
                
                <p className="text-lg text-legado-dark italic mb-8 leading-relaxed">
                  {content}
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={image}
                    alt={name}
                    className="h-20 w-20 rounded-full object-cover border-4 border-legado-gold"
                  />
                  <div className="text-left">
                    <h4 className="text-legado-dark font-semibold text-lg">
                      {name}
                    </h4>
                    <p className="text-legado-gold text-sm">{role}</p>
                  </div>
                </div>

                {/* Navigation controls */}
                <div className="mt-8 flex items-center justify-between">
                  <button
                    onClick={prev}
                    className="p-2 bg-legado-white rounded-full shadow-lg hover:bg-legado-light transition-colors"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="text-legado-dark" />
                  </button>

                  <div className="flex space-x-3">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setIndex(idx)}
                        className={`h-3 w-3 rounded-full transition-transform duration-300 ${idx === index ? 'bg-legado-gold scale-125' : 'bg-legado-gold/40'
                          }`}
                        aria-label={`Depoimento ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={next}
                    className="p-2 bg-legado-white rounded-full shadow-lg hover:bg-legado-light transition-colors"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="text-legado-dark" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
