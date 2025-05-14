import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <section id="contato" className="py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Entre em <span className="text-[#D4B74C]">Contato</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Estamos aqui para responder suas dúvidas e apresentar como o Legado pode ajudar sua empresa ou família.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Formulário */}
            <div className="md:w-1/2 bg-[#F5F3E4] rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
                Envie sua mensagem
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { label: 'Nome completo', name: 'name', type: 'text' },
                  { label: 'E-mail', name: 'email', type: 'email' },
                  { label: 'Telefone', name: 'phone', type: 'tel' },
                ].map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="block text-[#8A7A42] font-medium mb-2"
                    >
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      value={(formData as any)[field.name]}
                      onChange={handleChange}
                      className="w-full p-3 border border-[#D4B74C]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/40"
                      required={field.name !== 'phone'}
                    />
                  </div>
                ))}

                <div>
                  <label
                    htmlFor="message"
                    className="block text-[#8A7A42] font-medium mb-2"
                  >
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-3 border border-[#D4B74C]/30 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/40"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full bg-[#D4B74C] text-white px-6 py-3 rounded-md hover:bg-[#C3A53B] transition-colors font-medium flex items-center justify-center gap-2 shadow-md"
                >
                  Enviar Mensagem <Send size={18} />
                </button>
              </form>
            </div>

            {/* Informações de Contato */}
            <div className="md:w-1/2">
              <div className="bg-[#F5F3E4] rounded-2xl p-8 shadow-lg h-full">
                <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
                  Informações de Contato
                </h3>

                <div className="space-y-6">
                  {[
                    {
                      icon: <Mail className="h-6 w-6 text-[#D4B74C]" />,
                      title: 'E-mail',
                      lines: [
                        'contato@legadoeconforto.com.br',
                      ],
                    },
                    {
                      icon: <Phone className="h-6 w-6 text-[#D4B74C]" />,
                      title: 'Telefone',
                      lines: ['(45) 99999-9999'],
                    },
                    {
                      icon: <MapPin className="h-6 w-6 text-[#D4B74C]" />,
                      title: 'Endereço',
                      lines: [
                        'Av. Aracy Tanaka Biazetto, 6268',
                        'Região do Lago, Cascavel - PR, 85816-455',
                      ],
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="bg-[#D4B74C]/20 p-3 rounded-full mr-4">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-[#8A7A42]">
                          {item.title}
                        </h4>
                        {item.lines.map((line, i) => (
                          <p key={i} className="text-gray-600">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
