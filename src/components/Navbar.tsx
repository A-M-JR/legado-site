import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#F5F3E4] shadow-md py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <img src={logo} alt="Legado" className="h-12" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#inicio"
              className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
            >
              Início
            </a>
            <a
              href="#sobre"
              className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
            >
              Sobre
            </a>
            <a
              href="#recursos"
              className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
            >
              Recursos
            </a>
            <a
              href="#depoimentos"
              className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
            >
              Depoimentos
            </a>
            <a
              href="#parceiros"
              className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
            >
              Parceiros
            </a>
            <a
              href="#contato"
              className="bg-[#D4B74C] text-white px-4 py-2 rounded-md hover:bg-[#C3A53B] transition-colors font-medium"
            >
              Contato
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#8A7A42] hover:text-[#D4B74C] focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-[#F5F3E4] rounded-lg shadow-lg p-4 animate-fade-in-down">
            <div className="flex flex-col space-y-4">
              <a
                href="#inicio"
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Início
              </a>
              <a
                href="#sobre"
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Sobre
              </a>
              <a
                href="#recursos"
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Recursos
              </a>
              <a
                href="#depoimentos"
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Depoimentos
              </a>
              <a
                href="#parceiros"
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium"
                onClick={() => setIsOpen(false)}
              >
                Parceiros
              </a>
              <a
                href="#contato"
                className="bg-[#D4B74C] text-white px-4 py-2 rounded-md hover:bg-[#C3A53B] transition-colors font-medium text-center"
                onClick={() => setIsOpen(false)}
              >
                Contato
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;