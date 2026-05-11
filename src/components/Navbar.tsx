import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo-ilc.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#caminhos', label: 'Soluções' },
    { href: '#parceiros', label: 'Parceiros' },
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
          ? 'bg-white/95 backdrop-blur-lg shadow-sm py-2'
          : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo com transição de escala */}
          <motion.a
            href="#inicio"
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2"
          >
            <img src={logo} alt="ILC" className="h-10 md:h-14 object-contain" />
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6 mr-4">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="text-[#70A97F] hover:text-[#2D5A4E] transition-all duration-300 font-bold text-sm tracking-widest uppercase"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 border-l border-[#70A97F]/20 pl-6">
              {/* Botão Acessar App */}
              <button
                onClick={() => navigate('/legado-app/login')}
                className="flex items-center gap-2 text-[#70A97F] hover:text-[#2D5A4E] font-bold text-sm transition-all px-4 py-2 rounded-xl"
              >
                <LogIn size={18} />
                Plataforma
              </button>

              {/* Botão Contato */}
              <a
                href="#parceiros"
                className="bg-[#70A97F] text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-[#70A97F]/20 hover:bg-[#2D5A4E] transition-all flex items-center gap-2"
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
              className="md:hidden overflow-hidden bg-white rounded-2xl mt-4 shadow-2xl border border-[#70A97F]/10"
            >
              <div className="flex flex-col p-6 space-y-4">
                {navLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className="text-[#2D5A4E] text-lg font-bold hover:text-[#70A97F] py-2 border-b border-[#70A97F]/5"
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
                    className="flex items-center justify-center gap-2 w-full font-bold text-[#2D5A4E] bg-[#70A97F]/10 py-4 rounded-xl"
                  >
                    <LogIn size={20} />
                    Acessar Plataforma
                  </button>

                  <a
                    href="#parceiros"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full font-bold bg-[#70A97F] text-white py-4 rounded-xl shadow-xl shadow-[#70A97F]/20"
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