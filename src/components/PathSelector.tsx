import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface PathSelectorProps {
  onSelect: (path: 'luto' | 'idoso' | 'paliativo') => void;
  selectedPath: 'luto' | 'idoso' | 'paliativo' | null;
}

const PathSelector: React.FC<PathSelectorProps> = ({ onSelect, selectedPath }) => {
  const paths = [
    {
      id: 'luto' as const,
      title: 'Luto',
      description: 'Para quem está vivendo a perda de alguém e precisa de acolhimento, organização e um espaço para manter viva a memória.',
      cta: 'QUERO APOIO NO LUTO',
      emoji: '🖤'
    },
    {
      id: 'idoso' as const,
      title: 'Envelhecer com autonomia também é continuar sendo cuidado',
      description: 'O ILC ajuda idosos e famílias a manterem vínculo, organização e cuidado contínuo com mais leveza, presença e segurança emocional.',
      cta: 'CONHECER O CUIDADO CONTÍNUO',
      emoji: '👵'
    },
    {
      id: 'paliativo' as const,
      title: 'Tratamentos paliativos',
      description: 'Para famílias que estão passando por momentos delicados e precisam de suporte, cuidado e organização emocional.',
      cta: 'QUERO APOIO EM CUIDADOS PALIATIVOS',
      emoji: '🌿'
    }
  ];

  return (
    <section id="caminhos" className="py-16 bg-white relative">
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2D5A4E] mb-6">
              Escolha seu <span className="text-[#70A97F] italic">caminho</span>
            </h2>
            <div className="w-16 h-1 bg-[#70A97F]/30 mx-auto mb-8 rounded-full" />
            <p className="text-lg text-[#4A4A4A] max-w-2xl mx-auto font-bold">
              Selecione uma das frentes abaixo para ver o conteúdo especializado e receber o apoio que você precisa.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {paths.map((path) => (
            <motion.div
              key={path.id}
              whileHover={{ y: -10 }}
              onClick={() => onSelect(path.id)}
              className={`group cursor-pointer rounded-[3rem] p-8 md:p-12 transition-all duration-500 border-2 flex flex-col h-full text-center ${
                selectedPath === path.id 
                  ? 'border-[#70A97F] shadow-xl bg-[#FAFAF8] scale-105' 
                  : 'border-transparent bg-gray-50 shadow-sm hover:shadow-lg hover:border-[#70A97F]/20'
              }`}
            >
              <div className="mb-6 md:mb-8">
                <span className="text-5xl md:text-6xl block mb-4 md:mb-6 transform transition-transform group-hover:scale-125 duration-500">{path.emoji}</span>
                <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2D5A4E] group-hover:text-[#70A97F] transition-colors leading-tight">
                  {path.title}
                </h3>
              </div>

              <p className="text-[#4A4A4A] mb-8 md:mb-12 font-medium leading-relaxed flex-grow text-base md:text-lg">
                {path.description}
              </p>

              <button className={`w-full py-4 md:py-5 rounded-xl md:rounded-2xl font-bold transition-all flex items-center justify-center gap-2 md:gap-3 text-xs md:text-sm tracking-widest uppercase ${
                selectedPath === path.id 
                  ? 'bg-[#70A97F] text-white shadow-lg shadow-[#70A97F]/20' 
                  : 'bg-[#2D5A4E] text-white group-hover:bg-[#70A97F]'
              }`}>
                {path.cta}
                <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform shrink-0" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PathSelector;
