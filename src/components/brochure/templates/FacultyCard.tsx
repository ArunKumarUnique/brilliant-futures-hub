import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const FacultyCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const logoPath = config.logo || '';
  const faculty = config.faculty.find(f => f.id === content.selectedFacultyId) || config.faculty[0];
  if (!faculty) return <div className="w-full h-full flex items-center justify-center">No faculty data</div>;

  const name = typeof faculty.name === 'string' ? faculty.name : faculty.name.en || Object.values(faculty.name)[0];
  const qual = typeof faculty.qualification === 'string' ? faculty.qualification : faculty.qualification.en || Object.values(faculty.qualification)[0];
  const exp = typeof faculty.experience === 'string' ? faculty.experience : faculty.experience.en || Object.values(faculty.experience)[0];
  const role = faculty.role ? (typeof faculty.role === 'string' ? faculty.role : faculty.role.en || Object.values(faculty.role)[0]) : undefined;

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
            radial-gradient(ellipse at 50% 0%, hsl(${config.theme.primary} / 0.15) 0%, transparent 60%),
            linear-gradient(180deg, hsl(${config.theme.background}) 0%, hsl(${config.theme.muted}) 100%)
          `,
        }}
      />

      {/* Decorative shapes */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 600" fill="none">
        <circle cx="500" cy="100" r="120" fill={`hsl(${config.theme.primary})`} opacity="0.04" />
        <circle cx="80" cy="520" r="80" fill={`hsl(${config.theme.secondary})`} opacity="0.05" />
        <path d="M0 450 Q300 400 600 440" stroke={`hsl(${config.theme.primary})`} strokeWidth="0.8" opacity="0.08" />
      </svg>

      {/* Watermark */}
      {logoPath && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <img src={logoPath} alt="" className="w-[240px] h-auto" style={{ opacity: 0.04, filter: 'grayscale(100%) brightness(2)' }} crossOrigin="anonymous" />
        </div>
      )}

      {/* Top gradient bar */}
      <div className="h-1.5" style={{ background: `linear-gradient(90deg, hsl(${config.theme.primary}), hsl(${config.theme.secondary}))` }} />

      {/* Institute header */}
      <div className="relative z-10 px-6 pt-4 pb-2 flex items-center gap-2">
        {logoPath && <img src={logoPath} alt="" className="h-7 w-auto" crossOrigin="anonymous" />}
        <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: `hsl(${config.theme.primary})` }}>
          {config.instituteName}
        </h3>
      </div>

      {/* Faculty photo + info */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pb-4">
        <div
          className="w-28 h-28 rounded-full overflow-hidden mb-4 flex-shrink-0"
          style={{
            border: `3px solid hsl(${config.theme.primary})`,
            boxShadow: `0 4px 20px hsl(${config.theme.primary} / 0.2), 0 0 0 6px hsl(${config.theme.primary} / 0.08)`,
          }}
        >
          <img src={faculty.image} alt={name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>

        <h2 className="text-xl font-bold text-center" style={{ color: `hsl(${config.theme.foreground})` }}>
          {name}
        </h2>
        {role && (
          <p className="text-xs font-semibold mt-1" style={{ color: `hsl(${config.theme.primary})` }}>{role}</p>
        )}
        <p className="text-[11px] mt-1" style={{ color: `hsl(${config.theme.mutedForeground})` }}>{qual}</p>
        <p className="text-[11px] mt-0.5" style={{ color: `hsl(${config.theme.mutedForeground})` }}>{exp}</p>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-4">
          {(faculty.specializations as string[]).slice(0, 4).map((s, i) => {
            const label = typeof s === 'string' ? s : (s as any).en || Object.values(s)[0];
            return (
              <span
                key={i}
                className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: `hsl(${i % 2 === 0 ? config.theme.primary : config.theme.secondary} / 0.1)`,
                  color: `hsl(${i % 2 === 0 ? config.theme.primary : config.theme.secondary})`,
                }}
              >
                {label}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 px-6 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(135deg, hsl(${config.theme.primary}), hsl(${config.theme.primary} / 0.9))`,
        }}
      >
        <div>
          <p className="text-[10px] font-medium" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            📞 {config.contact.phone}
          </p>
          <p className="text-[9px] opacity-70" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
            📧 {config.contact.email}
          </p>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="bg-white p-1.5 rounded-md shadow-sm">
            <QRCodeSVG value={websiteUrl} size={36} level="M" />
          </div>
          <span className="text-[7px] opacity-60" style={{ color: `hsl(${config.theme.primaryForeground})` }}>Scan to Visit</span>
        </div>
      </div>
    </div>
  );
};

export default FacultyCard;
