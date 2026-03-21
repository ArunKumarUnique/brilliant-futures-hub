import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const AdmissionPoster = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const founderImage = content.showFounderImage ? config.founderImage : undefined;
  const founderLabel = config.founderLabel || 'Expert Faculty';

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Rich gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 20% 0%, hsl(${config.theme.secondary} / 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 100%, hsl(${config.theme.secondary} / 0.2) 0%, transparent 50%),
            linear-gradient(160deg, hsl(${config.theme.primary}) 0%, hsl(${config.theme.primary} / 0.92) 40%, hsl(${config.theme.primary} / 0.85) 100%)
          `,
        }}
      />

      {/* Subtle decorative shapes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 800" fill="none">
        <ellipse cx="580" cy="60" rx="180" ry="180" fill={`hsl(${config.theme.secondary})`} opacity="0.08" />
        <circle cx="40" cy="720" r="120" fill="white" opacity="0.04" />
        <path d="M0 500 Q300 420 600 480" stroke="white" strokeWidth="0.8" opacity="0.1" />
        <path d="M0 520 Q300 440 600 500" stroke="white" strokeWidth="0.5" opacity="0.06" />
        <ellipse cx="480" cy="180" rx="30" ry="12" stroke="white" strokeWidth="0.6" opacity="0.08" transform="rotate(-30 480 180)" />
        <ellipse cx="480" cy="180" rx="30" ry="12" stroke="white" strokeWidth="0.6" opacity="0.08" transform="rotate(30 480 180)" />
        <circle cx="480" cy="180" r="3" fill="white" opacity="0.1" />
      </svg>

      {/* Watermark logo */}
      {logoPath && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoPath} alt="" className="w-[320px] h-auto" style={{ opacity: 0.06, filter: 'grayscale(100%) brightness(2)' }} crossOrigin="anonymous" />
        </div>
      )}

      {/* Header with logo */}
      <div className="relative z-10 px-8 pt-7 flex items-center gap-3">
        {logoPath && (
          <img src={logoPath} alt={config.instituteName} className="h-12 w-auto flex-shrink-0" crossOrigin="anonymous" />
        )}
        <div>
          <h2 className="text-lg font-bold leading-tight" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            {config.instituteName}
          </h2>
          {config.footer.subtext && (
            <p className="text-[10px] mt-0.5 opacity-70" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
              {config.footer.subtext}
            </p>
          )}
        </div>
      </div>

      {/* Main content area - split layout when founder image present */}
      <div className="relative z-10 flex-1 flex">
        {/* Left: text content */}
        <div className={`flex flex-col justify-center px-8 ${founderImage ? 'flex-1' : 'w-full'}`}>
          <div className="mb-3">
            <span
              className="inline-block text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase"
              style={{
                background: `hsl(${config.theme.secondary})`,
                color: `hsl(${config.theme.secondaryForeground})`,
                boxShadow: `0 2px 8px hsl(${config.theme.secondary} / 0.3)`,
              }}
            >
              {content.academicYear || config.academicYear}
            </span>
          </div>

          <h1
            className="text-[28px] font-extrabold leading-[1.15] mb-3"
            style={{ color: `hsl(${config.theme.primaryForeground})` }}
          >
            {content.title || 'Admissions Open'}
          </h1>

          <p className="text-sm leading-relaxed opacity-85 mb-5 max-w-[85%]" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            {content.subtitle || 'Enroll now for expert coaching and guidance.'}
          </p>

          {content.highlights.filter(Boolean).length > 0 && (
            <ul className="space-y-2 mb-5">
              {content.highlights.filter(Boolean).map((h, i) => (
                <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: `hsl(${config.theme.secondary})`,
                      color: `hsl(${config.theme.secondaryForeground})`,
                    }}
                  >
                    ✓
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {content.ctaText && (
            <div
              className="inline-block px-6 py-2.5 rounded-full text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, hsl(${config.theme.secondary}), hsl(${config.theme.secondary} / 0.85))`,
                color: `hsl(${config.theme.secondaryForeground})`,
                boxShadow: `0 4px 14px hsl(${config.theme.secondary} / 0.35)`,
              }}
            >
              {content.ctaText}
            </div>
          )}
        </div>

        {/* Right: Founder image */}
        {founderImage && (
          <div className="w-[200px] flex flex-col items-center justify-end relative flex-shrink-0">
            {/* Glow behind image */}
            <div
              className="absolute bottom-0 right-0 w-[220px] h-[300px] rounded-tl-[80px]"
              style={{
                background: `radial-gradient(ellipse at 50% 80%, hsl(${config.theme.secondary} / 0.3) 0%, transparent 70%)`,
              }}
            />
            <div className="relative z-10 flex flex-col items-center">
              <span
                className="text-[9px] font-bold px-3 py-1 rounded-full mb-2 tracking-wide"
                style={{
                  background: `hsl(${config.theme.secondary} / 0.2)`,
                  color: `hsl(${config.theme.secondaryForeground})`,
                  backdropFilter: 'blur(4px)',
                }}
              >
                {founderLabel}
              </span>
              <img
                src={founderImage}
                alt="Founder"
                className="w-[170px] h-[230px] object-cover object-top rounded-t-[40px]"
                style={{
                  boxShadow: `0 -8px 30px hsl(${config.theme.primary} / 0.4), 0 0 60px hsl(${config.theme.secondary} / 0.15)`,
                }}
                crossOrigin="anonymous"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with contact + QR */}
      <div
        className="relative z-10 px-8 py-5 flex items-end justify-between gap-4"
        style={{ background: `linear-gradient(to top, hsl(${config.theme.primary} / 0.3), transparent)` }}
      >
        <div className="text-xs space-y-1.5" style={{ color: `hsl(${config.theme.primaryForeground} / 0.9)` }}>
          <p className="flex items-center gap-1.5">📞 {config.contact.phone}</p>
          <p className="flex items-center gap-1.5">📧 {config.contact.email}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <QRCodeSVG value={websiteUrl} size={56} level="M" />
          </div>
          <span className="text-[8px] opacity-60" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            Scan to Visit
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdmissionPoster;
