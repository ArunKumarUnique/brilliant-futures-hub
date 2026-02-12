import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const InstagramStory = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const bgImage = content.selectedGalleryImage || config.hero.images[0];

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* BG */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, hsl(${config.theme.primary} / 0.4) 0%, hsl(${config.theme.primary} / 0.9) 60%, hsl(${config.theme.primary}) 100%)` }} />
      </div>

      {/* Top: Institute */}
      <div className="relative z-10 pt-10 px-6 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-white/70">{config.instituteName}</p>
      </div>

      {/* Center: spacer for image visibility */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-6 pb-10 text-center">
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-3">
          {content.title || 'Join Us Today'}
        </h1>
        <p className="text-sm text-white/80 mb-4 leading-relaxed">
          {content.subtitle || 'Expert coaching for academic excellence.'}
        </p>

        {content.highlights.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-5">
            {content.highlights.filter(Boolean).map((h, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/20 text-white font-medium">
                {h}
              </span>
            ))}
          </div>
        )}

        {content.ctaText && (
          <div
            className="inline-block px-6 py-2.5 rounded-full text-sm font-bold mb-5"
            style={{ background: `hsl(${config.theme.secondary})`, color: `hsl(${config.theme.secondaryForeground})` }}
          >
            {content.ctaText}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <div className="bg-white p-1.5 rounded-md">
            <QRCodeSVG value={websiteUrl} size={48} level="M" />
          </div>
          <p className="text-[10px] text-white/70 text-left">Scan to<br />visit website</p>
        </div>
      </div>
    </div>
  );
};

export default InstagramStory;
