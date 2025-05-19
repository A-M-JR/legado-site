import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'O que é o aplicativo Legado?',
    answer:
      'O Legado é um aplicativo que preserva e possibilita a família gerenciar memórias de pessoas queridas que já partiram. Ele permite criar álbuns digitais registrando histórias de vida, compartilhar recordações com familiares e acessar suporte emocional especializado durante o processo de luto.',
  },
  {
    question: 'As memórias compartilhadas são privadas e seguras?',
    answer:
      'Sim, a segurança e privacidade são prioridades. Você controla quem pode ver e pode apagar recordações que foram inseridas. Utilizamos tecnologias avançadas de criptografia e seguimos rigorosos padrões de proteção de dados para garantir que suas memórias permaneçam seguras e, se for sua opção, privadas.',
  },
  {
    question: 'Como funciona o suporte psicológico oferecido?',
    answer:
      'Temos parcerias com psicólogos especializados em luto que oferecem atendimento individual através do aplicativo. Além disso, disponibilizamos conteúdos educativos sobre o processo de luto e técnicas de bem-estar emocional, desenvolvidos por profissionais qualificados.',
  },
  {
    question: 'É possível acessar o aplicativo em diferentes dispositivos?',
    answer:
      'Sim, o APP Legado está disponível para smartphones iOS e Android, além de possuir uma versão web acessível de qualquer navegador. As recordações são sincronizadas em todos os dispositivos, garantindo acesso e gerenciamento de memórias onde você estiver.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section id="faq" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-legado-dark">
            Perguntas <span className="text-legado-gold">Frequentes</span>
          </h2>
          <p className="mt-4 text-legado-dark/70 max-w-3xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o APP Legado.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-legado-gold/40 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full flex justify-between items-center p-6 bg-legado-lightCream hover:bg-legado-light transition-colors focus:outline-none"
              >
                <span className="text-legado-dark font-medium text-lg">
                  {faq.question}
                </span>
                {openIndex === i ? (
                  <ChevronUp className="text-legado-gold h-6 w-6" />
                ) : (
                  <ChevronDown className="text-legado-gold h-6 w-6" />
                )}
              </button>
              <div
                className={`transition-max-height duration-500 ease-in-out overflow-hidden bg-legado-white text-legado-dark px-6 ${openIndex === i ? 'max-h-screen py-4' : 'max-h-0'
                  }`}
              >
                <p className="leading-relaxed text-justify">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
