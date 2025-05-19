import { IoLogoWhatsapp } from 'react-icons/io';

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5545991426658"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center z-50"
      aria-label="Contato WhatsApp"
    >
      <IoLogoWhatsapp size={28} />
    </a>
  );
}
