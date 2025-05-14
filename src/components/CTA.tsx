import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-[#F8F6E9] to-[#F5F3E4]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-6 leading-snug">
            APP Legado: <span className="text-balance">Porque toda vida merece ser lembrada com carinho.</span>
          </h2>

          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed text-balance">
            Junte-se a nós na missão de honrar legados e trazer conforto através de recordações. Seja você uma empresa de planos funerários ou alguém buscando preservar memórias preciosas.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#contato"
              className="bg-[#D4B74C] hover:bg-[#C3A53B] text-white px-8 py-4 rounded-full shadow-lg transition-all duration-300 text-lg font-medium inline-flex items-center justify-center gap-2"
            >
              Fale Conosco <ArrowRight size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
