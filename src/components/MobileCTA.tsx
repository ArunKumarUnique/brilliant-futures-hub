import { Phone, MessageCircle } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { useLocation } from 'react-router-dom';

const MobileCTA = () => {
  const { config } = useTenant();
  const location = useLocation();

  // Hide on admin routes
  if (location.pathname.startsWith('/admin')) return null;

  const phone = config.contact.phone.replace(/\s+/g, '');
  const whatsappNumber = phone.startsWith('+') ? phone.slice(1) : phone;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 md:hidden">
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
      <a
        href={`tel:${phone}`}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        aria-label="Call"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
};

export default MobileCTA;
