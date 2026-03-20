import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const WhatsAppCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';

  return (
    <div
      className="relative w-full h-full flex overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Gradient BG */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 0% 0%, hsl(${config.theme.secondary} / 0.2) 0%, transparent 50%),
            linear-gradient(135deg, hsl(${config.theme.primary}) 0%, hsl(${config.theme.primary} / 0.92) 100%)
          `,
        }}
      />

      {/* Subtle shapes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450" fill="none">
        <circle cx="700" cy="60" r="100" fill="white" opacity="0.04" />
        <path d="M0 350 Q400 300 800 340" stroke="white" strokeWidth="0.5" opacity="0.08" />
      </svg>

      {/* Left content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-4">
        <div className="flex items-center gap-2 mb-3">
          {logoPath && <img src={logoPath} alt="" className="h-7 w-auto" crossOrigin="anonymous" />}
          <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: `hsl(${config.theme.secondary})` }}>
            {config.instituteName}
          </p>
        </div>
        <h1 className="text-xl font-extrabold text-white leading-tight mb-2">
          {content.title || 'Admissions Open'}
        </h1>
        <p className="text-xs text-white/80 mb-3 leading-relaxed max-w-[95%]">
          {content.subtitle || 'Contact us for more details.'}
        </p>

        <div className="flex items-center gap-3 text-xs text-white/70">
          <span>📞 {config.contact.phone}</span>
        </div>
      </div>

      {/* Right side */}
      <div
        className="relative z-10 w-36 flex flex-col items-center justify-center gap-3"
        style={{
          background: `linear-gradient(180deg, hsl(${config.theme.secondary}), hsl(${config.theme.secondary} / 0.9))`,
        }}
      >
        <p className="text-[10px] font-bold text-center px-2" style={{ color: `hsl(${config.theme.secondaryForeground})` }}>
          {content.ctaText || 'Scan & Visit'}
        </p>
        <div className="bg-white p-2 rounded-lg shadow-md">
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
