import { QRCodeSVG } from 'qrcode.react';
import { TenantConfig } from '@/types/tenant';
import { BrochureContent } from '@/types/brochure';

interface Props {
  config: TenantConfig;
  content: BrochureContent;
}

const FacultyCard = ({ config, content }: Props) => {
  const websiteUrl = config.seo.canonical || `https://${config.id}.lovable.app`;
  const faculty = config.faculty.find(f => f.id === content.selectedFacultyId) || config.faculty[0];
  if (!faculty) return <div className="w-full h-full flex items-center justify-center">No faculty data</div>;

  const name = typeof faculty.name === 'string' ? faculty.name : faculty.name.en || Object.values(faculty.name)[0];
  const qual = typeof faculty.qualification === 'string' ? faculty.qualification : faculty.qualification.en || Object.values(faculty.qualification)[0];
  const exp = typeof faculty.experience === 'string' ? faculty.experience : faculty.experience.en || Object.values(faculty.experience)[0];
  const role = faculty.role ? (typeof faculty.role === 'string' ? faculty.role : faculty.role.en || Object.values(faculty.role)[0]) : undefined;

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: `hsl(${config.theme.background})`, fontFamily: config.theme.fontFamily }}
    >
      {/* Top color band */}
      <div className="h-2" style={{ background: `linear-gradient(90deg, hsl(${config.theme.primary}), hsl(${config.theme.secondary}))` }} />

      {/* Institute name */}
      <div className="px-6 pt-4 pb-2">
        <h3 className="text-xs font-bold tracking-wider uppercase" style={{ color: `hsl(${config.theme.primary})` }}>
          {config.instituteName}
        </h3>
      </div>

      {/* Faculty photo + info */}
      <div className="flex-1 flex flex-col items-center px-6 pb-4">
        <div
          className="w-28 h-28 rounded-full overflow-hidden border-4 mb-4 flex-shrink-0"
          style={{ borderColor: `hsl(${config.theme.primary})` }}
        >
          <img src={faculty.image} alt={name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>

        <h2 className="text-xl font-bold text-center" style={{ color: `hsl(${config.theme.foreground})` }}>
          {name}
        </h2>
        {role && (
          <p className="text-xs font-medium mt-1" style={{ color: `hsl(${config.theme.primary})` }}>{role}</p>
        )}
        <p className="text-xs mt-1" style={{ color: `hsl(${config.theme.mutedForeground})` }}>{qual}</p>
        <p className="text-xs mt-0.5" style={{ color: `hsl(${config.theme.mutedForeground})` }}>{exp}</p>

        {/* Specializations */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-4">
          {(faculty.specializations as string[]).slice(0, 4).map((s, i) => {
            const label = typeof s === 'string' ? s : (s as any).en || Object.values(s)[0];
            return (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: `hsl(${i % 2 === 0 ? config.theme.primary : config.theme.secondary} / 0.12)`,
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
        className="px-6 py-3 flex items-center justify-between"
        style={{ background: `hsl(${config.theme.primary})` }}
      >
        <p className="text-[10px] font-medium" style={{ color: `hsl(${config.theme.primaryForeground})` }}>
          📞 {config.contact.phone}
        </p>
        <div className="bg-white p-1 rounded">
          <QRCodeSVG value={websiteUrl} size={36} level="M" />
        </div>
      </div>
    </div>
  );
};

export default FacultyCard;
