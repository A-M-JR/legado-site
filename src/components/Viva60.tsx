import React from 'react';
import { Heart, BookUser, Images, Activity, Users, Clock, ShieldCheck } from 'lucide-react';

const Viva60 = () => {
  return (
    <section id="viva60" className="py-24 bg-legado-mid bg-opacity-10 border-t border-legado-gold/10">
      <div className="container mx-auto px-6 lg:px-16">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-legado-dark mb-4">
            VIVA <span className="text-legado-gold">60+</span>
          </h2>
          <p className="text-xl md:text-2xl text-legado-dark font-medium max-w-3xl mx-auto italic">
            "Vida em movimento. Tudo o que importa na sua vida, em um só lugar."
          </p>
        </div>

        {/* O que é Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-7 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-2xl font-serif font-bold text-legado-dark mb-6 uppercase tracking-wider">O que é</h3>
            <div className="space-y-4 text-legado-dark text-lg leading-relaxed text-justify">
              <p>
                O <strong>Viva 60+</strong> é uma plataforma de cuidado e registro da vida da pessoa idosa. 
                Um espaço onde o dia a dia é vivido, organizado e guardado, unindo memória, rotina, saúde e convivência social em um só lugar.
              </p>
              <p>
                Mais do que acompanhar a longevidade, o Viva 60+ valoriza a vida como ela é hoje — ativa, significativa e em constante construção.
              </p>
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-5 bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold flex flex-col justify-center transform hover:scale-[1.02] transition-transform duration-300">
            <h3 className="text-2xl font-serif font-bold text-legado-dark mb-6 uppercase tracking-wider">Propósito</h3>
            <p className="text-legado-dark text-lg leading-relaxed font-medium">
              Promover uma longevidade mais humana, organizada e significativa, cuidando da vida cotidiana da pessoa idosa com autonomia, respeito e afeto.
            </p>
            <div className="mt-8 pt-6 border-t border-legado-gold/20">
               <Heart className="text-legado-gold h-8 w-8 fill-legado-gold/10" />
            </div>
          </div>
        </div>

        {/* Para quem é Section */}
        <div className="bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-4 border-legado-gold mb-16 transform hover:scale-[1.01] transition-transform duration-300">
          <h3 className="text-2xl font-serif font-bold text-legado-dark mb-8 uppercase tracking-wider text-center md:text-left">Para quem é</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-legado-gold/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Users className="text-legado-gold w-6 h-6" />
              </div>
              <h4 className="font-bold text-legado-dark">Pessoas 60+</h4>
              <p className="text-legado-dark/80 text-sm">Que desejam viver com mais clareza, segurança e protagonismo.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-legado-gold/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <Heart className="text-legado-gold w-6 h-6" />
              </div>
              <h4 className="font-bold text-legado-dark">Famílias</h4>
              <p className="text-legado-dark/80 text-sm">Que querem cuidar, acompanhar e preservar histórias sem invadir.</p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 bg-legado-gold/10 rounded-full flex items-center justify-center mx-auto md:mx-0">
                <ShieldCheck className="text-legado-gold w-6 h-6" />
              </div>
              <h4 className="font-bold text-legado-dark">Instituições</h4>
              <p className="text-legado-dark/80 text-sm">Públicas e privadas que acreditam em um envelhecimento ativo, digno e conectado.</p>
            </div>
          </div>
        </div>

        {/* O que o VIVA 60+ entrega Section */}
        <div className="bg-legado-white rounded-3xl p-10 md:p-16 shadow-2xl border-l-[6px] border-legado-gold relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-legado-dark mb-10 text-center">
              O que o <span className="text-legado-gold">VIVA 60+</span> entrega
            </h3>
            <p className="text-center text-legado-dark/70 mb-12 max-w-2xl mx-auto">
              Um ambiente simples, acessível e acolhedor onde o idoso pode:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: <BookUser className="w-8 h-8" />, 
                  title: "Registrar o dia a dia", 
                  desc: "Diário pessoal, sentimentos e acontecimentos do cotidiano." 
                },
                { 
                  icon: <Images className="w-8 h-8" />, 
                  title: "Guardar memórias", 
                  desc: "Histórias, fotos e registros mais importantes da trajetória de vida." 
                },
                { 
                  icon: <Activity className="w-8 h-8" />, 
                  title: "Organizar a saúde", 
                  desc: "Agenda de consultas, médicos, especialidades e receitas em imagem." 
                },
                { 
                  icon: <Users className="w-8 h-8" />, 
                  title: "Fortalecer vínculos", 
                  desc: "Interação, sentimento de pertencimento e presença constante." 
                },
                { 
                  icon: <Heart className="w-8 h-8" />, 
                  title: "Autonomia e tranquilidade", 
                  desc: "Viver com mais segurança, tendo tudo organizado em um só lugar." 
                },
                { 
                  icon: <Clock className="w-8 h-8" />, 
                  title: "Lembrete de consultas", 
                  desc: "Notificações para que o idoso esteja sempre informado e não perca seus horários médicos." 
                }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-legado-mid bg-opacity-5 hover:bg-legado-gold/10 transition-colors duration-300">
                  <div className="text-legado-gold mb-4 hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-legado-dark mb-2">{item.title}</h4>
                  <p className="text-sm text-legado-dark/70 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
          
          <BookUser className="absolute -bottom-10 -right-10 w-64 h-64 text-legado-gold/5 -rotate-12" />
        </div>
      </div>
    </section>
  );
};

export default Viva60;
