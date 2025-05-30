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
          <p className="text-lg text-legado-dark/70 max-w-2xl mx-auto">
            A nossa missão é eternizar memórias com amor e cuidado.
          </p>
        </div>

        <div className="grid grid-cols-12 mb-16">
          <div className="col-span-12 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold transform hover:scale-105 transition-transform duration-300">
            <p className="text-legado-dark text-base leading-relaxed text-justify mb-4">
              Somos a Empresa Legado&Conforto e aqui lhe apresentamos carinhosamente um dos nossos produtos: APP Legado. Mais do que um aplicativo, somos uma plataforma que conecta memórias, emoções e pessoas. Sabemos que a perda de alguém especial é um dos momentos mais difíceis da vida. As lembranças que temos dessas pessoas são preciosas, e muitas vezes queremos uma maneira de guardá-las para sempre, tendo a certeza de que estarão ao nosso alcance.
            </p>
            <p className="text-legado-dark text-base leading-relaxed text-justify">
              Foi pensando nisso que criamos o APP LEGADO; uma plataforma para preservar e compartilhar memórias de quem partiu, de forma íntima, significativa e segura. Com o tempo, memórias podem se perder, histórias podem sim ser esquecidas, e as vozes das pessoas que amamos e que se foram tendem a parecer mais distantes. Por mais dor que isso possa trazer, é a realidade. O APP LEGADO permite que famílias e amigos registrem fotos e mensagens de momentos especiais, criando um memorial digital que mantém viva a presença de quem foi importante para você.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse md:flex-row items-center gap-8 mb-16">
          <div className="md:w-1/2 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold transform hover:scale-105 transition-transform duration-300">
            <p className="text-legado-dark text-base leading-relaxed mb-4">
              O APP Legado nasceu da compreensão de que a dor da perda pode ser amenizada quando transformamos o luto em celebração e gratidão por ter vivido um precioso tempo com aquela pessoa que sempre será importante para você.
            </p>
            <p className="text-legado-dark text-base leading-relaxed mb-4">
              O que oferecemos é um espaço digital para guardar lembranças, compartilhar histórias e manter viva a memória de quem se foi.
            </p>
            <p className="text-legado-dark text-base leading-relaxed">
              "Nosso propósito é preservar o que é mais precioso: as memórias, o amor e a história de quem jamais será esquecido."</p>
          </div>
          <div className="md:w-1/2 flex justify-center">

            <img
              src={imagem}
              alt="Foto antiga"
              width="600"
              height="400"
              loading="lazy"
              className="rounded-3xl shadow-lg w-full max-w-md object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: <Heart className="h-10 w-10 text-legado-gold" />,
              title: 'Cuidado Emocional',
              text: 'Transformamos a dor da perda em conforto, celebrando memórias com gratidão.'
            },
            {
              icon: <Clock className="h-10 w-10 text-legado-gold" />,
              title: 'Acesso Permanente',
              text: 'Suas memórias disponíveis sempre, conforme seu termo de adesão.'
            },
            {
              icon: <Shield className="h-10 w-10 text-legado-gold" />,
              title: 'Privacidade Segura',
              text: 'Controle total: regiões privadas ou públicas, acesso só para quem você escolher.'
            },
            {
              icon: <Users className="h-10 w-10 text-legado-gold" />,
              title: 'Conexão Familiar',
              text: 'União entre gerações, mantendo o legado vivo através de memórias compartilhadas.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-legado-white rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="bg-legado-gold/30 p-4 rounded-full mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif font-semibold text-legado-dark mb-2">
                {item.title}
              </h3>
              <p className="text-legado-dark/80 text-sm leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
