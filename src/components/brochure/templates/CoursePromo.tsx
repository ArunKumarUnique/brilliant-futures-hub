import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const CoursePromo = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: config.theme.fontFamily }}
    >
      {/* Top section */}
      <div
        className="px-6 pt-6 pb-8"
        style={{ background: `linear-gradient(135deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.85))` }}
      >
        <p className="text-[10px] font-bold tracking-wider uppercase text-white/60 mb-3">
          {config.instituteName}
        </p>
        <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">
          {content.title || content.featuredSubject || 'Course Highlight'}
        </h1>
        <p className="text-xs text-white/75">
          {content.academicYear || config.academicYear}
        </p>
      </div>

      {/* Middle - content */}
      <div className="flex-1 px-6 py-5 flex flex-col justify-center" style={{ background: `hsl(${config.theme.background})` }}>
        <p className="text-sm font-medium mb-4" style={{ color: `hsl(${config.theme.foreground})` }}>
          {content.subtitle || 'Expert coaching designed for success.'}
        </p>

        {content.highlights.filter(Boolean).length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {content.highlights.filter(Boolean).map((h, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg"
                style={{
                  background: `hsl(${config.theme.primary} / 0.08)`,
                  color: `hsl(${config.theme.primary})`,
                }}
              >
                <span className="text-xs">▸</span> {h}
              </div>
            ))}
          </div>
        )}

        {content.ctaText && (
          <div
            className="self-start px-4 py-2 rounded-lg text-xs font-bold"
            style={{ background: `hsl(${config.theme.primary})`, color: `hsl(${config.theme.primaryForeground})` }}
          >
            {content.ctaText}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 flex items-center justify-between" style={{ background: `hsl(${config.theme.muted})` }}>
        <p className="text-[10px]" style={{ color: `hsl(${config.theme.mutedForeground})` }}>📞 {config.contact.phone}</p>
        <div className="bg-white p-1 rounded border" style={{ borderColor: `hsl(${config.theme.border})` }}>
          <QRCodeSVG value={websiteUrl} size={36} level="M" />
        </div>
      </div>
    </div>
  );
};

export default CoursePromo;
