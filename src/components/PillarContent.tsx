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
  problemTitle: string;
  problems: string[];
  solutionTitle: string;
  solutions: string[];
  changesTitle?: string;
  changes?: string[];
  benefitsTitle: string;
  benefits: string[];
  forWhoTitle: string;
  forWho: string[];
  ctaText: string;
  testimonials: {
    text: string;
    author: string;
    sub: string;
  }[];
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
          <div className="bg-[#FAFAF8] p-12 rounded-[3rem] border border-gray-100 relative overflow-hidden group">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-[#2D5A4E] mb-10 flex items-center gap-4">
              <AlertCircle className="text-red-400 shrink-0" size={32} />
              {data.problemTitle}
            </h3>
            <ul className="space-y-8">
              {data.problems.map((problem, i) => (
                <li key={i} className="flex items-start gap-4 text-lg text-[#4A4A4A] font-medium leading-relaxed">
                  <div className="mt-2 h-2 w-2 rounded-full bg-red-400 shrink-0" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* Solution Card */}
          <div className="bg-[#2D5A4E] p-12 rounded-[3rem] border-t-[8px] border-[#70A97F] relative overflow-hidden text-white group shadow-xl">
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-10 flex items-center gap-4 text-[#70A97F]">
              <CheckCircle2 className="text-[#70A97F] shrink-0" size={32} />
              {data.solutionTitle}
            </h3>
            <ul className="space-y-8">
              {data.solutions.map((solution, i) => (
                <li key={i} className="flex items-start gap-4 text-lg font-medium leading-relaxed text-white/90">
                  <div className="mt-2 h-1.5 w-8 bg-[#70A97F] rounded-full shrink-0" />
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Changes and Benefits */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
           {data.changes && (
              <div className="p-10 bg-white rounded-[2.5rem] border-2 border-[#70A97F]/10 relative">
                <h4 className="text-lg font-serif font-bold text-[#2D5A4E] mb-8 uppercase tracking-[0.2em] border-b-2 border-[#70A97F]/20 pb-6">
                  {data.changesTitle || "O que muda na sua vida"}
                </h4>
                <ul className="space-y-6">
                  {data.changes.map((c, i) => (
                    <li key={i} className="flex items-center gap-4 font-bold text-[#4A4A4A] text-lg">
                      <ArrowRight size={20} className="text-[#70A97F] shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
           )}
           <div className="p-10 bg-[#FAFAF8] rounded-[2.5rem] shadow-sm border border-gray-100">
              <h4 className="text-lg font-serif font-bold text-[#2D5A4E] mb-8 uppercase tracking-[0.2em] border-b-2 border-[#70A97F]/20 pb-6">
                {data.benefitsTitle}
              </h4>
              <ul className="space-y-6">
                {data.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-4 font-bold text-[#4A4A4A] text-lg">
                    <CheckCircle2 size={24} className="text-[#70A97F] shrink-0" />
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
            <h3 className="text-3xl font-serif font-bold text-[#2D5A4E] mb-4 text-center">Acolhimento Real</h3>
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

        {/* Final Call to Action */}
        <div className="text-center bg-[#2D5A4E] py-16 md:py-20 px-6 md:px-10 rounded-[3rem] md:rounded-[4rem] shadow-xl relative overflow-hidden">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-white mb-10 relative z-10 leading-tight">
            Não passe por isso sozinho. <br />
            <span className="text-[#70A97F]">Nós cuidamos de tudo para você.</span>
          </h3>
          <button 
            onClick={() => navigate('/legado-app/titulares/novo')}
            className="w-full md:w-auto inline-flex items-center justify-center bg-[#70A97F] text-white px-8 md:px-14 py-5 md:py-6 rounded-2xl shadow-lg shadow-[#70A97F]/20 hover:bg-white hover:text-[#2D5A4E] transition-all transform hover:scale-105 font-bold text-sm md:text-lg uppercase tracking-widest group relative z-10"
          >
            {data.ctaText}
            <ArrowRight className="ml-3 md:ml-4 group-hover:translate-x-2 transition-transform shrink-0" size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PillarContent;
