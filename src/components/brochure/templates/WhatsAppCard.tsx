import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const WhatsAppCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;

  return (
    <div
      className="relative w-full h-full flex overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.9))`,
        fontFamily: config.theme.fontFamily,
      }}
    >
      {/* Left content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4">
        <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: `hsl(${config.theme.secondary})` }}>
          {config.instituteName}
        </p>
        <h1 className="text-xl font-extrabold text-white leading-tight mb-2">
          {content.title || 'Admissions Open'}
        </h1>
        <p className="text-xs text-white/80 mb-3 leading-relaxed">
          {content.subtitle || 'Contact us for more details.'}
        </p>

        <div className="flex items-center gap-2 text-xs text-white/70">
          <span>📞 {config.contact.phone}</span>
        </div>
      </div>

      {/* Right side: accent + QR */}
      <div
        className="w-36 flex flex-col items-center justify-center gap-3"
        style={{ background: `hsl(${config.theme.secondary})` }}
      >
        <p className="text-[10px] font-bold text-center px-2" style={{ color: `hsl(${config.theme.secondaryForeground})` }}>
          {content.ctaText || 'Scan & Visit'}
        </p>
        <div className="bg-white p-1.5 rounded-md">
          <QRCodeSVG value={websiteUrl} size={60} level="M" />
        </div>
        <p className="text-[9px] opacity-80" style={{ color: `hsl(${config.theme.secondaryForeground})` }}>
          {content.academicYear || config.academicYear}
        </p>
      </div>
    </div>
  );
};

export default WhatsAppCard;
