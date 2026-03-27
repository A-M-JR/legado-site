import { ArrowRight, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import banner from '../assets/tela-frase-ilc.png';

export default function Hero() {
  return (
    <section id="inicio" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-legado-white">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-legado-gold/5 -skew-x-12 transform origin-top-right" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-legado-mid/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
          {/* Conteúdo de Texto */}
          <div className="lg:w-3/5 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-legado-dark leading-tight mb-6">
                Preserve o <span className="text-legado-gold">amor</span>, <br />
                honre o <span className="text-legado-gold italic text-3xl md:text-5xl lg:text-6xl">Legado</span>.
              </h1>
              <p className="text-lg md:text-xl text-legado-dark font-medium mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                O Instituto Legado e Conforto oferece soluções humanas e digitais para acolher memórias, 
                organizar o cuidado e fortalecer os vínculos que o tempo jamais apaga.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#sobre"
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-legado-gold text-white px-8 py-4 rounded-2xl shadow-2xl shadow-legado-gold/30 hover:bg-legado-dark hover:text-white transition-all transform hover:-translate-y-1 font-bold text-lg group"
                >
                  Quero Conhecer
                  <ArrowRight size={22} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#contato"
                  className="w-full sm:w-auto inline-flex items-center justify-center border-2 border-legado-gold text-legado-dark px-8 py-4 rounded-2xl hover:bg-legado-gold/5 transition-all font-bold text-lg"
                >
                  <Heart size={20} className="mr-2 text-legado-gold" />
                  Contato
                </a>
              </div>
            </motion.div>
          </div>

          {/* Imagem de Destaque */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:w-2/5 relative"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-2 transition-transform duration-500">
               <img
                src={banner}
                alt="Legado e Conforto - Preservando Memórias"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decoração atrás da imagem */}
            <div className="absolute -inset-4 bg-legado-gold/20 rounded-[3.5rem] -rotate-3 z-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
