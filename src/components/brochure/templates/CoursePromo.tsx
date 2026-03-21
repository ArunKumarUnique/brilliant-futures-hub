import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const CoursePromo = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const founderImage = content.showFounderImage ? config.founderImage : undefined;
  const founderLabel = config.founderLabel || 'Expert Faculty';

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Top section with gradient */}
      <div
        className="relative px-6 pt-5 pb-8"
        style={{
          background: `
            radial-gradient(ellipse at 80% 0%, hsl(${config.theme.secondary} / 0.25) 0%, transparent 50%),
            linear-gradient(160deg, hsl(${config.theme.primary}) 0%, hsl(${config.theme.primary} / 0.88) 100%)
          `,
        }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 200" fill="none">
          <ellipse cx="520" cy="30" rx="80" ry="80" fill="white" opacity="0.05" />
        </svg>

        <div className="relative z-10 flex items-center gap-2 mb-3">
          {logoPath && <img src={logoPath} alt="" className="h-7 w-auto" crossOrigin="anonymous" />}
          <p className="text-[10px] font-bold tracking-wider uppercase text-white/70">
            {config.instituteName}
          </p>
        </div>
        <h1 className="relative z-10 text-2xl font-extrabold text-white leading-tight mb-1">
          {content.title || content.featuredSubject || 'Course Highlight'}
        </h1>
        <p className="relative z-10 text-xs text-white/75">
          {content.academicYear || config.academicYear}
        </p>
      </div>

      {/* Middle - content with optional founder */}
      <div
        className="relative flex-1 flex"
        style={{
          background: `
            radial-gradient(ellipse at 20% 80%, hsl(${config.theme.primary} / 0.04) 0%, transparent 50%),
            hsl(${config.theme.background})
          `,
        }}
      >
        <div className={`flex flex-col justify-center px-6 py-5 ${founderImage ? 'flex-1' : 'w-full'}`}>
          <p className="text-sm font-medium mb-4" style={{ color: `hsl(${config.theme.foreground})` }}>
            {content.subtitle || 'Expert coaching designed for success.'}
          </p>

          {content.highlights.filter(Boolean).length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-4">
              {content.highlights.filter(Boolean).map((h, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-2 rounded-lg"
                  style={{
                    background: `hsl(${i % 2 === 0 ? config.theme.primary : config.theme.secondary} / 0.08)`,
                    color: `hsl(${i % 2 === 0 ? config.theme.primary : config.theme.secondary})`,
                  }}
                >
                  <span className="text-xs">▸</span> {h}
                </div>
              ))}
            </div>
          )}

          {content.ctaText && (
            <div
              className="self-start px-5 py-2 rounded-full text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.9))`,
                color: `hsl(${config.theme.primaryForeground})`,
                boxShadow: `0 3px 10px hsl(${config.theme.primary} / 0.25)`,
              }}
            >
              {content.ctaText}
            </div>
          )}
        </div>

        {/* Founder image - bottom-right card style */}
        {founderImage && (
          <div className="w-[150px] flex flex-col items-center justify-end pr-4 pb-3 relative flex-shrink-0">
            <div className="relative flex flex-col items-center">
              <img
                src={founderImage}
                alt="Founder"
                className="w-[120px] h-[120px] object-cover object-top rounded-2xl"
                style={{
                  border: `2px solid hsl(${config.theme.primary} / 0.2)`,
                  boxShadow: `0 6px 20px hsl(${config.theme.primary} / 0.15)`,
                }}
                crossOrigin="anonymous"
              />
              <span
                className="text-[8px] font-bold px-2 py-0.5 rounded-full mt-1.5"
                style={{
                  background: `hsl(${config.theme.primary} / 0.1)`,
                  color: `hsl(${config.theme.primary})`,
                }}
              >
                {founderLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: `hsl(${config.theme.muted})` }}
      >
        <div>
          <p className="text-[10px]" style={{ color: `hsl(${config.theme.mutedForeground})` }}>📞 {config.contact.phone}</p>
          <p className="text-[9px]" style={{ color: `hsl(${config.theme.mutedForeground})` }}>📧 {config.contact.email}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[7px]" style={{ color: `hsl(${config.theme.mutedForeground})` }}>Scan</span>
          <div className="bg-white p-1 rounded shadow-sm border" style={{ borderColor: `hsl(${config.theme.border})` }}>
            <QRCodeSVG value={websiteUrl} size={32} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePromo;
