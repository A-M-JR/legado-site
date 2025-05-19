import React, { useState } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaPaperPlane } from 'react-icons/fa';
import logo from '../assets/Legado - Branco.png';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: integrar com backend da newsletter
    alert(`Obrigado por assinar, ${email}!`);
    setEmail('');
  };

  return (
    <footer className="bg-[#2C2A29] text-white">
      <div className="container mx-auto px-6 lg:px-16 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo + descrição + social */}
        <div className="space-y-6">
          <img src={logo} alt="Legado Logo" className="h-12" />
          <p className="text-sm text-white/90">
            Transformamos memórias em legados digitais que conectam gerações e amenizam a dor da perda.
          </p>
          <div className="flex space-x-4">
            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                aria-label="Social link"
              >
                <Icon className="h-5 w-5 text-white" />
              </a>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <div className="space-y-4">
          <h4 className="font-serif font-semibold text-white text-lg">Navegação</h4>
          <ul className="space-y-2 text-sm">
            {['Início', 'Sobre', 'Recursos', 'Depoimentos', 'Parceiros', 'Contato'].map((label, idx) => (
              <li key={idx}>
                <a href={`#${label.toLowerCase()}`} className="text-white/70 hover:text-white transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Recursos */}
        <div className="space-y-4">
          <h4 className="font-serif font-semibold text-white text-lg">Recursos</h4>
          <ul className="space-y-2 text-sm">
            {['FAQ', 'Suporte', 'Política de Privacidade', 'Termos de Uso', 'Blog'].map((item, idx) => (
              <li key={idx}>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h4 className="font-serif font-semibold text-white text-lg">Newsletter</h4>
          <p className="text-sm text-white/90">
            Receba dicas, histórias e atualizações sobre o APP Legado.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow px-4 py-2 rounded-md bg-white/10 placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#D4B74C]"
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-legado-gold hover:bg-[#BFA340] transition-colors rounded-md text-white font-medium text-sm"
            >
              <FaPaperPlane className="mr-2" /> Assinar
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/30 py-6 text-center text-sm text-white/60">
        © {new Date().getFullYear()} Legado. Todos os direitos reservados.
      </div>
    </footer>
  );
}
