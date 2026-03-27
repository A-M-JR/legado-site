import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/Legado - Verde.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre Nós' },
    { href: '#recursos', label: 'Jornadas' },
    { href: '#depoimentos', label: 'Histórias' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled
          ? 'bg-legado-white/95 backdrop-blur-lg shadow-sm py-3'
          : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo com transição de escala */}
          <motion.a
            href="#inicio"
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="Legado" className="h-10 md:h-12 object-contain" />
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6 mr-4">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-legado-dark hover:text-legado-gold transition-all duration-300 font-bold text-sm tracking-wide uppercase"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 border-l border-legado-gold/20 pl-6">
              {/* Botão Acessar App */}
              <button
                onClick={() => navigate('/legado-app/login')}
                className="flex items-center gap-2 text-legado-dark hover:text-legado-gold font-bold text-sm transition-all px-4 py-2 rounded-xl hover:bg-legado-gold/10"
              >
                <LogIn size={18} />
                Plataforma
              </button>

              {/* Botão Contato */}
              <a
                href="#contato"
                className="bg-legado-gold text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl shadow-legado-gold/20 hover:bg-legado-dark hover:text-white transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
              >
                <Heart size={16} className="fill-current" />
                Falar Conosco
              </a>
            </div>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-[#255f4f] hover:bg-[#f4fbf8] rounded-lg transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-legado-white rounded-2xl mt-4 shadow-2xl border border-legado-gold/10"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="text-legado-dark text-lg font-bold hover:text-legado-gold py-2 border-b border-legado-gold/5"
                  >
                    {label}
                  </a>
                ))}

                <div className="grid grid-cols-1 gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      navigate('/legado-app/login');
                    }}
                    className="flex items-center justify-center gap-2 w-full font-bold text-legado-dark bg-legado-gold/10 py-4 rounded-xl"
                  >
                    <LogIn size={20} />
                    Acessar Plataforma
                  </button>

                  <a
                    href="#contato"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full font-bold bg-legado-gold text-white py-4 rounded-xl shadow-xl shadow-legado-gold/20"
                  >
                    <Heart size={18} className="fill-current" />
                    Quero Conhecer
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}