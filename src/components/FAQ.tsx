import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    question: 'O que é o aplicativo Legado?',
    answer:
      'O Legado é um aplicativo que ajuda a preservar e gerenciar memórias de entes queridos que já partiram. Ele permite criar álbuns digitais, registrar histórias de vida, compartilhar recordações com familiares e acessar suporte emocional especializado durante o processo de luto.',
  },
  {
    question: 'Como funciona a parceria com empresas de planos funerários?',
    answer:
      'Oferecemos uma solução tecnológica que as empresas de planos funerários podem incluir como um benefício adicional aos seus clientes. O aplicativo complementa os serviços tradicionais, proporcionando um espaço digital para preservação de memórias e suporte emocional após a perda.',
  },
  {
    question: 'As memórias compartilhadas são privadas e seguras?',
    answer:
      'Sim, a segurança e privacidade são prioridades. Você controla quem pode ver e contribuir para as recordações. Utilizamos tecnologias avançadas de criptografia e seguimos rigorosos padrões de proteção de dados para garantir que suas memórias permaneçam seguras e privadas.',
  },
  {
    question: 'Como funciona o suporte psicológico oferecido?',
    answer:
      'Temos parcerias com psicólogos especializados em luto que oferecem atendimento individual através do aplicativo. Além disso, disponibilizamos conteúdos educativos sobre o processo de luto e técnicas de bem-estar emocional, desenvolvidos por profissionais qualificados.',
  },
  {
    question: 'É possível acessar o aplicativo em diferentes dispositivos?',
    answer:
      'Sim, o Legado está disponível para smartphones iOS e Android, além de possuir uma versão web acessível de qualquer navegador. As recordações são sincronizadas em todos os dispositivos, garantindo que você possa acessar e gerenciar memórias de onde estiver.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-[#F8F6E9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Perguntas <span className="text-[#D4B74C]">Frequentes</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o Legado e 
            como podemos ajudar você ou sua empresa.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 border border-[#D4B74C]/30 rounded-lg overflow-hidden bg-white"
            >
              <button
                className="w-full text-left p-6 focus:outline-none flex justify-between items-center"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="text-lg font-medium text-[#8A7A42]">
                  {faq.question}
                </h3>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-[#D4B74C]" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-[#D4B74C]" />
                )}
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-600 border-t border-[#D4B74C]/20">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;