import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const AchievementBanner = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: `hsl(${config.theme.background})`, fontFamily: config.theme.fontFamily }}
    >
      {/* Top gradient bar */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, hsl(${config.theme.primary}), hsl(${config.theme.secondary}))` }} />

      <div className="flex-1 flex">
        {/* Left: content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4">
          <p className="text-[10px] font-bold tracking-wider uppercase mb-2" style={{ color: `hsl(${config.theme.primary})` }}>
            {config.instituteName} • Achievements
          </p>
          <h1 className="text-2xl font-extrabold leading-tight mb-2" style={{ color: `hsl(${config.theme.foreground})` }}>
            {content.title || 'Our Milestones'}
          </h1>
          <p className="text-xs leading-relaxed mb-3" style={{ color: `hsl(${config.theme.mutedForeground})` }}>
            {content.subtitle || 'Celebrating excellence in education.'}
          </p>

          {content.highlights.filter(Boolean).length > 0 && (
            <div className="space-y-1">
              {content.highlights.filter(Boolean).map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">🏆</span>
                  <span className="text-xs font-medium" style={{ color: `hsl(${config.theme.foreground})` }}>{h}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: stats & QR */}
        <div
          className="w-44 flex flex-col items-center justify-center gap-3 px-4"
          style={{ background: `hsl(${config.theme.primary})` }}
        >
          {config.admissions.stats.slice(0, 3).map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-extrabold text-white">{s.value}</p>
              <p className="text-[9px] text-white/70">{typeof s.label === 'string' ? s.label : s.label.en || Object.values(s.label)[0]}</p>
            </div>
          ))}
          <div className="bg-white p-1 rounded mt-1">
            <QRCodeSVG value={websiteUrl} size={36} level="M" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementBanner;
