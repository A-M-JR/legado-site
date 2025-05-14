import React from 'react';
import {
  Camera,
  Share2,
  BookOpen,
  MessageCircle,
  Heart,
  Users
} from 'lucide-react';
import imagem from '../assets/album_compartilhar.png';
import imagemsuporte from '../assets/suporte.png';

const Features = () => {
  return (
    <section id="recursos" className="py-20 bg-[#F8F6E9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Recursos do <span className="text-[#D4B74C]">Aplicativo</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça as ferramentas que ajudam a preservar as memórias mais
            preciosas dos seus entes queridos de forma segura e significativa.
          </p>
        </div>

        {/* Bloco 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div className="order-2 lg:order-1">
            <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
              Recordações Digitais
            </h3>

            <div className="space-y-6">
              {/* Item 1 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <Camera className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Álbuns de Memórias
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Crie o seu álbum digital com Fotos e textos que trazem a essência da vida do seu ente querido e os momentos especiais que ele (ela) viveu com você, com os familiares e amigos.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <BookOpen className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Histórias de Vida
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Tenha registrado biografias, histórias e relatos que manterão vivos os valores, ensinamentos e conquistas de quem já não está contigo.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <Share2 className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Compartilhamento Seguro
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Compartilhar recordações é possível e fácil por aqui. Isso pode ser feito com familiares e amigos, e é você quem vai controlar quem pode visualizar seu álbum de memórias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Imagem */}
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-[#D4B74C]/10 rounded-full blur-xl"></div>
              <img
                src={imagem}
                alt="Tela do aplicativo mostrando recordações"
                className="relative z-10 rounded-xl shadow-lg max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Imagem */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-[#D4B74C]/10 rounded-full blur-xl"></div>
              <img
                src={imagemsuporte}
                alt="Tela do aplicativo mostrando perfil"
                className="relative z-10 rounded-xl shadow-lg max-w-full h-auto"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div>
            <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
              Suporte Emocional
            </h3>

            <div className="space-y-6">
              {/* Item 1 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <MessageCircle className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Conexão com Especialistas
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Acesso a profissionais do Luto que lhe ajudarão a passar pelo seu processo de perda.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <Users className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Comunidades de Apoio
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Oportunidade de participar de grupos moderados, onde pessoas em situações semelhantes podem compartilhar experiências e você poderá encontrar conforto.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start">
                <div className="bg-[#D4B74C]/20 p-2 rounded-full mr-4 mt-1">
                  <Heart className="h-5 w-5 text-[#D4B74C]" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#8A7A42] mb-2">
                    Recursos de Bem-estar
                  </h4>
                  <p className="text-gray-600 text-justify leading-relaxed">
                    Conteúdos e guias sobre o processo de luto, com técnicas e práticas para o equilíbrio emocional desse momento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
