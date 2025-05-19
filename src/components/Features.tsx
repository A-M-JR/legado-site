import React from 'react';
import { Camera, Share2, BookOpen, MessageCircle, Heart, Users } from 'lucide-react';
import imagem from '../assets/tela-3.png';
import imagemsuporte from '../assets/suporte.png';

const Features = () => {
  return (
    <section id="recursos" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark">
            Recursos do <span className="text-legado-gold">Aplicativo</span>
          </h2>
          <p className="mt-4 text-lg text-legado-dark/70 max-w-3xl mx-auto">
            Conheça as ferramentas que ajudam a preservar as memórias mais preciosas dos seus entes queridos de forma segura e significativa.
          </p>
        </div>

        {/* Bloco 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Texto e itens */}
          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-semibold text-legado-dark mb-4">Recordações Digitais</h3>
            {[
              {
                icon: <Camera className="h-6 w-6 text-legado-gold" />,
                title: 'Álbuns de Memórias',
                text:
                  'Crie o seu álbum digital com fotos e textos que trazem a essência da vida do seu ente querido e os momentos especiais.'
              },
              {
                icon: <BookOpen className="h-6 w-6 text-legado-gold" />,
                title: 'Histórias de Vida',
                text:
                  'Registre biografias e relatos que manterão vivos os valores, ensinamentos e conquistas de quem já não está contigo.'
              },
              {
                icon: <Share2 className="h-6 w-6 text-legado-gold" />,
                title: 'Compartilhamento Seguro',
                text:
                  'Compartilhe memorias com familiares e amigos, controlando quem pode visualizar seu álbum de memórias.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="p-3 bg-legado-gold/20 rounded-full flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-legado-dark mb-1">{item.title}</h4>
                  <p className="text-legado-dark/80 leading-relaxed text-justify">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Imagem */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-6 bg-legado-gold/10 rounded-full blur-xl"></div>
              <img
                src={imagem}
                alt="Tela do aplicativo mostrando recordações"
                className="relative z-10 rounded-2xl shadow-lg w-full max-w-lg object-cover"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Imagem de suporte */}
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative">
              <div className="absolute -inset-6 bg-legado-gold/10 rounded-full blur-xl"></div>
              <img
                src={imagemsuporte}
                alt="Tela do aplicativo mostrando perfil"
                className="relative z-10 rounded-2xl shadow-lg w-full max-w-lg object-cover"
              />
            </div>
          </div>

          {/* Conteúdo */}
          <div className="order-1 lg:order-2 space-y-8">
            <h3 className="text-2xl font-serif font-semibold text-legado-dark">Suporte Emocional</h3>
            {[
              {
                icon: <MessageCircle className="h-6 w-6 text-legado-gold" />,
                title: 'Conexão com Especialistas',
                text: 'Acesso a profissionais do luto que ajudarão a passar pelo processo de perda.'
              },
              {
                icon: <Users className="h-6 w-6 text-legado-gold" />,
                title: 'Comunidades de Apoio',
                text: 'Participe de grupos moderados para compartilhar experiências e encontrar conforto.'
              },
              {
                icon: <Heart className="h-6 w-6 text-legado-gold" />,
                title: 'Recursos de Bem-Estar',
                text: 'Guias e técnicas para equilíbrio emocional durante o luto.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="p-3 bg-legado-gold/20 rounded-full flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-legado-dark mb-1">{item.title}</h4>
                  <p className="text-legado-dark/80 leading-relaxed text-justify">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
