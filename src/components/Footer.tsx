import React from 'react';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import logo from '../assets/Legado - Branco.png';

const Footer = () => {
  return (
    <footer className="bg-[#4A4228] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo e Descrição */}
          <div>
            <img src={logo} alt="Legado" className="h-12 mb-4" />
            <p className="text-white/80 mb-6 text-sm leading-relaxed">
              Transformando memórias em legados digitais que conectam gerações
              e amenizam a dor da perda.
            </p>
            <div className="flex space-x-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-colors"
                  aria-label={Icon.name}
                >
                  <Icon className="h-5 w-5 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '#inicio', label: 'Início' },
                { href: '#sobre', label: 'Sobre' },
                { href: '#recursos', label: 'Recursos' },
                { href: '#depoimentos', label: 'Depoimentos' },
                { href: '#parceiros', label: 'Parceiros' },
                { href: '#contato', label: 'Contato' },
              ].map((item, i) => (
                <li key={i}>
                  <a
                    href={item.href}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-sm">
              {['Suporte', 'FAQ', 'Política de Privacidade', 'Termos de Uso', 'Blog'].map((item, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-white/80 mb-4 text-sm">
              Receba nossas atualizações e conteúdos sobre memórias, luto e bem-estar.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="px-4 py-2 rounded-md bg-white/90 text-[#4A4228] placeholder:text-[#4A4228]/50 text-sm focus:outline-none flex-grow"
              />
              <button
                type="submit"
                className="bg-[#D4B74C] hover:bg-[#C3A53B] transition-colors px-4 py-2 rounded-md text-white font-medium text-sm"
              >
                Assinar
              </button>
            </form>
          </div>
        </div>

        {/* Rodapé */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center text-white/60 text-sm">
          <p>© {new Date().getFullYear()} Legado. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
