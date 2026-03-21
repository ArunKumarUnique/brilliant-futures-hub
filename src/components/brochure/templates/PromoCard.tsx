import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const PromoCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const bgImage = content.selectedGalleryImage || config.hero.images[0];
  const founderImage = content.showFounderImage ? config.founderImage : undefined;
  const founderLabel = config.founderLabel || 'Expert Faculty';

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to top, hsl(${config.theme.primary}) 0%, hsl(${config.theme.primary} / 0.85) 35%, hsl(${config.theme.primary} / 0.4) 65%, hsl(${config.theme.primary} / 0.2) 100%)
            `,
          }}
        />
      </div>

      {/* Decorative accents */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600" fill="none">
        <ellipse cx="520" cy="80" rx="100" ry="100" fill={`hsl(${config.theme.secondary})`} opacity="0.1" />
        <path d="M0 380 Q300 340 600 370" stroke="white" strokeWidth="0.6" opacity="0.1" />
      </svg>

      {/* Top logo bar */}
      <div className="relative z-10 px-6 pt-5 flex items-center gap-2">
        {logoPath && <img src={logoPath} alt="" className="h-8 w-auto" crossOrigin="anonymous" />}
        <span
          className="text-[10px] font-bold px-3 py-1 rounded-full"
          style={{ background: `hsl(${config.theme.secondary})`, color: `hsl(${config.theme.secondaryForeground})` }}
        >
          {config.instituteName}
        </span>
      </div>

      {/* Founder image - top right overlay */}
      {founderImage && (
        <div className="absolute top-14 right-5 z-20 flex flex-col items-center">
          <img
            src={founderImage}
            alt="Founder"
            className="w-[100px] h-[100px] object-cover object-top rounded-full"
            style={{
              border: `3px solid hsl(${config.theme.secondary})`,
              boxShadow: `0 6px 20px rgba(0,0,0,0.3), 0 0 0 4px hsl(${config.theme.secondary} / 0.2)`,
            }}
            crossOrigin="anonymous"
          />
          <span
            className="text-[7px] font-bold px-2 py-0.5 rounded-full mt-1"
            style={{
              background: `hsl(${config.theme.secondary})`,
              color: `hsl(${config.theme.secondaryForeground})`,
            }}
          >
            {founderLabel}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-8">
        <h1 className="text-2xl font-extrabold leading-tight mb-2 text-white">
          {content.title || config.instituteName}
        </h1>
        <p className="text-sm text-white/85 leading-relaxed mb-4 max-w-[90%]">
          {content.subtitle || 'Quality education for a brighter future.'}
        </p>

        {content.ctaText && (
          <div
            className="self-start px-5 py-2 rounded-full text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, hsl(${config.theme.secondary}), hsl(${config.theme.secondary} / 0.85))`,
              color: `hsl(${config.theme.secondaryForeground})`,
              boxShadow: `0 4px 12px hsl(${config.theme.secondary} / 0.3)`,
            }}
          >
            {content.ctaText}
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 px-6 py-3 flex items-center justify-between"
        style={{ background: `hsl(${config.theme.primary} / 0.95)`, backdropFilter: 'blur(4px)' }}
      >
        <p className="text-[10px] text-white/80 flex items-center gap-1">📞 {config.contact.phone}</p>
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-white/50">Scan to Visit</span>
          <div className="bg-white p-1 rounded shadow-sm">
            <QRCodeSVG value={websiteUrl} size={32} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoCard;