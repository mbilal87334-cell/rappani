import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useStore();
  const whatsappNumber = settings.storePhone || '910000000000';
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=Hi! I need some help with my shopping.`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center group"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-4 bg-white text-gray-900 text-sm font-bold py-2 px-4 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us
      </span>
    </a>
  );
};
