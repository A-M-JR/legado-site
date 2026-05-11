import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { LogIn, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-ilc.png';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a3d34] text-white border-t border-legado-gold/20">
      <div className="container mx-auto px-6 lg:px-14 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 items-start">

          {/* Coluna 1: Branding e Social */}
          <div className="flex flex-col gap-10">
            <img src={logo} alt="ILC Logo" className="h-10 md:h-14 object-contain self-start" />
            <p className="text-lg text-white/90 leading-relaxed font-bold italic">
              "Cuidando da memória, da vida e da dignidade em todos os ciclos."
            </p>
            <div className="flex space-x-4">
              {[
                { Icon: FaFacebookF, href: "#", label: "Facebook" },
                { Icon: FaInstagram, href: "#", label: "Instagram" },
                { Icon: FaTwitter, href: "#", label: "Twitter" },
                { Icon: FaLinkedinIn, href: "#", label: "LinkedIn" }
              ].map(({ Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  className="p-3 bg-white/10 rounded-xl hover:bg-legado-gold hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h4 className="text-legado-gold font-serif font-bold text-xl mb-8 uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-4 text-sm font-bold">
              {[
                { label: 'Início', href: '#inicio' },
                { label: 'Quem Somos', href: '#sobre' },
                { label: 'Viva 60+', href: '#viva60' },
                { label: 'Recursos', href: '#recursos' },
                { label: 'Contatos', href: '#contato' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-white hover:text-legado-gold transition-colors flex items-center gap-2 group underline-offset-4 hover:underline">
                    <span className="h-1.5 w-1.5 bg-legado-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Suporte e Legal */}
          <div>
            <h4 className="text-legado-gold font-serif font-bold text-xl mb-8 uppercase tracking-widest">Apoio</h4>
            <ul className="space-y-4 text-sm font-bold">
              {[
                { label: 'Perguntas Frequentes', icon: HelpCircle },
                { label: 'Política de Privacidade', icon: ShieldCheck },
                { label: 'Termos de Uso', icon: FileText },
                { label: 'Central de Ajuda', icon: HelpCircle }
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-white hover:text-legado-gold transition-colors flex items-center gap-3 group">
                    <item.icon size={16} className="text-legado-gold group-hover:text-white" />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Acesso ao App */}
          <div className="flex flex-col gap-8">
            <div className="bg-white/10 p-8 rounded-[2rem] border border-white/20 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-legado-gold/10 rounded-full blur-2xl group-hover:bg-legado-gold/20 transition-all" />
              
              <h4 className="text-white font-serif font-bold text-lg mb-4 flex items-center gap-3">
                <LogIn size={20} className="text-legado-gold" />
                Plataforma
              </h4>
              <p className="text-xs text-white mb-6 leading-relaxed font-bold">
                Acesse sua jornada personalizada, gerencie memórias e conecte-se com sua história.
              </p>
              <button
                onClick={() => navigate('/legado-app/login')}
                className="w-full bg-legado-gold hover:bg-white text-white hover:text-legado-dark font-bold py-4 rounded-2xl transition-all shadow-xl shadow-legado-gold/10 flex items-center justify-center gap-2 transform active:scale-95"
              >
                Entrar agora
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-white tracking-wider font-bold">
          <p>© {currentYear} <strong>ILC — Instituto Legado e Conforto</strong>. Todos os direitos reservados.</p>
          <div className="flex gap-8 font-bold">
             <p className="hover:text-legado-gold transition-colors cursor-help">Privacidade</p>
             <p className="hover:text-legado-gold transition-colors cursor-help">Segurança</p>
             <p className="italic text-legado-gold font-serif">"Cuidando da memória, da vida e da dignidade em todos os ciclos."</p>
          </div>
        </div>
      </div>
    </footer>
  );
}