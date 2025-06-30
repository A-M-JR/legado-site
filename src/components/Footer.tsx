import React from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa'
import logo from '../assets/Legado - Branco.png'

export default function Footer() {
  return (
    <footer className="bg-[#242321] text-white">
      <div className="container mx-auto px-6 lg:px-14 py-14 grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
        {/* Logo e frase */}
        <div className="flex flex-col gap-5">
          <img src={logo} alt="Legado Logo" />
          <p className="text-sm text-white/80 leading-relaxed">
            Transformamos memórias em legados digitais que conectam gerações e amenizam a dor da perda.
          </p>
          <div className="flex space-x-3 mt-2">
            {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="p-2 bg-white/10 rounded-full hover:bg-[#5ba58c] transition-colors"
                aria-label="Rede social"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Navegação */}
        <div>
          <h4 className="font-serif font-semibold text-white text-base mb-3">Navegação</h4>
          <ul className="space-y-1 text-sm">
            {['Início', 'Sobre', 'Recursos', 'Depoimentos', 'Parceiros', 'Contato'].map((label, idx) => (
              <li key={idx}>
                <a href={`#${label.toLowerCase()}`} className="text-white/70 hover:text-[#5ba58c] transition-colors">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Recursos */}
        <div>
          <h4 className="font-serif font-semibold text-white text-base mb-3">Recursos</h4>
          <ul className="space-y-1 text-sm">
            {['FAQ', 'Suporte', 'Política de Privacidade', 'Termos de Uso', 'Blog'].map((item, idx) => (
              <li key={idx}>
                <a href="#" className="text-white/70 hover:text-[#5ba58c] transition-colors">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Botão de acesso ao Legado App */}
        <div className="flex flex-col md:items-end items-center justify-between h-full w-full">
          <span className="mb-2 text-white/50 text-xs md:text-sm md:text-right md:mb-3">Acesso restrito</span>
          <a
            href="/legado-app/login"
            className="
              inline-flex items-center justify-center
              px-5 py-2 rounded-full
              bg-[#365f52] hover:bg-[#5ba58c]
              text-white font-semibold text-sm
              shadow
              transition-all duration-150
              gap-2
              md:ml-auto
              "
            style={{
              minWidth: 170,
              boxShadow: '0 2px 12px rgba(90, 165, 140, 0.09)',
              letterSpacing: 0.2
            }}
          >
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M15 12H3m0 0l4-4m-4 4l4 4m5 6h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Acessar Legado App
          </a>
        </div>
      </div>
      <div className="border-t border-white/15 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Legado. Todos os direitos reservados.
      </div>
    </footer>
  )
}
