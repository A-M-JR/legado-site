import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section id="inicio" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden bg-[#FAFAF8]">
      {/* Background Decorativo Suave */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-[#70A97F]/5 -skew-x-12 transform origin-top-right z-0" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D4AF37]/5 rounded-full z-0" />
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            <div className="inline-flex items-center gap-2 bg-[#70A97F]/10 px-4 py-1.5 rounded-full text-[#2D5A4E] font-bold text-[10px] uppercase tracking-widest mb-6 border border-[#70A97F]/20">
              <Sparkles size={12} className="text-[#D4AF37]" />
              Instituto Legado e Conforto
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#2D5A4E] leading-[1.35] mb-6 heading-soft">
              A dor da perda não precisa ser <br className="hidden md:block" /> vivida em <span className="text-[#70A97F] italic mt-2 inline-block">silêncio.</span> <br />
              <span className="text-[#4A4A4A] mt-2 inline-block">E o cuidado com a vida não <br className="hidden md:block" /> deve terminar nunca.</span>
            </h1>
            
            <div className="max-w-2xl mx-auto mb-8">
               <p className="text-xl md:text-2xl text-[#70A97F] font-bold italic relative inline-block">
                "Porque toda vida deve ser cuidada e lembrada com carinho."
                <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-[#70A97F]/10 rounded-full" />
              </p>
            </div>

            <div className="w-16 h-0.5 bg-[#D4AF37]/30 mx-auto mb-8 rounded-full" />

            <p className="text-base md:text-lg text-[#4A4A4A] font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              O ILC existe para acolher, organizar e dar continuidade aos vínculos mais importantes da vida — no <strong className="text-[#70A97F]">LUTO</strong>, nos <strong className="text-[#70A97F]">CUIDADOS PALIATIVOS</strong> e na <strong className="text-[#70A97F]">AUTONOMIA DO IDOSO</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <a
                href="#caminhos"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-[#70A97F] text-white px-8 py-4 rounded-xl shadow-lg shadow-[#70A97F]/20 hover:bg-[#2D5A4E] transition-all transform hover:-translate-y-1 font-bold text-base group"
              >
                Conhecer Soluções
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#parceiros"
                className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-[#70A97F]/20 text-[#2D5A4E] px-8 py-4 rounded-xl hover:bg-white hover:border-[#70A97F] transition-all font-bold text-base group bg-white/50"
              >
                <Heart size={18} className="mr-2 text-[#70A97F] group-hover:fill-[#70A97F]" />
                Falar Conosco
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
