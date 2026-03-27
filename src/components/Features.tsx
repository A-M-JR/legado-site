import React from 'react';
import { Camera, Share2, BookOpen, MessageCircle, Heart, Users, Images, BookUser, BookOpenText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imagem from '../assets/tela-3.png';
import imagemsuporte from '../assets/suporte.png';

const Features: React.FC = () => {
  const navigate = useNavigate();

  const goToApp = () => navigate('/legado-app/login');
  const goToSelecao = (jornada?: string) =>
    navigate(`/legado-app/selecao-modulos${jornada ? `?jornada=${jornada}` : ''}`);

  return (
    <section id="recursos" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Title / Intro */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark">
            Recursos do <span className="text-legado-gold">Instituto Legado</span>
          </h2>
          <p className="mt-4 text-lg text-legado-dark font-medium max-w-3xl mx-auto italic">
            Ferramentas pensadas para a <strong>preservação de memórias</strong>, <strong>memorial digital privado</strong> e um suporte humano à família.
          </p>
        </div>

        {/* 1. Recordações Digitais - Card Estilo Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 bg-legado-white rounded-[2.5rem] shadow-2xl border-4 border-white border-l-8 border-legado-gold overflow-hidden p-8 md:p-12 hover:shadow-legado-gold/10 transition-shadow">
          <div className="lg:col-span-7 space-y-8">
            <h3 className="text-3xl font-serif font-bold text-legado-dark tracking-tight">Recordações Digitais</h3>
            <p className="text-legado-dark font-medium leading-relaxed max-w-prose">
              Álbuns, histórias e compartilhamento com controle total de privacidade — para que suas memórias sejam preservadas e acessíveis apenas por quem você autorizar.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <Camera className="h-6 w-6 text-legado-gold" />,
                  title: 'Álbuns de Memórias',
                  text: 'Organize fotos, vídeos e textos em álbuns temáticos. Ideal para memorializar momentos especiais.'
                },
                {
                  icon: <BookOpen className="h-6 w-6 text-legado-gold" />,
                  title: 'Histórias de Vida',
                  text: 'Registre biografias, depoimentos e relatos para manter viva a trajetória de quem você ama.'
                },
                {
                  icon: <Share2 className="h-6 w-6 text-legado-gold" />,
                  title: 'Compartilhamento Seguro',
                  text: 'Defina permissões por usuário e por álbum: público, restrito ou privado — você tem o controle.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="p-3 bg-legado-gold/10 rounded-full flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-legado-dark mb-1">{item.title}</h4>
                    <p className="text-legado-dark font-medium text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8">
              <button
                onClick={goToApp}
                className="inline-flex items-center gap-2 bg-legado-gold text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-legado-gold/20 hover:bg-legado-dark transition-all transform hover:-translate-y-1"
              >
                Acessar Plataforma
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
             <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white transform hover:rotate-1 transition-all duration-300">
                <img
                  src={imagem}
                  alt="Plataforma Legado"
                  className="w-full object-cover"
                />
             </div>
          </div>
        </div>

        {/* 2. Suporte Emocional & Comunidade - Card Estilo Hero (Invertido) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20 bg-legado-white rounded-[2.5rem] shadow-2xl border-4 border-white border-l-8 border-legado-gold overflow-hidden p-8 md:p-12 hover:shadow-legado-gold/10 transition-shadow">
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
             <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-white transform hover:-rotate-1 transition-all duration-300">
                <img
                  src={imagemsuporte}
                  alt="Suporte Emocional"
                  className="w-full object-cover"
                />
             </div>
          </div>

          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <h3 className="text-3xl font-serif font-bold text-legado-dark tracking-tight">Suporte Emocional & Comunidade</h3>
            <p className="text-legado-dark font-medium leading-relaxed max-w-prose">
              Além do memorial, oferecemos recursos de apoio emocional, comunidades e conteúdo para auxiliar no processo de luto. Perfeito para quem busca acolhimento junto à preservação de memórias.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <MessageCircle className="h-6 w-6 text-legado-gold" />,
                  title: 'Conexão com Especialistas',
                  text: 'Acesso orientado a profissionais que acompanham o luto e oferecem suporte.'
                },
                {
                  icon: <Users className="h-6 w-6 text-legado-gold" />,
                  title: 'Comunidades de Apoio',
                  text: 'Grupos moderados para compartilhar experiências com segurança e empatia.'
                },
                {
                  icon: <Heart className="h-6 w-6 text-legado-gold" />,
                  title: 'Recursos de Bem-Estar',
                  text: 'Guias, exercícios e materiais para cuidado emocional durante o processo de perda.'
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="p-3 bg-legado-gold/10 rounded-full flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-legado-dark mb-1">{item.title}</h4>
                    <p className="text-legado-dark font-medium text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Resumo Final / Rodapé da Seção */}
        <div className="mt-24 text-center">
            <h4 className="text-2xl font-serif italic text-legado-dark font-bold mb-4">
              "Honrar a vida hoje, cuidar do amanhã."
            </h4>
            <div className="h-1 w-24 bg-legado-gold mx-auto rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Features;