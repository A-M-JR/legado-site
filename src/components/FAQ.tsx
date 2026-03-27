// src/components/FAQ.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: 'O que é o Instituto Legado?',
    answer:
      'O Legado é uma plataforma e instituto para preservação de memórias e gestão de memoriais digitais. Permite criar álbuns, registrar histórias de vida, compartilhar recordações com familiares e acessar suporte emocional especializado.',
  },
  {
    question: 'As memórias compartilhadas são privadas e seguras?',
    answer:
      'Sim. Você controla quem visualiza cada memória. Implementamos padrões de segurança e práticas de proteção de dados para garantir privacidade, com opções de álbuns privados, restritos ou públicos conforme sua escolha.',
  },
  {
    question: 'Como funciona o suporte psicológico oferecido?',
    answer:
      'Oferecemos conteúdos educativos e acesso a profissionais especializados em luto por meio da nossa plataforma. Em parceria com especialistas, disponibilizamos materiais, grupos e atendimentos que auxiliam no processo de acolhimento.',
  },
  {
    question: 'Posso acessar o Legado em diferentes dispositivos?',
    answer:
      'Sim. O Legado é uma plataforma web moderna e responsiva, acessível de qualquer dispositivo (celular, tablet ou computador) com internet. Suas memórias e conteúdos são sincronizados automaticamente.',
  },
];

export default function FAQ(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    // tenta recuperar do localStorage a aba aberta anteriormente
    try {
      const saved = localStorage.getItem('legado_faq_openIndex');
      return saved !== null ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const contentRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    // quando openIndex muda, ajusta a altura do painel para animação
    contentRefs.current.forEach((el, idx) => {
      if (!el) return;
      if (openIndex === idx) {
        // define maxHeight para scrollHeight permitindo transição suave
        el.style.maxHeight = `${el.scrollHeight}px`;
        el.style.paddingTop = '1rem';
        el.style.paddingBottom = '1rem';
      } else {
        // fecha
        el.style.maxHeight = '0px';
        el.style.paddingTop = '0px';
        el.style.paddingBottom = '0px';
      }
    });

    // salva preferência no localStorage
    try {
      localStorage.setItem('legado_faq_openIndex', JSON.stringify(openIndex));
    } catch {
      // ignore
    }
  }, [openIndex]);

  const toggle = (i: number) => {
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  return (
    <section id="faq" className="py-24 bg-legado-white border-t border-legado-gold/10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark">
            Perguntas <span className="text-legado-gold">Frequentes</span>
          </h2>
          <p className="mt-4 text-lg text-legado-dark font-bold max-w-3xl mx-auto italic">
            "Tire suas dúvidas sobre o Instituto Legado, privacidade, suporte e acessos."
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6" role="list">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            const contentId = `faq-content-${i}`;
            const buttonId = `faq-btn-${i}`;
            return (
              <div 
                key={i} 
                className={`bg-legado-white rounded-3xl shadow-xl border-l-[6px] transition-all duration-300 ${isOpen ? 'border-legado-gold shadow-2xl scale-[1.02]' : 'border-legado-gold/30 shadow-md'}`} 
                role="listitem"
              >
                <button
                  id={buttonId}
                  aria-controls={contentId}
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center p-8 focus:outline-none group"
                >
                  <span className={`text-lg md:text-xl font-bold text-left transition-colors duration-300 ${isOpen ? 'text-legado-gold' : 'text-legado-dark group-hover:text-legado-gold'}`}>
                    {faq.question}
                  </span>
                  <div className={`ml-4 p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-legado-gold text-legado-dark rotate-180' : 'bg-legado-gold/10 text-legado-gold'}`}>
                    <ChevronDown size={24} />
                  </div>
                </button>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={buttonId}
                  ref={(el) => (contentRefs.current[i] = el)}
                  className="transition-all duration-500 ease-in-out overflow-hidden px-8"
                  style={{
                    maxHeight: isOpen ? undefined : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <p className="leading-relaxed text-legado-dark font-medium text-lg py-6 border-t border-legado-gold/10">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}