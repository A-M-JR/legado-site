// src/components/Contact.tsx
import React, { useState, useEffect } from 'react';
import { Send, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-legado-dark">
            Entre em <span className="text-legado-gold">Contato</span>
          </h2>
          <p className="mt-4 text-legado-dark/70 max-w-2xl mx-auto">
            Fale conosco para saber como o Legado pode transformar suas lembranças em histórias eternas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
          <motion.div
            className="lg:col-span-7 bg-legado-white rounded-3xl shadow-2xl p-6 md:p-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-serif font-semibold text-legado-dark mb-6">
              Envie sua mensagem
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {[
                { label: 'Nome completo', name: 'name', type: 'text', required: true, placeholder: 'Seu nome completo' },
                { label: 'E-mail', name: 'email', type: 'email', required: true, placeholder: 'seu@email.com' },
                { label: 'Telefone', name: 'phone', type: 'tel', required: false, placeholder: '(XX) XXXXX-XXXX' }
              ].map(({ label, name, type, required, placeholder }) => (
                <div key={name}>
                  <label htmlFor={name} className="block text-legado-dark font-medium mb-2">
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
                    aria-label={label}
                    className="w-full p-3 border border-legado-gold/40 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-legado-gold transition"
                  />
                </div>
              ))}

              <div>
                <label htmlFor="message" className="block text-legado-dark font-medium mb-2">
                  Mensagem
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="Escreva sua mensagem aqui..."
                  aria-label="Mensagem"
                  className="w-full p-3 border border-legado-gold/40 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-legado-gold transition resize-none"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  name="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={handleChange}
                  className="mt-1"
                />
                <label htmlFor="consent" className="text-sm text-legado-dark/80">
                  Concordo com a <a href="/politica-de-privacidade" className="text-legado-gold underline">Política de Privacidade</a> e autorizo o uso dos dados para contato. (Obrigatório)
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="submit"
                  disabled={sending}
                  aria-busy={sending}
                  className="w-full sm:w-auto inline-flex items-center justify-center bg-legado-gold text-legado-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-legado-darkGold hover:text-legado-white transition transform duration-300 ease-in-out hover:scale-105 disabled:opacity-60"
                >
                  <Send className="mr-2" />
                  {sending ? 'Enviando...' : 'Enviar Mensagem'}
                </button>

                <div className="text-sm text-legado-dark/60">
                  <div>Ao enviar, você concorda com a política de privacidade.</div>
                  <div className="mt-1">Também pode nos contatar em: <a href="mailto:contato@legadoeconforto.com.br" className="text-legado-gold underline">contato@legadoeconforto.com.br</a></div>
                </div>
              </div>

              {/* status message */}
              <div aria-live="polite" className="min-h-[1.5rem]">
                {status.ok === true && (
                  <div className="mt-4 text-sm text-green-700 bg-green-100 border border-green-200 p-3 rounded-md">
                    {status.message}
                  </div>
                )}
                {status.ok === false && (
                  <div className="mt-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-md">
                    {status.message}
                  </div>
                )}
              </div>
            </form>
          </motion.div>

          <motion.div
            className="lg:col-span-5 bg-legado-white rounded-3xl shadow-2xl p-6 md:p-12 flex flex-col justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-serif font-semibold text-legado-dark mb-6">
              Informações de Contato
            </h3>
            <div className="space-y-6">
              {[
                { icon: <Mail className="h-6 w-6 text-legado-gold" />, title: 'E-mail', desc: 'contato@legadoeconforto.com.br', href: 'mailto:contato@legadoeconforto.com.br' },
                { icon: <Phone className="h-6 w-6 text-legado-gold" />, title: 'Telefone', desc: '(45) 99142-6658', href: 'tel:+5545991426658' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="p-3 bg-legado-gold/20 rounded-full flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-legado-dark font-medium mb-1">{item.title}</h4>
                    <p className="text-legado-dark/70">
                      <a href={item.href} className="hover:underline">{item.desc}</a>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-xs text-legado-dark/60">
              <strong>Horário de atendimento:</strong> Segunda a Sexta, 9h - 18h
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}