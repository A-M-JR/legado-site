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
      const total = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((total / height) * 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-legado-white/80 backdrop-blur-md shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      {/* Progress bar */}
      <motion.div
        className="h-1 bg-legado-gold fixed top-0 left-0 z-[60]"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="#inicio">
            <img src={logo} alt="Legado" className="h-10 md:h-12" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-legado-dark hover:text-legado-gold transition-colors font-medium"
              >
                {label}
              </a>
            ))}
            <a
              href="#contato"
              className="font-bold bg-legado-gold text-legado-black px-5 py-2 rounded-md shadow-sm transition-all duration-300 hover:bg-legado-darkGold hover:text-legado-white"
            >
              Contato
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-legado-dark hover:text-legado-gold transition-colors"
            aria-label="Abrir menu"
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4 bg-legado-white/90 backdrop-blur-xl rounded-xl shadow-lg p-5"
            >
              <div className="flex flex-col space-y-4">
                {navLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="text-legado-dark hover:text-legado-gold font-medium transition-colors"
                  >
                    {label}
                  </a>
                ))}
                <a
                  href="#contato"
                  onClick={() => setIsOpen(false)}
                  className="font-bold bg-legado-gold text-legado-black px-5 py-2 rounded-md transition-all duration-300 hover:bg-legado-darkGold hover:text-legado-white text-center"
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