import React from 'react';
import { Heart, Clock, Shield, Users } from 'lucide-react';
import imagem from '../assets/fotoantiga.png';

const About = () => {
  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Quem <span className="text-[#D4B74C]">somos</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed text-justify">
            Somos a Empresa Legado&Conforto e aqui lhe apresentamos carinhosamente um dos nossos produtos: APP Legado.
            Mais do que um aplicativo, somos uma plataforma que conecta memórias, emoções e pessoas.
            Sabemos que a perda de alguém especial é um dos momentos mais difíceis da vida. As lembranças que temos dessas pessoas são preciosas, e muitas vezes queremos uma maneira de guardá-las para sempre, tendo a certeza de que estarão ao nosso alcance.
            <br /><br />
            Foi pensando nisso que criamos o APP LEGADO; uma plataforma para preservar e compartilhar memórias de quem partiu, de forma íntima, significativa e segura.
            Com o tempo, memórias podem se perder, histórias podem sim ser esquecidas, e as vozes das pessoas que amamos e que se foram tendem a parecer mais distantes. Por mais dor que isso possa trazer, é a realidade.
            <br /><br />
            O APP LEGADO permite que famílias e amigos registrem fotos e mensagens de momentos especiais, criando um memorial digital que mantém viva a presença de quem foi importante para você.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
          {[{
            icon: <Heart className="h-8 w-8 text-[#D4B74C]" />,
            title: 'Cuidado Emocional',
            text: 'O APP Legado ajuda no processo do luto, trazendo conforto ao transformar a dor da perda em gratidão pelas memórias compartilhadas. Cada história registrada se torna uma forma de manter vivo o legado daqueles que você amou e que partiram.'
          }, {
            icon: <Clock className="h-8 w-8 text-[#D4B74C]" />,
            title: 'Acesso Permanente',
            text: 'Enquanto você desejar, terá acesso, conforme as informações no termo de adesão.'
          }, {
            icon: <Shield className="h-8 w-8 text-[#D4B74C]" />,
            title: 'Segurança e Privacidade',
            text: 'Para acessar o APP Legado é necessário login e senha. Somente membros da família poderão compartilhar essas informações com os demais. A família também decide se as memórias registradas serão privadas ou públicas — para que amigos também tenham acesso.'
          }, {
            icon: <Users className="h-8 w-8 text-[#D4B74C]" />,
            title: 'Conexão Familiar',
            text: 'A conexão familiar depois da morte de alguém é como um tecido que, embora rasgado pela dor, pode ser costurado pela presença, pelo amor e pela memória — dando novo significado à vida de quem fica.'
          }].map((item, idx) => (
            <div key={idx} className="bg-[#F5F3E4] p-4 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
              <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">{item.icon}</div>
              <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">{item.title}</h3>
              <p className="text-gray-600 text-sm text-justify leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#F5F3E4] p-8 md:p-12 rounded-2xl shadow-md">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#8A7A42] mb-4">
                Nosso Propósito
              </h3>
              <p className="text-black mb-4 text-justify leading-relaxed">
                O APP Legado nasceu da compreensão de que a dor da perda pode ser amenizada quando transformamos o luto em celebração e gratidão por ter vivido um precioso tempo com aquela pessoa que sempre será importante para você.
              </p>
              <p className="text-black mb-4 text-justify leading-relaxed">
                O que oferecemos é um espaço digital para guardar lembranças, compartilhar histórias e manter viva a memória de quem se foi.
              </p>
              <p className="text-black mb-4 text-justify leading-relaxed">
                "Nosso propósito é preservar o que é mais precioso: as memórias, o amor e a história de quem jamais será esquecido."
              </p>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img
                src={imagem}
                alt="Pessoa olhando foto antiga"
                className="rounded-lg shadow-md max-w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
