import React from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-24 bg-legado-mid bg-opacity-10 from-legado-mid/20 via-legado-mid/10 to-transparent">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-4xl mx-auto bg-legado-white rounded-3xl shadow-lg p-10 md:p-16 text-center"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark/90 mb-8 leading-tight">
            APP Legado: <span className="text-legado-gold">Porque toda vida merece ser lembrada com carinho.</span>
          </h2>

          <p className="text-base md:text-lg text-legado-dark/80 mb-12 leading-relaxed max-w-3xl mx-auto text-justify">
            O legado é o que permanece depois que a presença física se vai. É aquilo que não se pode tocar, mas se sente todos os dias: um valor ensinado sem palavras, um gesto de amor que ecoa nas gerações, um conselho simples que virou guia de vida. Na maioria das vezes, quem partiu deixou mais do que lembranças. Deixou exemplos de coragem, de afeto, de fé na vida. Deixou marcas invisíveis no coração de quem amou.
            <br /><br />
            E, através dessas marcas, continua vivendo. Cada história contada, cada valor repetido, cada gesto inspirado por sua memória, é o legado que transforma a ausência em presença eterna.
            <br /><br />
            Com o APP Legado, você eterniza memórias com amor. Deixe homenagens e mantenha viva a presença de quem será eterno em sua história! Seja bem-vindo(a) ao nosso Legado!
          </p>

          <a
            href="#contato"
            className="inline-flex items-center justify-center bg-legado-gold text-legado-black px-10 py-5 rounded-full shadow-xl hover:bg-legado-darkGold hover:text-legado-white transition-transform duration-300 ease-out hover:scale-105 font-semibold text-lg"
          >
            Fale Conosco <ArrowRight size={24} className="ml-3" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
