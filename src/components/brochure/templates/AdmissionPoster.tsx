import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const AdmissionPoster = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.85))`,
        fontFamily: config.theme.fontFamily,
      }}
    >
      {/* Top decorative band */}
      <div
        className="absolute top-0 right-0 w-2/3 h-32 rounded-bl-[60px]"
        style={{ background: `hsl(${config.theme.secondary})` }}
      />

      {/* Header */}
      <div className="relative z-10 px-8 pt-8">
        <h2 className="text-lg font-bold" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
          {config.instituteName}
        </h2>
        {config.footer.subtext && (
          <p className="text-xs mt-0.5 opacity-80" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            {config.footer.subtext}
          </p>
        )}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8">
        <div className="mb-2">
          <span
            className="inline-block text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: `hsl(${config.theme.secondary})`,
              color: `hsl(${config.theme.secondaryForeground})`,
            }}
          >
            {content.academicYear || config.academicYear}
          </span>
        </div>

        <h1
          className="text-3xl font-extrabold leading-tight mb-3"
          style={{ color: `hsl(${config.theme.primaryForeground})` }}
        >
          {content.title || 'Admissions Open'}
        </h1>

        <p className="text-sm leading-relaxed opacity-90 mb-4" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
          {content.subtitle || 'Enroll now for expert coaching and guidance.'}
        </p>

        {content.highlights.filter(Boolean).length > 0 && (
          <ul className="space-y-1.5 mb-4">
            {content.highlights.filter(Boolean).map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: `hsl(${config.theme.secondary})`, color: `hsl(${config.theme.secondaryForeground})` }}
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
            className="inline-block px-5 py-2 rounded-lg text-sm font-bold"
            style={{
              background: `hsl(${config.theme.secondary})`,
              color: `hsl(${config.theme.secondaryForeground})`,
            }}
          >
            {content.ctaText}
          </div>
        )}
      </div>

      {/* Footer with contact + QR */}
      <div className="relative z-10 px-8 pb-6 flex items-end justify-between gap-4">
        <div className="text-xs space-y-1" style={{ color: `hsl(${config.theme.primaryForeground} / 0.9)` }}>
          <p>📞 {config.contact.phone}</p>
          <p>📧 {config.contact.email}</p>
        </div>
        <div className="bg-white p-1.5 rounded-md flex-shrink-0">
          <QRCodeSVG value={websiteUrl} size={56} level="M" />
        </div>
      </div>
    </div>
  );
};

export default AdmissionPoster;
