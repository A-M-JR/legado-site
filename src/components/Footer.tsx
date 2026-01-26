import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { LogIn, ShieldCheck, FileText, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Legado - Branco.png';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a1a] text-white">
      <div className="container mx-auto px-6 lg:px-14 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 items-start">

          {/* Coluna 1: Branding e Social */}
          <div className="flex flex-col gap-6">
            <img src={logo} alt="Legado Logo" className="h-12 w-auto object-contain self-start" />
            <p className="text-sm text-gray-400 leading-relaxed">
              Transformamos memórias em <strong>legados digitais</strong> que conectam gerações e oferecem acolhimento nos momentos de saudade.
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
                  className="p-2.5 bg-white/5 rounded-xl hover:bg-[#5ba58c] hover:text-white transition-all duration-300"
                  aria-label={label}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Coluna 2: Navegação Rápida */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Navegação</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Início', href: '#inicio' },
                { label: 'Sobre Nós', href: '#sobre' },
                { label: 'Jornadas', href: '#recursos' },
                { label: 'Histórias', href: '#depoimentos' },
                { label: 'Contato', href: '#contato' }
              ].map((link, idx) => (
                <li key={idx}>
                  <a href={link.href} className="text-gray-400 hover:text-[#5ba58c] transition-colors flex items-center gap-2">
                    <span className="h-1 w-1 bg-[#5ba58c] rounded-full opacity-0 group-hover:opacity-100" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 3: Suporte e Legal (Essencial para Ads) */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6">Suporte e Legal</h4>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Perguntas Frequentes', icon: HelpCircle },
                { label: 'Política de Privacidade', icon: ShieldCheck },
                { label: 'Termos de Uso', icon: FileText },
                { label: 'Central de Ajuda', icon: HelpCircle }
              ].map((item, idx) => (
                <li key={idx}>
                  <a href="#" className="text-gray-400 hover:text-[#5ba58c] transition-colors flex items-center gap-2">
                    <item.icon size={14} />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Coluna 4: Acesso ao App */}
          <div className="flex flex-col gap-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <h4 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
                <LogIn size={16} className="text-[#5ba58c]" />
                Área do Cliente
              </h4>
              <p className="text-xs text-gray-400 mb-4">
                Acesse sua jornada, gerencie memórias e visualize seus conteúdos.
              </p>
              <button
                onClick={() => navigate('/legado-app/login')}
                className="w-full bg-[#5ba58c] hover:bg-[#4a8a75] text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                Entrar no App
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé Inferior */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {currentYear} Legado & Conforto. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <p>CNPJ: 00.000.000/0000-00</p>
            <p>Feito com carinho para você.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}