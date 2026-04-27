import { useTenant } from '@/contexts/TenantContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Check, Sparkles, Star } from 'lucide-react';

const AdminPackages = () => {
  const { config } = useTenant();
  const { tr } = useLanguage();
  const packages = config.packages;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-4">Packages</h1>

      {packages ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.items.map((pkg) => (
            <div key={pkg.id} className={`relative bg-card border rounded-xl p-5 shadow-sm ${pkg.special ? 'border-amber-400 ring-1 ring-amber-300' : 'border-border'}`}>
              {pkg.special && (
                <span className="absolute -top-2 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Special
                </span>
              )}
              {pkg.popular && (
                <span className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Popular
                </span>
              )}
              <h3 className="font-semibold text-foreground mb-3 pr-16">{tr(pkg.title)}</h3>
              {pkg.subjects && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {pkg.subjects.map((s, i) => (
                    <span key={i} className="text-xs bg-muted px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3 text-primary" />
                      {tr(s)}
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-1">
                {pkg.pricing.map((row, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{tr(row.class)}</span>
                    <span className="font-medium text-foreground">{tr(row.fee)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No packages configured.</p>
      )}

      <div className="mt-6 bg-card border border-border rounded-xl p-6 shadow-sm">
        <p className="text-muted-foreground text-sm">
          Package editing from the admin panel will be available after enabling the backend database.
        </p>
      </div>
    </div>
  );
};

export default AdminPackages;
