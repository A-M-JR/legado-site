import React, { useState } from 'react';
import { Send, Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to your backend
    console.log('Form submitted:', formData);
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: '',
    });
  };

  return (
    <section id="contato" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#8A7A42] mb-4">
            Entre em <span className="text-[#D4B74C]">Contato</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Estamos aqui para responder suas dúvidas e apresentar como o Legado 
            pode ajudar sua empresa ou família.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="md:w-1/2 bg-[#F5F3E4] rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
                Envie sua mensagem
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="name"
                    className="block text-[#8A7A42] font-medium mb-2"
                  >
                    Nome completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#D4B74C]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/50"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="block text-[#8A7A42] font-medium mb-2"
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#D4B74C]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/50"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label
                    htmlFor="phone"
                    className="block text-[#8A7A42] font-medium mb-2"
                  >
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-[#D4B74C]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/50"
                  />
                </div>
                
                <div className="mb-6">
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
                    className="w-full p-3 border border-[#D4B74C]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4B74C]/50"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  className="bg-[#D4B74C] text-white px-6 py-3 rounded-md hover:bg-[#C3A53B] transition-colors font-medium flex items-center justify-center gap-2"
                >
                  Enviar Mensagem <Send size={18} />
                </button>
              </form>
            </div>
            
            <div className="md:w-1/2">
              <div className="bg-[#F5F3E4] rounded-xl p-8 shadow-md mb-8">
                <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
                  Informações de Contato
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-[#D4B74C]/20 p-3 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-[#D4B74C]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-[#8A7A42]">
                        E-mail
                      </h4>
                      <p className="text-gray-600">contato@legadoapp.com.br</p>
                      <p className="text-gray-600">suporte@legadoapp.com.br</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#D4B74C]/20 p-3 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-[#D4B74C]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-[#8A7A42]">
                        Telefone
                      </h4>
                      <p className="text-gray-600">(11) 3456-7890</p>
                      <p className="text-gray-600">(11) 98765-4321</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-[#D4B74C]/20 p-3 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-[#D4B74C]" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-[#8A7A42]">
                        Endereço
                      </h4>
                      <p className="text-gray-600">
                        Av. Paulista, 1000 - 10º andar
                      </p>
                      <p className="text-gray-600">
                        Bela Vista, São Paulo - SP, 01310-100
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#F5F3E4] rounded-xl p-8 shadow-md">
                <h3 className="text-2xl font-serif font-semibold text-[#8A7A42] mb-6">
                  Horário de Atendimento
                </h3>
                <p className="text-gray-600 mb-4">
                  <span className="font-medium">Segunda a Sexta:</span> 9h às 18h
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Sábado:</span> 9h às 13h
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;