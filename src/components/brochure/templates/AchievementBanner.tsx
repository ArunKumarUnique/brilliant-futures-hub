import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const AchievementBanner = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const founderImage = content.showFounderImage ? config.founderImage : undefined;
  const founderLabel = config.founderLabel || 'Expert Faculty';

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 80% 20%, hsl(${config.theme.primary} / 0.1) 0%, transparent 50%),
            linear-gradient(135deg, hsl(${config.theme.background}) 0%, hsl(${config.theme.muted}) 100%)
          `,
        }}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 800 450" fill="none">
        <ellipse cx="680" cy="380" rx="150" ry="100" fill={`hsl(${config.theme.primary})`} opacity="0.03" />
        <path d="M0 400 Q400 360 800 390" stroke={`hsl(${config.theme.secondary})`} strokeWidth="0.6" opacity="0.08" />
      </svg>

      {/* Watermark */}
      {logoPath && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoPath} alt="" className="w-[200px] h-auto" style={{ opacity: 0.04, filter: 'grayscale(100%) brightness(2)' }} crossOrigin="anonymous" />
        </div>
      )}

      {/* Top gradient bar */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, hsl(${config.theme.primary}), hsl(${config.theme.secondary}))` }} />

      <div className="relative z-10 flex-1 flex">
        {/* Left: content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4">
          <div className="flex items-center gap-2 mb-2">
            {logoPath && <img src={logoPath} alt="" className="h-6 w-auto" crossOrigin="anonymous" />}
            <p className="text-[10px] font-bold tracking-wider uppercase" style={{ color: `hsl(${config.theme.primary})` }}>
              {config.instituteName} • Achievements
            </p>
          </div>
          <h1 className="text-2xl font-extrabold leading-tight mb-2" style={{ color: `hsl(${config.theme.foreground})` }}>
            {content.title || 'Our Milestones'}
          </h1>
          <p className="text-xs leading-relaxed mb-3" style={{ color: `hsl(${config.theme.mutedForeground})` }}>
            {content.subtitle || 'Celebrating excellence in education.'}
          </p>

          {content.highlights.filter(Boolean).length > 0 && (
            <div className="space-y-1.5">
              {content.highlights.filter(Boolean).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                    style={{ background: `hsl(${config.theme.secondary} / 0.15)`, color: `hsl(${config.theme.secondary})` }}
                  >
                    🏆
                  </span>
                  <span className="text-xs font-medium" style={{ color: `hsl(${config.theme.foreground})` }}>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: founder + stats + QR */}
        <div
          className="w-44 flex flex-col items-center justify-center gap-2 px-4"
          style={{
            background: `linear-gradient(180deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.9))`,
          }}
        >
          {/* Founder image at top of right panel */}
          {founderImage && (
            <div className="flex flex-col items-center mb-1">
              <img
                src={founderImage}
                alt="Founder"
                className="w-[60px] h-[60px] object-cover object-top rounded-full"
                style={{
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
                crossOrigin="anonymous"
              />
              <span className="text-[7px] text-white/60 mt-0.5">{founderLabel}</span>
            </div>
          )}

          {config.admissions.stats.slice(0, founderImage ? 2 : 3).map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-extrabold text-white">{s.value}</p>
              <p className="text-[9px] text-white/70">{typeof s.label === 'string' ? s.label : s.label.en || Object.values(s.label)[0]}</p>
            </div>
          ))}
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <div className="bg-white p-1.5 rounded-md shadow-sm">
              <QRCodeSVG value={websiteUrl} size={36} level="M" />
            </div>
            <span className="text-[7px] text-white/50">Scan to Visit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBanner;
