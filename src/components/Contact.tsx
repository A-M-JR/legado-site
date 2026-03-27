// src/components/Contact.tsx
import React, { useState, useEffect } from 'react';
import { Send, Mail, Phone, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Helper: parse UTM params once and persist in sessionStorage
function getUTM() {
  try {
    const url = new URL(window.location.href);
    const utm = {
      utm_source: url.searchParams.get('utm_source') || sessionStorage.getItem('utm_source') || '',
      utm_medium: url.searchParams.get('utm_medium') || sessionStorage.getItem('utm_medium') || '',
      utm_campaign: url.searchParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || '',
      referrer: document.referrer || sessionStorage.getItem('referrer') || '',
    };
    // persist for future navigation
    if (utm.utm_source) sessionStorage.setItem('utm_source', utm.utm_source);
    if (utm.utm_medium) sessionStorage.setItem('utm_medium', utm.utm_medium);
    if (utm.utm_campaign) sessionStorage.setItem('utm_campaign', utm.utm_campaign);
    if (utm.referrer) sessionStorage.setItem('referrer', utm.referrer);
    return utm;
  } catch {
    return { utm_source: '', utm_medium: '', utm_campaign: '', referrer: '' };
  }
}

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '', consent: false });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState({ ok: null, message: '' });
  const [utm, setUtm] = useState({ utm_source: '', utm_medium: '', utm_campaign: '', referrer: '' });

  useEffect(() => {
    setUtm(getUTM());
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Por favor, informe seu nome.';
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return 'Informe um e-mail válido.';
    if (!formData.message.trim() || formData.message.trim().length < 10) return 'Escreva uma mensagem com pelo menos 10 caracteres.';
    if (!formData.consent) return 'É preciso aceitar a política de privacidade para enviar a mensagem.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ok: null, message: '' });

    const err = validate();
    if (err) {
      setStatus({ ok: false, message: err });
      return;
    }

    setSending(true);

    // payload includes UTM/referrer for attribution
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      consent: formData.consent,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      referrer: utm.referrer,
      created_at: new Date().toISOString(),
    };

    try {
      // ===========================
      // Option A — send to your serverless API endpoint
      // ===========================
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Erro ao enviar a mensagem');
      }

      // Optionally, inform GTM/dataLayer about conversion:
      if (window && window.dataLayer) {
        window.dataLayer.push({ event: 'lead_submitted', lead_source: payload.utm_source || 'organic', lead_email: payload.email });
      }

      // ===========================
      // Option B — direct Supabase insert (uncomment & configure)
      // ===========================
      // import { createClient } from '@supabase/supabase-js'
      // const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_KEY)
      // await supabase.from('leads').insert(payload)

      setStatus({ ok: true, message: 'Obrigado! Sua mensagem foi enviada com sucesso. Em breve entraremos em contato.' });
      setFormData({ name: '', email: '', phone: '', message: '', consent: false });
    } catch (error) {
      console.error('Contact error', error);
      setStatus({ ok: false, message: 'Ocorreu um erro ao enviar. Tente novamente ou entre em contato pelo e-mail contato@legadoeconforto.com.br' });
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contato" className="py-24 bg-legado-mid bg-opacity-10">
      <div className="container mx-auto px-6 lg:px-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-legado-dark">
            Entre em <span className="text-legado-gold">Contato</span>
          </h2>
          <p className="mt-4 text-lg text-legado-dark font-bold max-w-2xl mx-auto italic">
            "Fale conosco para saber como o Legado pode transformar suas lembranças em histórias eternas."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          {/* Form Card */}
          <motion.div
            className="lg:col-span-7 bg-legado-white rounded-3xl shadow-2xl p-8 md:p-12 border-l-[6px] border-legado-gold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-serif font-bold text-legado-dark mb-8 uppercase tracking-wider">
              Envie sua mensagem
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Nome completo', name: 'name', type: 'text', required: true, placeholder: 'Seu nome' },
                  { label: 'E-mail', name: 'email', type: 'email', required: true, placeholder: 'seu@email.com' },
                  { label: 'Telefone', name: 'phone', type: 'tel', required: false, placeholder: '(XX) XXXXX-XXXX' }
                ].map(({ label, name, type, required, placeholder }) => (
                  <div key={name} className={name === 'name' ? 'md:col-span-2' : ''}>
                    <label htmlFor={name} className="block text-legado-dark font-bold mb-2 text-sm uppercase tracking-tight">
                      {label}
                    </label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      value={formData[name]}
                      onChange={handleChange}
                      required={required}
                      placeholder={placeholder}
                      className="w-full p-4 bg-legado-mid bg-opacity-5 border border-legado-gold/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-legado-gold/40 transition-all font-medium text-legado-dark"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label htmlFor="message" className="block text-legado-dark font-bold mb-2 text-sm uppercase tracking-tight">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Como podemos ajudar?"
                  className="w-full p-4 bg-legado-mid bg-opacity-5 border border-legado-gold/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-legado-gold/40 transition-all font-medium text-legado-dark resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-legado-gold/5 rounded-xl border border-legado-gold/10">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 rounded border-legado-gold text-legado-gold focus:ring-legado-gold"
                />
                <label htmlFor="consent" className="text-sm text-legado-dark/80 leading-relaxed font-medium">
                  Concordo com a <a href="/politica-de-privacidade" className="text-legado-gold underline font-bold">Política de Privacidade</a> e autorizo o uso dos dados para contato.
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center pt-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-legado-gold text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-legado-gold/20 hover:bg-legado-dark transition-all transform hover:-translate-y-1 disabled:opacity-60"
                >
                  <Send className="mr-3" size={20} />
                  {sending ? 'Enviando...' : 'Enviar Agora'}
                </button>

                <div className="text-xs text-legado-dark/50 leading-tight">
                  <p>Ao enviar, você aceita nossos termos.</p>
                  <p className="mt-1">Dúvidas? <a href="mailto:contato@legadoeconforto.com.br" className="text-legado-gold font-bold">contato@legadoeconforto.com.br</a></p>
                </div>
              </div>

              {status.message && (
                <div role="alert" className={`p-4 rounded-xl text-sm font-bold animate-pulse ${status.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {status.message}
                </div>
              )}
            </form>
          </motion.div>

          {/* Info Card */}
          <motion.div
            className="lg:col-span-5 flex flex-col gap-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-legado-white rounded-3xl shadow-xl p-8 md:p-12 border-l-[6px] border-legado-gold flex-1">
              <h3 className="text-2xl font-serif font-bold text-legado-dark mb-8 uppercase tracking-wider">
                Canais Diretos
              </h3>
              <div className="space-y-8">
                {[
                  { icon: <Mail className="h-7 w-7" />, title: 'E-mail Institucional', desc: 'contato@legadoeconforto.com.br', href: 'mailto:contato@legadoeconforto.com.br' },
                  { icon: <Phone className="h-7 w-7" />, title: 'Telefone / WhatsApp', desc: '(45) 99142-6658', href: 'tel:+5545991426658' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-5 group">
                    <div className="p-4 bg-legado-gold/10 rounded-full text-legado-gold group-hover:bg-legado-gold group-hover:text-legado-dark transition-all">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-legado-dark font-bold text-sm uppercase tracking-tight mb-1">{item.title}</h4>
                      <p className="text-lg text-legado-dark font-bold">
                        <a href={item.href} className="hover:text-legado-gold transition-colors">{item.desc}</a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-legado-gold/10">
                <p className="text-sm font-bold text-legado-dark/60 uppercase tracking-widest mb-2">Horário de Atendimento</p>
                <p className="text-legado-dark text-lg font-medium italic">Segunda a Sexta — 09h às 18h</p>
              </div>
            </div>

            {/* Motivational Small Card */}
            <div className="bg-legado-gold rounded-[2.5rem] p-8 text-white shadow-xl flex items-center gap-4 border-4 border-white">
               <Heart className="shrink-0 w-10 h-10 fill-current opacity-40" />
               <p className="font-serif italic text-xl leading-snug font-bold">
                 "Toda jornada merece um ombro amigo e uma história bem guardada."
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}