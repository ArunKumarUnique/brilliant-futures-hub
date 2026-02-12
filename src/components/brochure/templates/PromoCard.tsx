import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const PromoCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const bgImage = content.selectedGalleryImage || config.hero.images[0];

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
          style={{ background: `linear-gradient(to top, hsl(${config.theme.primary} / 0.95), hsl(${config.theme.primary} / 0.5) 50%, hsl(${config.theme.primary} / 0.3))` }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-end p-8">
        <span
          className="self-start text-[10px] font-bold px-3 py-1 rounded-full mb-3"
          style={{ background: `hsl(${config.theme.secondary})`, color: `hsl(${config.theme.secondaryForeground})` }}
        >
          {config.instituteName}
        </span>

        <h1 className="text-2xl font-extrabold leading-tight mb-2 text-white">
          {content.title || config.instituteName}
        </h1>
        <p className="text-sm text-white/85 leading-relaxed mb-4">
          {content.subtitle || 'Quality education for a brighter future.'}
        </p>

        {content.ctaText && (
          <div
            className="self-start px-4 py-2 rounded-lg text-sm font-bold"
            style={{ background: `hsl(${config.theme.secondary})`, color: `hsl(${config.theme.secondaryForeground})` }}
          >
            {content.ctaText}
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div className="relative z-10 px-8 py-3 flex items-center justify-between" style={{ background: `hsl(${config.theme.primary})` }}>
        <p className="text-[10px] text-white/80">📞 {config.contact.phone}</p>
        <div className="bg-white p-1 rounded">
          <QRCodeSVG value={websiteUrl} size={36} level="M" />
        </div>
      </div>
    </div>
  );
};

export default PromoCard;
