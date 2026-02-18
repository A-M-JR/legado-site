// src/components/FAQ.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: 'O que é o aplicativo Legado?',
    answer:
      'O Legado é uma plataforma e aplicativo para preservação de memórias e gestão de memoriais digitais. Permite criar álbuns, registrar histórias de vida, compartilhar recordações com familiares e acessar suporte emocional especializado.',
  },
  {
    question: 'As memórias compartilhadas são privadas e seguras?',
    answer:
      'Sim. Você controla quem visualiza cada memória. Implementamos padrões de segurança e práticas de proteção de dados para garantir privacidade, com opções de álbuns privados, restritos ou públicos conforme sua escolha.',
  },
  {
    question: 'Como funciona o suporte psicológico oferecido?',
    answer:
      'Oferecemos conteúdos educativos e acesso a profissionais especializados em luto por meio do aplicativo. Em parceria com especialistas, disponibilizamos materiais, grupos e atendimentos que auxiliam no processo de acolhimento.',
  },
  {
    question: 'Posso acessar o Legado em diferentes dispositivos?',
    answer:
      'Sim. O APP Legado está disponível para iOS, Android e também possui versão web. Seus álbuns e conteúdos são sincronizados entre dispositivos para acesso onde você estiver.',
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
    <section id="faq" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-legado-dark">
            Perguntas <span className="text-legado-gold">Frequentes</span>
          </h2>
          <p className="mt-4 text-legado-dark/70 max-w-3xl mx-auto">
            Encontre respostas rápidas e claras sobre o APP Legado, privacidade, suporte e acessos.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4" role="list">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            const contentId = `faq-content-${i}`;
            const buttonId = `faq-btn-${i}`;
            return (
              <div key={i} className="border border-legado-gold/40 rounded-xl overflow-hidden" role="listitem">
                <button
                  id={buttonId}
                  aria-controls={contentId}
                  aria-expanded={isOpen}
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center p-6 bg-legado-lightCream hover:bg-legado-light transition-colors focus:outline-none focus:ring-4 focus:ring-legado-gold/20"
                >
                  <span className="text-legado-dark font-medium text-lg text-left">
                    {faq.question}
                  </span>
                  <span className="ml-4 inline-flex items-center">
                    {isOpen ? (
                      <ChevronUp className="text-legado-gold h-6 w-6" aria-hidden />
                    ) : (
                      <ChevronDown className="text-legado-gold h-6 w-6" aria-hidden />
                    )}
                  </span>
                </button>

                <div
                  id={contentId}
                  role="region"
                  aria-labelledby={buttonId}
                  ref={(el) => (contentRefs.current[i] = el)}
                  className="transition-[max-height,padding] duration-500 ease-in-out overflow-hidden bg-legado-white text-legado-dark px-6"
                  style={{
                    maxHeight: isOpen ? undefined : '0px',
                    paddingTop: isOpen ? undefined : '0px',
                    paddingBottom: isOpen ? undefined : '0px',
                  }}
                >
                  <p className="leading-relaxed text-justify py-4">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}