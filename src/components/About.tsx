import React from 'react';
import { Heart, Clock, Shield, Users } from 'lucide-react';
import imagem from '../assets/fotoantiga.png';

const About = () => {
  return (
    <section id="sobre" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark mb-2">
            <span className="text-legado-gold">Quem somos</span>
          </h2>
          <p className="text-xl text-legado-dark font-medium max-w-2xl mx-auto italic">
            "Nossa Missão é entregar conforto, cuidado e preservar o legado de amor das pessoas"
          </p>
        </div>

        <div className="grid grid-cols-12 mb-16">
          <div className="col-span-12 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold transform hover:scale-105 transition-transform duration-300">
            <div className="space-y-6 text-legado-dark text-lg leading-relaxed text-justify">
              <p>
                O <strong>ILC – Instituto Legado e Conforto</strong> nasceu do compromisso com o cuidado humano em todas as fases da vida. 
                Acreditamos que viver é mais do que existir — é ser visto, lembrado, acompanhado e respeitado em cada etapa do tempo.
              </p>
              <p>
                Atuamos na construção de soluções que unem acolhimento, memória, organização do cuidado e presença, 
                oferecendo apoio tanto para quem vive o luto quanto para quem está envelhecendo e deseja seguir vivendo com dignidade, autonomia e significado.
              </p>
              <p>
                Por meio de iniciativas como o <strong>Legado</strong>, voltado à preservação de memórias e ao acolhimento no luto, 
                e o <strong>Viva 60+</strong>, dedicado ao cuidado cotidiano da pessoa idosa, o Instituto cria um ecossistema que 
                acompanha o ser humano antes, durante e depois das grandes transições da vida.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-center gap-8 mb-16">
          <div className="md:w-1/2 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold transform hover:scale-105 transition-transform duration-300">
            <h4 className="font-serif font-bold text-legado-dark text-xl mb-6 uppercase tracking-wider">Nosso trabalho integra:</h4>
            <div className="space-y-4">
              {[
                "Cuidado emocional",
                "Registros de memória e história de vida",
                "Organização da saúde e da rotina",
                "Fortalecimento de vínculos familiares e sociais"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="bg-legado-gold rounded-full p-1 shrink-0 shadow-sm">
                    <Heart className="text-white h-3 w-3" />
                  </div>
                  <span className="text-legado-dark font-semibold">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-legado-dark/70 italic text-sm border-t border-legado-gold/20 pt-4">
              Tudo isso com uma linguagem simples, acessível e profundamente respeitosa.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src={imagem}
              alt="Preservando a vida e as memórias com carinho"
              width="600"
              height="400"
              loading="lazy"
              className="rounded-3xl shadow-lg w-full max-w-md object-cover aspect-[4/3]"
            />
          </div>
        </div>

        {/* Parcerias e Finalização - Novo Estilo com Alto Contraste */}
        <div className="bg-legado-white rounded-3xl p-10 md:p-16 text-center mb-16 shadow-2xl border-l-[6px] border-legado-gold relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto">
            <p className="text-legado-gold font-bold uppercase tracking-widest mb-6">Presença Contínua</p>
            <p className="text-legado-dark text-lg md:text-xl leading-relaxed mb-10 font-medium">
              O ILC atua em parceria com funerárias, prefeituras, planos assistenciais e instituições, levando soluções humanas, 
              digitais e sociais que ampliam o olhar sobre o cuidado — não apenas como assistência, mas como presença contínua.
            </p>
            <h3 className="text-2xl md:text-4xl font-serif font-bold text-legado-dark mb-6">
              Cuidar, para nós, é caminhar junto.
            </h3>
            <p className="text-legado-gold text-2xl font-serif italic mb-10">
              "É acolher o passado, cuidar do presente e honrar a vida em toda a sua trajetória."
            </p>
            <div className="mt-8 text-xl border-t border-legado-gold/20 pt-8 text-legado-dark font-bold">
              Porque toda vida merece ser lembrada com carinho.
            </div>
          </div>
          {/* Decoração suave para preencher o contexto */}
          <Heart className="absolute -bottom-10 -right-10 w-64 h-64 text-legado-gold/5 -rotate-12" />
          <Users className="absolute -top-10 -left-10 w-64 h-64 text-legado-dark/5 rotate-12" />
        </div>
      </div>
    </section>
  );
};

export default About;
