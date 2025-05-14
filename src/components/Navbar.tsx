import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/Legado - Verde.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#recursos', label: 'Recursos' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#parceiros', label: 'Parceiros' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scroll = (totalScroll / windowHeight) * 100;
      setScrollProgress(scroll);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
        }`}
    >
      {/* Barra de progresso */}
      <motion.div
        className="h-1 bg-[#D4B74C] fixed top-0 left-0 z-[60]"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="#inicio">
            <img src={logo} alt="Legado" className="h-12 md:h-14" />
          </a>

          {/* Navegação desktop */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium text-base"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contato"
              className="bg-[#D4B74C] hover:bg-[#C3A53B] text-white px-5 py-2 rounded-md font-medium transition-all shadow-sm"
            >
              Contato
            </a>
          </div>

          {/* Botão mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#8A7A42] hover:text-[#D4B74C]"
            aria-label="Abrir menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Menu mobile animado */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-5"
            >
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-[#8A7A42] hover:text-[#D4B74C] font-medium text-base"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contato"
                  onClick={() => setIsOpen(false)}
                  className="bg-[#D4B74C] text-white px-5 py-2 rounded-md hover:bg-[#C3A53B] font-medium text-center transition-all"
                >
                  Contato
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
