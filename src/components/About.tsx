import React from 'react';
import { Heart, Clock, Shield, Users } from 'lucide-react';
import imagem from '../assets/fotoantiga.png';

const About = () => {
  return (
    <section id="sobre" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Quem <span className="text-[#D4B74C]">somos</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto text-justify leading-relaxed">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Heart className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Cuidado Emocional</h3>
            <p className="text-gray-600 text-justify leading-relaxed">
              O APP Legado ajuda no processo do luto, trazendo conforto ao transformar a dor da perda em gratidão pelas memórias compartilhadas. Cada história registrada se torna uma forma de manter vivo o legado daqueles que você amou e que partiram.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Clock className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Acesso Permanente</h3>
            <p className="text-gray-600 text-justify leading-relaxed">
              Enquanto você desejar, terá acesso, conforme as informações no termo de adesão.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Shield className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Segurança e Privacidade</h3>
            <p className="text-gray-600 text-justify leading-relaxed">
              Para acessar o APP Legado é necessário login e senha. Somente membros da família poderão compartilhar essas informações com os demais. A família também decide se as memórias registradas serão privadas ou públicas — para que amigos também tenham acesso.
            </p>
          </div>

          <div className="bg-[#F5F3E4] p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center text-center">
            <div className="bg-[#D4B74C]/20 p-3 rounded-full mb-4">
              <Users className="h-8 w-8 text-[#D4B74C]" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-[#8A7A42] mb-3">Conexão Familiar</h3>
            <p className="text-gray-600 text-justify leading-relaxed">
              A conexão familiar depois da morte de alguém é como um tecido que, embora rasgado pela dor, pode ser costurado pela presença, pelo amor e pela memória — dando novo significado à vida de quem fica.
            </p>
          </div>
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
                className="rounded-lg shadow-md max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
