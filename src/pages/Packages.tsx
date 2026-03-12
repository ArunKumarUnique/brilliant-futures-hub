import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { Check, Star } from 'lucide-react';

const Packages = () => {
  const { tr, t } = useLanguage();
  const { config } = useTenant();
  const packages = config.packages;

  if (!packages) return null;

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{tr(packages.title)}</h1>
          <p className="text-white/90 max-w-2xl mx-auto text-lg">{tr(packages.subtitle)}</p>
        </div>
      </section>

      {/* Package Cards */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.items.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden transition-transform hover:scale-[1.02] ${
                  pkg.popular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1.5 text-xs font-semibold rounded-bl-xl flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Most Popular
                  </div>
                )}

                <div className="p-6 md:p-8">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4 pr-24">
                    {tr(pkg.title)}
                  </h2>

                  {/* Subjects */}
                  {pkg.subjects && pkg.subjects.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Subjects Included
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {pkg.subjects.map((sub, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-sm bg-muted text-foreground px-3 py-1 rounded-full"
                          >
                            <Check className="w-3.5 h-3.5 text-primary" />
                            {tr(sub)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pricing Table */}
                  <div className="space-y-0 rounded-xl overflow-hidden border border-border">
                    <div className="grid grid-cols-2 bg-muted px-4 py-2.5">
                      <span className="text-sm font-semibold text-muted-foreground">Class</span>
                      <span className="text-sm font-semibold text-muted-foreground text-right">Monthly Fee</span>
                    </div>
                    {pkg.pricing.map((row, i) => (
                      <div
                        key={i}
                        className={`grid grid-cols-2 px-4 py-3 ${
                          i % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                        }`}
                      >
                        <span className="text-sm font-medium text-foreground">{tr(row.class)}</span>
                        <span className="text-sm font-bold text-primary text-right">{tr(row.fee)}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Link
                      to={packages.ctaLink}
                      className="btn-primary bg-primary text-primary-foreground hover:opacity-90 w-full block text-center py-3 rounded-xl font-semibold"
                    >
                      {tr(packages.ctaLabel)}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Packages;
