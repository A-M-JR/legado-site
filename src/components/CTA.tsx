import React from 'react';
import { ArrowRight, Heart, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-gradient-to-b from-transparent via-[#f4fbf8] to-[#eaf7f1]">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          className="max-w-5xl mx-auto bg-white rounded-[3rem] shadow-2xl shadow-emerald-100/50 p-10 md:p-20 text-center border border-[#f0f7f4] relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
        >
          {/* Elemento decorativo sutil */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#5ba58c] via-[#255f4f] to-[#5ba58c]" />

          <Heart className="mx-auto text-[#5ba58c] mb-8 h-12 w-12 fill-[#5ba58c]/10" />

          <h2 className="text-3xl md:text-5xl font-bold text-[#255f4f] mb-8 leading-tight">
            O amor não termina, <br />
            <span className="text-[#5ba58c]">ele se transforma em Legado.</span>
          </h2>

          <div className="text-base md:text-lg text-[#6b8c7d] mb-12 leading-relaxed max-w-3xl mx-auto space-y-6">
            <p>
              O legado é o que permanece quando a presença física se vai. É o valor ensinado sem palavras, o gesto de amor que ecoa nas gerações e o conselho que vira guia de vida.
            </p>
            <p className="font-medium text-[#255f4f]">
              Com o <strong>APP Legado</strong>, você transforma a saudade em uma celebração eterna.
              Mantenha viva a história de quem sempre será importante para você.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Botão Principal - Conversão de Novos */}
            <a
              href="#contato"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-[#5ba58c] text-white px-10 py-5 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-[#4a8a75] transition-all duration-300 hover:-translate-y-1 font-bold text-lg group"
            >
              Quero conhecer o Legado
              <ArrowRight size={22} className="ml-3 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* Botão Secundário - Retenção de Atuais */}
            <button
              onClick={() => navigate('/legado-app/login')}
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white text-[#255f4f] border-2 border-[#d1e5dc] px-10 py-5 rounded-2xl hover:bg-[#f4fbf8] transition-all duration-300 font-bold text-lg"
            >
              <LogIn size={20} className="mr-3" />
              Acessar minha conta
            </button>
          </div>

          <p className="mt-8 text-sm text-[#9db4aa] font-medium">
            Disponível Web.
          </p>
        </motion.div>
      </div>
    </section>
  );
}