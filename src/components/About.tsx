import React from 'react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="sobre" className="py-16 bg-[#FAFAF8] relative overflow-hidden">
      {/* Elementos Decorativos */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#70A97F]/5 rounded-full z-0" />
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#2D5A4E] mb-3 uppercase tracking-widest">
              Sobre o <span className="text-[#70A97F]">ILC</span>
            </h2>
            <div className="w-16 h-1 bg-[#70A97F]/30 mx-auto rounded-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white p-10 md:p-16 rounded-[3rem] shadow-sm border border-[#70A97F]/10 text-center"
          >
            <div className="space-y-6 text-[#4A4A4A] text-lg md:text-xl leading-relaxed font-medium">
              <p>
                Existem momentos na vida em que tudo muda.
              </p>
              <p>
                E, justamente nesses momentos, as pessoas mais precisam de apoio — mas encontram burocracia, desorganização e solidão.
              </p>
              <p className="text-[#70A97F] font-bold text-xl md:text-2xl my-8">
                O ILC nasceu para mudar isso.
              </p>
              <p>
                Criamos uma solução que une tecnologia e acolhimento humano para cuidar das pessoas antes, durante e depois dos momentos mais delicados da vida.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
