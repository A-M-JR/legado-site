import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, ArrowRight, Quote, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PillarData {
  id: string;
  pillarTitle?: string;
  introText?: string;
  headline: string;
  subheadline: string;
  problemTitle: React.ReactNode;
  problems: string[];
  solutionTitle: React.ReactNode;
  solutions: string[];
  changesTitle?: React.ReactNode;
  changes?: string[];
  benefitsTitle: React.ReactNode;
  benefits: string[];
  forWhoTitle: React.ReactNode;
  forWho: string[];
  ctas: {
    text: string;
    wppMessage: string;
  }[];
  testimonials: {
    text: string;
    author: string;
    sub: string;
  }[];
  corporate?: {
    title: string;
    intro: React.ReactNode;
    challengesTitle: string;
    challenges: string[];
    solutionsTitle: string;
    solutions: string[];
    middleTexts: {
      title?: string;
      text: React.ReactNode;
    }[];
    benefitsTitle: string;
    benefits: string[];
    footerText: React.ReactNode;
  };
}

interface PillarContentProps {
  data: PillarData;
}

const PillarContent: React.FC<PillarContentProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-16 bg-white relative"
      id={`section-${data.id}`}
    >
      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        
        {/* Pillar Header */}
        <div className="max-w-5xl mx-auto mb-24 text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-[#70A97F] w-12" />
            <span className="text-[#70A97F] font-bold uppercase tracking-[0.4em] text-xs flex items-center gap-2">
               <Sparkles size={14} />
               {data.pillarTitle || data.id}
            </span>
            <div className="h-px bg-[#70A97F] w-12" />
          </div>
          
          {data.introText && (
             <div className="bg-[#FAFAF8] p-10 md:p-16 rounded-[3rem] border-l-[10px] border-[#70A97F] mb-16 shadow-sm">
                <p className="text-xl md:text-3xl text-[#2D5A4E] font-serif italic leading-relaxed">
                  {data.introText}
                </p>
             </div>
          )}

          <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#2D5A4E] mb-8 leading-tight">
            {data.headline}
          </h2>
          <p className="text-lg md:text-xl text-[#70A97F] font-bold italic max-w-3xl mx-auto leading-relaxed">
            {data.subheadline}
          </p>
        </div>

        {/* Problems vs Solutions Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
          {/* Problem Card */}
          <div className="bg-[#FAFAF8] p-12 rounded-[3rem] border-l-[8px] border-red-400 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2D5A4E] mb-10 flex items-center gap-4">
              <div className="bg-red-400/10 p-3 rounded-2xl">
                <AlertCircle className="text-red-500 shrink-0" size={32} />
              </div>
              {data.problemTitle}
            </h3>
            <ul className="space-y-8">
              {data.problems.map((problem, i) => (
                <li key={i} className="flex items-start gap-4 text-lg text-[#4A4A4A] font-medium leading-relaxed">
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-[#2D5A4E] p-12 rounded-[3rem] border-t-[8px] border-[#70A97F] relative overflow-hidden text-white group shadow-[0_10px_40px_rgba(112,169,127,0.3)] hover:shadow-[0_15px_50px_rgba(112,169,127,0.4)] transition-all">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-10 flex items-center gap-4 text-[#70A97F]">
              <div className="bg-white/10 p-3 rounded-2xl">
                <CheckCircle2 className="text-[#70A97F] shrink-0" size={32} />
              </div>
              {data.solutionTitle}
            </h3>
            <ul className="space-y-8">
              {data.solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-4 text-lg font-medium leading-relaxed text-white/90">
                  <div className="mt-2 h-2 w-8 bg-[#70A97F] rounded-full shrink-0 shadow-[0_0_10px_rgba(112,169,127,0.6)]" />
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Changes and Benefits */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
           {data.changes && (
              <div className="p-10 bg-white rounded-[2.5rem] border-2 border-[#70A97F]/10 relative shadow-lg hover:border-[#70A97F]/30 transition-all">
                <h4 className="text-2xl md:text-3xl font-serif font-bold text-[#70A97F] mb-8 border-b-2 border-[#70A97F]/20 pb-6">
                  {data.changesTitle || "O que muda na sua vida"}
                </h4>
                <ul className="space-y-6">
                  {data.changes.map((c, i) => (
                    <li key={i} className="flex items-center gap-4 font-bold text-[#4A4A4A] text-lg">
                      <div className="bg-[#70A97F]/10 p-2 rounded-full">
                        <ArrowRight size={20} className="text-[#70A97F] shrink-0" />
                      </div>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
           )}
           <div className="p-10 bg-[#FAFAF8] rounded-[2.5rem] shadow-lg border border-[#70A97F]/10 hover:border-[#70A97F]/30 transition-all">
              <h4 className="text-2xl md:text-3xl font-serif font-bold text-[#70A97F] mb-8 border-b-2 border-[#70A97F]/20 pb-6">
                {data.benefitsTitle}
              </h4>
              <ul className="space-y-6">
                {data.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold text-[#4A4A4A] text-lg">
                    <div className="bg-[#70A97F]/10 p-2 rounded-full">
                      <CheckCircle2 size={24} className="text-[#70A97F] shrink-0" />
                    </div>
                    {b}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* For Who Section */}
        {data.forWho && data.forWho.length > 0 && (
          <div className="max-w-4xl mx-auto mb-32 bg-white p-10 rounded-[2.5rem] border border-[#70A97F]/20 shadow-sm text-center">
            <h4 className="text-2xl font-serif font-bold text-[#2D5A4E] mb-8 inline-block relative">
              {data.forWhoTitle || "Para quem é"}
              <div className="absolute -bottom-2 left-0 w-full h-1 bg-[#70A97F]/30 rounded-full" />
            </h4>
            <ul className="space-y-4 max-w-2xl mx-auto text-left">
              {data.forWho.map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-lg text-[#4A4A4A] font-medium">
                  <div className="w-2 h-2 rounded-full bg-[#70A97F] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Testimonials Section */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#70A97F] mb-4 text-center">Depoimentos</h3>
            <div className="w-12 h-1 bg-[#70A97F] mx-auto rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {data.testimonials.map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] shadow-premium relative group border-b-8 border-transparent hover:border-[#70A97F] transition-all">
                <Quote className="absolute top-8 right-8 text-[#70A97F]/10 w-16 h-16" />
                <p className="text-lg text-[#4A4A4A] font-medium italic mb-10 relative z-10 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex flex-col pt-8 border-t-2 border-gray-50">
                  <span className="font-bold text-[#2D5A4E] text-lg">— {t.author}</span>
                  <span className="text-[#70A97F] font-bold text-xs uppercase tracking-[0.2em] mt-1">{t.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Section */}
        {data.corporate && (
          <div className="mt-32 mb-20 bg-[#2D5A4E]/5 border-t border-[#70A97F]/20 pt-20 pb-16 px-6 lg:px-16 rounded-[3rem]">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="inline-block relative mb-10">
                <div className="absolute inset-0 bg-[#70A97F] blur-lg opacity-30 rounded-full"></div>
                <div className="relative bg-[#2D5A4E] px-8 py-4 rounded-full shadow-xl border border-[#70A97F]/30">
                  <h3 className="text-lg md:text-xl uppercase tracking-widest font-bold text-white m-0">
                    {data.corporate.title}
                  </h3>
                </div>
              </div>
              <p className="text-sm font-bold text-[#70A97F] uppercase tracking-widest mb-6">Solução para Instituições e Parceiros</p>
              <div className="text-xl md:text-2xl text-[#2D5A4E] font-serif leading-relaxed font-bold">
                {data.corporate.intro}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
              <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100">
                <h4 className="text-xl font-serif font-bold text-[#2D5A4E] mb-6 flex items-center gap-3">
                  <AlertCircle className="text-red-400" size={24} />
                  {data.corporate.challengesTitle}
                </h4>
                <ul className="space-y-4">
                  {data.corporate.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#4A4A4A]">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-red-400 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#70A97F]/10 p-10 rounded-[2rem] border border-[#70A97F]/20">
                <h4 className="text-xl font-serif font-bold text-[#2D5A4E] mb-6 flex items-center gap-3">
                  <CheckCircle2 className="text-[#70A97F]" size={24} />
                  {data.corporate.solutionsTitle}
                </h4>
                <ul className="space-y-4">
                  {data.corporate.solutions.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 text-[#4A4A4A]">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-[#70A97F] shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {data.corporate.middleTexts.map((mt, i) => (
              <div key={i} className="max-w-4xl mx-auto text-center mb-16 bg-white p-10 rounded-[2rem] border-l-4 border-[#70A97F]">
                {mt.title && <h4 className="text-2xl font-serif font-bold text-[#2D5A4E] mb-6">{mt.title}</h4>}
                <div className="text-lg md:text-xl text-[#4A4A4A] leading-relaxed">
                  {mt.text}
                </div>
              </div>
            ))}

            <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2rem] shadow-sm border border-gray-100 mb-16">
              <h4 className="text-2xl font-serif font-bold text-[#2D5A4E] mb-8 text-center">{data.corporate.benefitsTitle}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.corporate.benefits.map((b, i) => (
                  <div key={i} className="flex items-center gap-3 text-[#4A4A4A] font-medium">
                    <CheckCircle2 size={24} className="text-[#70A97F] shrink-0" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center max-w-3xl mx-auto bg-[#2D5A4E] text-white p-8 rounded-[2rem] shadow-lg mb-12">
              <p className="text-xl md:text-2xl font-serif italic">
                {data.corporate.footerText}
              </p>
            </div>

            <div className="text-center">
              <button 
                onClick={() => window.open('https://wa.me/5545999292369?text=Olá,%20tenho%20interesse%20em%20contratar%20o%20ILC%20para%20minha%20instituição!', '_blank')}
                className="inline-flex items-center justify-center bg-[#70A97F] text-white px-10 py-5 rounded-2xl shadow-xl shadow-[#70A97F]/20 hover:bg-white hover:text-[#2D5A4E] transition-all transform hover:scale-105 font-bold text-sm md:text-lg uppercase tracking-widest group relative z-10"
              >
                Quero Contratar para minha Empresa
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform shrink-0" size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Final Call to Action */}
        <div className="text-center bg-[#2D5A4E] py-16 md:py-20 px-6 md:px-10 rounded-[3rem] md:rounded-[4rem] shadow-[0_20px_50px_rgba(45,90,78,0.4)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#70A97F]/20 via-transparent to-transparent opacity-60"></div>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-10 relative z-10 leading-tight">
            Não passe por isso sozinho. <br />
            <span className="text-[#70A97F]">Nós cuidamos de tudo para você.</span>
          </h3>
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-6 relative z-10 w-full max-w-5xl mx-auto">
            {data.ctas.map((cta, i) => (
              <button 
                key={i}
                onClick={() => window.open(`https://wa.me/5545999292369?text=${encodeURIComponent(cta.wppMessage)}`, '_blank')}
                className="w-full md:w-auto flex-1 inline-flex items-center justify-center bg-[#70A97F] text-white px-8 py-5 md:py-6 rounded-2xl shadow-[0_0_20px_rgba(112,169,127,0.5)] hover:shadow-[0_0_30px_rgba(112,169,127,0.8)] hover:bg-white hover:text-[#2D5A4E] transition-all transform hover:scale-105 font-bold text-sm md:text-base uppercase tracking-widest group"
              >
                {cta.text}
                <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform shrink-0" size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PillarContent;
