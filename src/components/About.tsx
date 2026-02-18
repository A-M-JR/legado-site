import React from 'react';
import { Heart, ShieldCheck, Users, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import imagem from '../assets/fotoantiga.png';

const About = () => {
  const navigate = useNavigate();

  return (
    <section id="sobre" className="py-20 bg-[#f8fcfb]">
      <div className="container mx-auto px-6 lg:px-16">
        
        {/* Título Otimizado para SEO/Ads */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-[#255f4f] mb-6">
            Eternize Histórias com o <span className="text-[#5ba58c]">Memorial Digital</span> mais seguro do Brasil
          </h2>
          <p className="text-lg text-[#6b8c7d] max-w-3xl mx-auto leading-relaxed">
            O <strong>APP Legado</strong> é a solução definitiva para a <strong>preservação de memórias familiares</strong>. 
            Transformamos a saudade em um tributo eterno, seguro e acessível.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Lado da Imagem com Badge de Confiança */}
          <div className="relative">
            <img
              src={imagem}
              alt="Preservação de memórias familiares e histórias de vida"
              className="rounded-[2rem] shadow-2xl w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-[#f0f7f4] hidden md:block">
              <div className="flex items-center gap-3">
                <div className="bg-[#e3f1eb] p-2 rounded-lg">
                  <ShieldCheck className="text-[#5ba58c] h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#6b8c7d] uppercase tracking-wider">Privacidade</p>
                  <p className="text-[#255f4f] font-bold">100% Seguro</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lado do Texto - Foco em Benefícios (Escaneável) */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-[#255f4f] mb-4">Por que escolher o Memorial Digital Legado?</h3>
              <p className="text-[#6b8c7d] leading-relaxed">
                Sabemos que memórias físicas podem se perder com o tempo. Nossa plataforma foi desenhada para ser um 
                <strong> porto seguro para o seu legado familiar</strong>, garantindo que as futuras gerações conheçam suas raízes.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                { title: "Memorial Privado", desc: "Você decide quem pode visualizar e interagir." },
                { title: "Histórias Eternizadas", desc: "Fotos, vídeos e áudios guardados para sempre." },
                { title: "Conexão entre Gerações", desc: "Um espaço para a família celebrar a vida unida." }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1 bg-[#5ba58c] rounded-full p-1 h-5 w-5 flex items-center justify-center shrink-0">
                    <Sparkles className="text-white h-3 w-3" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#255f4f] text-sm uppercase tracking-wide">{item.title}</h4>
                    <p className="text-[#6b8c7d] text-sm">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <button 
                onClick={() => navigate('/legado-app/login')}
                className="group flex items-center gap-3 bg-[#255f4f] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#5ba58c] transition-all shadow-lg shadow-emerald-100"
              >
                Começar meu Legado agora
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Grid de Diferenciais - Cards menores e mais limpos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Heart className="h-6 w-6" />,
              title: 'Apoio no Luto',
              text: 'Transformamos a dor em celebração através da gratidão.'
            },
            {
              icon: <Users className="h-6 w-6" />,
              title: 'Rede Familiar',
              text: 'Espaço colaborativo para amigos e parentes compartilharem histórias.'
            },
            {
              icon: <ShieldCheck className="h-6 w-6" />,
              title: 'Segurança de Dados',
              text: 'Tecnologia de ponta para proteger a história da sua família.'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#f0f7f4] rounded-2xl p-8 hover:border-[#5ba58c] transition-colors group"
            >
              <div className="bg-[#f4fbf8] text-[#5ba58c] w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5ba58c] group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-[#255f4f] mb-3">{item.title}</h3>
              <p className="text-[#6b8c7d] text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;