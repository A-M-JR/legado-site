import React, { useState } from 'react';
import { Send, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso!');
    setFormData({ name: '', email: '', phone: '', message: '' });
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
            className="lg:col-span-7 bg-legado-white rounded-3xl shadow-2xl p-8 md:p-12"
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
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center bg-legado-gold text-legado-black font-semibold px-6 py-3 rounded-full shadow-md hover:bg-legado-darkGold hover:text-legado-white transition transform duration-300 ease-in-out hover:scale-105"
                aria-label="Enviar mensagem"
              >
                <Send className="mr-2 animate-[pulse_2s_ease-in-out_infinite]" />
                Enviar Mensagem
              </button>
            </form>
          </motion.div>
          <motion.div
            className="lg:col-span-5 bg-legado-white rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col justify-center"
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
                { icon: <Mail className="h-6 w-6 text-legado-gold" />, title: 'E-mail', desc: 'contato@legadoeconforto.com.br' },
                { icon: <Phone className="h-6 w-6 text-legado-gold" />, title: 'Telefone', desc: '(45) 99142-6658' }
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="p-3 bg-legado-gold/20 rounded-full flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-legado-dark font-medium mb-1">{item.title}</h4>
                    <p className="text-legado-dark/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
