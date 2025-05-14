import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    content:
      'O Legado trouxe conforto durante um momento muito difícil. Poder ver e compartilhar memórias do meu pai com toda a família nos ajudou a transformar a dor em celebração da vida dele.',
    name: 'Mariana Silva',
    role: 'Usuária do Aplicativo',
    image:
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
  {
    id: 2,
    content:
      'Como empresa de planos funerários, o Legado nos permitiu oferecer um serviço diferenciado que vai além do convencional. Nossos clientes valorizam muito essa tecnologia que preserva memórias.',
    name: 'Carlos Mendes',
    role: 'Diretor de Empresa de Planos Funerários',
    image:
      'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
  {
    id: 3,
    content:
      'A plataforma é intuitiva e respeitosa. Consigo manter vivas as histórias da minha avó de uma forma que nunca imaginei ser possível. É um verdadeiro tesouro digital.',
    name: 'Roberto Almeida',
    role: 'Usuário do Aplicativo',
    image:
      'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750',
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <section id="depoimentos" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            O que dizem sobre <span className="text-[#D4B74C]">Legado</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Histórias reais de pessoas que encontraram conforto e valor com o APP Legado; preservando memórias e revivendo momentos felizes.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 -mt-6 -ml-4">
            <Quote className="h-12 w-12 text-[#D4B74C]/30" />
          </div>

          <div className="bg-[#F5F3E4] rounded-xl p-8 md:p-12 shadow-md">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 flex justify-center">
                <img
                  src={testimonials[currentIndex].image}
                  alt={testimonials[currentIndex].name}
                  className="rounded-full h-32 w-32 object-cover border-4 border-[#D4B74C]/30"
                />
              </div>
              <div className="md:w-2/3 text-center md:text-left">
                <p className="text-lg md:text-xl text-gray-700 italic mb-6 text-justify leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </p>
                <div>
                  <h4 className="text-[#8A7A42] font-semibold text-lg">
                    {testimonials[currentIndex].name}
                  </h4>
                  <p className="text-[#D4B74C]">{testimonials[currentIndex].role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 -mb-6 -mr-4">
            <Quote className="h-12 w-12 text-[#D4B74C]/30 transform rotate-180" />
          </div>

          <div className="flex justify-center mt-8 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-3 w-3 rounded-full ${
                  index === currentIndex ? 'bg-[#D4B74C]' : 'bg-[#D4B74C]/30'
                }`}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>

          <div className="absolute top-1/2 -left-4 md:-left-12 transform -translate-y-1/2">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-[#F5F3E4] transition-colors"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="h-6 w-6 text-[#8A7A42]" />
            </button>
          </div>

          <div className="absolute top-1/2 -right-4 md:-right-12 transform -translate-y-1/2">
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-white shadow-md hover:bg-[#F5F3E4] transition-colors"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="h-6 w-6 text-[#8A7A42]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
