import React from 'react';
import { Camera, Share2, BookOpen, MessageCircle, Heart, Users } from 'lucide-react';
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
        {/* Title / Intro — semantic heading for SEO */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#255f4f]">
            Recursos do <span className="text-[#5ba58c]">Aplicativo Legado</span>
          </h2>
          <p className="mt-4 text-lg text-[#6b8c7d] max-w-3xl mx-auto leading-relaxed">
            Ferramentas pensadas para a <strong>preservação de memórias</strong>, <strong>memorial digital privado</strong> e suporte à família.
            Ideal para famílias, clínicas e serviços de cuidado que querem oferecer um espaço seguro e humano.
          </p>
        </div>

        {/* Primary features block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-semibold text-[#255f4f] mb-2">Recordações Digitais</h3>
            <p className="text-[#6b8c7d] leading-relaxed max-w-prose">
              Álbuns, histórias e compartilhamento com controle total de privacidade — para que suas memórias sejam
              preservadas e acessíveis apenas por quem você autorizar.
            </p>

            {[
              {
                icon: <Camera className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Álbuns de Memórias',
                text:
                  'Organize fotos, vídeos e textos em álbuns temáticos. Ideal para memorializar momentos especiais.'
              },
              {
                icon: <BookOpen className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Histórias de Vida',
                text:
                  'Registre biografias, depoimentos e relatos para manter viva a trajetória de quem você ama.'
              },
              {
                icon: <Share2 className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Compartilhamento Seguro',
                text:
                  'Defina permissões por usuário e por álbum: público, restrito ou privado — você tem o controle.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="p-3 bg-[#f3fbf6] rounded-full flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#255f4f] mb-1">{item.title}</h4>
                  <p className="text-[#6b8c7d] leading-relaxed text-justify">{item.text}</p>
                </div>
              </div>
            ))}

            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={goToApp}
                className="inline-flex items-center gap-2 bg-[#5ba58c] text-white px-5 py-3 rounded-2xl font-semibold shadow hover:bg-[#4a8a75] transition"
                aria-label="Acessar o aplicativo Legado"
              >
                Acessar App
              </button>

              <button
                onClick={() => goToSelecao('legado')}
                className="inline-flex items-center gap-2 border border-[#5ba58c] text-[#255f4f] px-5 py-3 rounded-2xl font-semibold hover:bg-[#f4fbf8] transition"
                aria-label="Selecionar jornada Legado"
              >
                Selecionar Jornada (Legado)
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="relative w-full overflow-hidden max-w-md">
              <div className="absolute -inset-6 bg-[#eaf7f1] rounded-full blur-xl"></div>
              <img
                src={imagem}
                alt="Tela do aplicativo Legado mostrando álbuns e recordações"
                loading="lazy"
                className="relative z-10 rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Support & Emotional features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-12">
          <div className="flex justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-6 bg-[#fff6ed] rounded-full blur-xl"></div>
              <img
                src={imagemsuporte}
                alt="Recursos de suporte emocional no aplicativo Legado"
                loading="lazy"
                className="relative z-10 rounded-2xl shadow-lg w-full object-cover"
              />
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <h3 className="text-2xl font-serif font-semibold text-[#255f4f]">Suporte Emocional & Comunidade</h3>
            <p className="text-[#6b8c7d] leading-relaxed max-w-prose">
              Além do memorial, oferecemos recursos de apoio emocional, comunidades e conteúdo para auxiliar no processo de luto.
              Perfeito para quem busca acolhimento junto à preservação de memórias.
            </p>

            {[
              {
                icon: <MessageCircle className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Conexão com Especialistas',
                text: 'Acesso orientado a profissionais que acompanham o luto e oferecem suporte.'
              },
              {
                icon: <Users className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Comunidades de Apoio',
                text: 'Grupos moderados para compartilhar experiências com segurança e empatia.'
              },
              {
                icon: <Heart className="h-6 w-6 text-[#5ba58c]" />,
                title: 'Recursos de Bem-Estar',
                text: 'Guias, exercícios e materiais para cuidado emocional durante o processo de perda.'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="p-3 bg-[#f3fbf6] rounded-full flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-lg font-medium text-[#255f4f] mb-1">{item.title}</h4>
                  <p className="text-[#6b8c7d] leading-relaxed text-justify">{item.text}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => goToSelecao('melhor-idade')}
                className="inline-flex items-center gap-2 border border-[#5ba58c] text-[#255f4f] px-4 py-2 rounded-lg hover:bg-[#f4fbf8] transition"
                aria-label="Selecionar jornada Melhor Idade"
              >
                Selecionar Jornada Melhor Idade
              </button>
              <button
                onClick={() => goToSelecao('paliativo')}
                className="inline-flex items-center gap-2 border border-[#ffd6b4] text-[#9a5a2a] px-4 py-2 rounded-lg hover:bg-[#fff7f0] transition"
                aria-label="Selecionar jornada Cuidados Paliativos"
              >
                Selecionar Jornada Paliativos
              </button>
            </div>
          </div>
        </div>

        {/* Quick summary / Value props — good for ads landing */}
        <div className="mt-8 bg-white border border-[#f0f7f4] rounded-2xl p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: 'Memorial Digital Privado',
              text: 'Controle total de acesso e privacidade — perfeito para famílias e instituições.'
            },
            {
              title: 'Apoio Emocional',
              text: 'Acesso a recursos e comunidades moderadas para trilhar o luto com acolhimento.'
            },
            {
              title: 'Integração com Parceiros',
              text: 'Configuração por parceiros (clínicas e funerárias) para onboarding de clientes em massa.'
            }
          ].map((item, idx) => (
            <div key={idx} className="p-4">
              <h4 className="text-lg font-semibold text-[#255f4f] mb-2">{item.title}</h4>
              <p className="text-[#6b8c7d] text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;