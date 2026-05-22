import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Send, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { maskCPF, maskCNPJ, maskTelefone } from '../lib/masks';

const PartnerSection = () => {
  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    responsavel: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Olá, gostaria de ser parceiro do ILC! Seguem meus dados:
Empresa: ${formData.razaoSocial}
CPF/CNPJ: ${formData.cnpj}
Telefone: ${formData.telefone}
E-mail: ${formData.email}
Responsável: ${formData.responsavel}`;

    window.open(`https://wa.me/5545999292369?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="parceiros" className="py-24 bg-[#FAFAF8] overflow-hidden relative">
      {/* Background Decorativo Suave */}
      <div className="absolute top-0 right-0 w-[50%] h-full bg-[#70A97F]/5 -skew-x-12 transform origin-top-right" />
      
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Lado do Conteúdo */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center justify-center gap-2 bg-[#70A97F]/10 px-4 py-2 rounded-full text-[#2D5A4E] font-bold text-[10px] sm:text-xs uppercase tracking-widest mb-8 border border-[#70A97F]/20 mx-auto lg:mx-0">
                <Building2 size={16} />
                Para minha empresa
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#2D5A4E] mb-6 leading-tight">
                Seus clientes não querem apenas um serviço. <br className="hidden lg:block" />
                <span className="text-[#70A97F]">Eles querem cuidado de verdade.</span>
              </h2>
              
              <p className="text-base md:text-lg lg:text-xl text-[#4A4A4A] mb-12 font-medium leading-relaxed italic">
                O ILC transforma o seu atendimento em uma experiência completa — gerando valor emocional, diferenciação e novas receitas.
              </p>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10 text-left">
                {/* O problema que você já vive */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#2D5A4E] mb-6 flex items-center gap-3 border-b-2 border-[#70A97F]/20 pb-4">
                    <AlertCircle className="text-red-400 shrink-0" size={24} />
                    O problema hoje
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Serviços comoditizados',
                      'Dificuldade em se diferenciar',
                      'Pressão constante por preço',
                      'Falta de conexão emocional'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-[#4A4A4A] font-medium text-base md:text-lg">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                         {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* O que sua empresa passa a oferecer */}
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-[#2D5A4E] mb-6 flex items-center gap-3 border-b-2 border-[#70A97F]/20 pb-4">
                    <CheckCircle2 className="text-[#70A97F] shrink-0" size={24} />
                    O que passa a oferecer
                  </h3>
                  <ul className="space-y-4">
                    {[
                      'Memorial digital para clientes',
                      'Apoio no luto e acolhimento',
                      'Solução para cuidados paliativos',
                      'Ferramentas para o idoso'
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-[#4A4A4A] font-medium text-base md:text-lg">
                         <ArrowRight className="text-[#70A97F] shrink-0 mt-1" size={18} />
                         {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* A Solução */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border-l-[6px] border-[#70A97F] mb-10 text-left">
                <h3 className="text-xl font-bold text-[#2D5A4E] mb-2">A solução definitiva</h3>
                <p className="text-[#4A4A4A] font-medium text-lg">
                  Com o ILC, você entrega muito mais do que o serviço principal. Você entrega continuidade, acolhimento e significado.
                </p>
              </div>

              {/* O que isso gera para o seu negócio */}
              <div className="mb-12 bg-[#2D5A4E] p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#70A97F]/20 rounded-full pointer-events-none" />
                <h3 className="text-xl md:text-2xl font-bold text-white mb-6 relative z-10">O que isso gera para o negócio</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {[
                    'Diferenciação',
                    'Aumento de ticket',
                    'Novas receitas',
                    'Fidelização',
                    'Indicação natural'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-white/90 font-medium text-base md:text-lg">
                       <CheckCircle2 className="text-[#70A97F] shrink-0" size={20} />
                       {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resultado real */}
              <div className="bg-[#FAFAF8] p-8 rounded-[2rem] border-2 border-[#70A97F]/20 italic text-xl text-[#2D5A4E] font-medium shadow-sm">
                <span className="block text-xs font-bold uppercase tracking-widest text-[#70A97F] not-italic mb-3">Resultado Real</span>
                "Quando você cuida de verdade, o cliente percebe. E quando ele percebe, ele valoriza — e paga mais por isso."
              </div>
            </motion.div>
          </div>

          {/* Lado do Formulário */}
          <div className="lg:w-1/2 w-full sticky top-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-10 md:p-14 rounded-[3rem] shadow-premium border border-[#70A97F]/10 relative overflow-hidden"
            >
              <h3 className="text-2xl font-serif font-bold text-[#2D5A4E] mb-2 text-center">Posicione sua empresa um nível acima da concorrência</h3>
              <p className="text-[#4A4A4A] text-center mb-10 font-medium">Preencha os dados e nossa equipe entrará em contato.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#4A4A4A] mb-2 uppercase tracking-widest">Razão Social</label>
                  <input 
                    type="text" 
                    required
                    value={formData.razaoSocial}
                    onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#70A97F] focus:bg-white rounded-xl outline-none transition-all font-medium"
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#4A4A4A] mb-2 uppercase tracking-widest">CPF / CNPJ</label>
                    <input 
                      type="text" 
                      required
                      value={formData.cnpj}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, cnpj: val.length <= 11 ? maskCPF(e.target.value) : maskCNPJ(e.target.value) });
                      }}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#70A97F] focus:bg-white rounded-xl outline-none transition-all font-medium"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      maxLength={18}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#4A4A4A] mb-2 uppercase tracking-widest">Telefone</label>
                    <input 
                      type="tel" 
                      required
                      value={formData.telefone}
                      onChange={(e) => setFormData({ ...formData, telefone: maskTelefone(e.target.value) })}
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#70A97F] focus:bg-white rounded-xl outline-none transition-all font-medium"
                      placeholder="(XX) XXXXX-XXXX"
                      maxLength={15}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A4A] mb-2 uppercase tracking-widest">E-mail</label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#70A97F] focus:bg-white rounded-xl outline-none transition-all font-medium"
                    placeholder="seu@contato.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A4A4A] mb-2 uppercase tracking-widest">Nome do Responsável</label>
                  <input 
                    type="text" 
                    required
                    value={formData.responsavel}
                    onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                    className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-[#70A97F] focus:bg-white rounded-xl outline-none transition-all font-medium"
                    placeholder="Nome completo"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-[#70A97F] text-white font-bold py-5 rounded-xl shadow-lg shadow-[#70A97F]/20 hover:bg-[#2D5A4E] transition-all flex items-center justify-center gap-3 mt-6 text-sm tracking-widest uppercase"
                >
                  <Send size={18} />
                  QUERO SER PARCEIRO
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
