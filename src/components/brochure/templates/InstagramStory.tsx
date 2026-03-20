import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const InstagramStory = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const bgImage = content.selectedGalleryImage || config.hero.images[0];

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* BG */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to bottom,
                hsl(${config.theme.primary} / 0.3) 0%,
                hsl(${config.theme.primary} / 0.6) 40%,
                hsl(${config.theme.primary} / 0.92) 70%,
                hsl(${config.theme.primary}) 100%
              )
            `,
          }}
        />
      </div>

      {/* Decorative SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 540 960" fill="none">
        <ellipse cx="460" cy="120" rx="140" ry="140" fill={`hsl(${config.theme.secondary})`} opacity="0.08" />
        <circle cx="60" cy="800" r="80" fill="white" opacity="0.04" />
        <path d="M0 650 Q270 600 540 640" stroke="white" strokeWidth="0.6" opacity="0.08" />
      </svg>

      {/* Top: Logo + Institute */}
      <div className="relative z-10 pt-8 px-6 flex items-center gap-2">
        {logoPath && <img src={logoPath} alt="" className="h-9 w-auto" crossOrigin="anonymous" />}
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/80">{config.instituteName}</p>
      </div>

      {/* Center: spacer */}
      <div className="flex-1" />

      {/* Bottom content */}
      <div className="relative z-10 px-6 pb-8 text-center">
        <span
          className="inline-block text-[9px] font-bold px-3 py-1 rounded-full mb-3 tracking-wide uppercase"
          style={{
            background: `hsl(${config.theme.secondary})`,
            color: `hsl(${config.theme.secondaryForeground})`,
          }}
        >
          {content.academicYear || config.academicYear}
        </span>

        <h1 className="text-2xl font-extrabold text-white leading-tight mb-3">
          {content.title || 'Join Us Today'}
        </h1>
        <p className="text-sm text-white/80 mb-4 leading-relaxed">
          {content.subtitle || 'Expert coaching for academic excellence.'}
        </p>

        {content.highlights.filter(Boolean).length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-center mb-5">
            {content.highlights.filter(Boolean).map((h, i) => (
              <span key={i} className="text-[10px] px-2.5 py-1 rounded-full bg-white/15 text-white font-medium backdrop-blur-sm">
                {h}
              </span>
            ))}
          </div>
        )}

        {content.ctaText && (
          <div
            className="inline-block px-6 py-2.5 rounded-full text-sm font-bold mb-5"
            style={{
              background: `linear-gradient(135deg, hsl(${config.theme.secondary}), hsl(${config.theme.secondary} / 0.85))`,
              color: `hsl(${config.theme.secondaryForeground})`,
              boxShadow: `0 4px 14px hsl(${config.theme.secondary} / 0.3)`,
            }}
          >
            {content.ctaText}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-md">
            <QRCodeSVG value={websiteUrl} size={48} level="M" />
          </div>
          <p className="text-[10px] text-white/60 text-left">Scan to<br />visit website</p>
        </div>
      </div>
    </div>
  );
};

export default InstagramStory;
