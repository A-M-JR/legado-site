import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: 'Início' },
    { href: '#sobre', label: 'Sobre' },
    { href: '#recursos', label: 'Recursos' },
    { href: '#depoimentos', label: 'Depoimentos' },
    { href: '#parceiros', label: 'Parceiros' },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#F5F3E4] shadow-md py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <a href="#">
            <img src={logo} alt="Legado" className="h-16" />
          </a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[#8A7A42] hover:text-[#D4B74C] transition-colors font-medium text-sm md:text-base"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contato"
              className="bg-[#D4B74C] hover:bg-[#C3A53B] text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Contato
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-[#8A7A42] hover:text-[#D4B74C]"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-[#F5F3E4] rounded-lg shadow-lg p-4 animate-fade-in-down backdrop-blur-md">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[#8A7A42] hover:text-[#D4B74C] font-medium text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#contato"
                className="bg-[#D4B74C] text-white px-4 py-2 rounded-md hover:bg-[#C3A53B] font-medium text-center"
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
}
