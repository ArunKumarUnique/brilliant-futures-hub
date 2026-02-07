import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTenant } from '@/contexts/TenantContext';
import { Image, Play, Trophy, X } from 'lucide-react';

const Media = () => {
  const { t, tr } = useLanguage();
  const { config } = useTenant();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="section-padding bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('media.title')}</h1>
          <p className="text-muted-foreground">{tr(config.media.subtitle)}</p>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('media.photos')}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {config.media.photos.map((photo, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer card-elevated"
                onClick={() => setSelectedImage(photo.src)}
              >
                <img src={photo.src} alt={tr(photo.caption)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <span className="text-white font-medium text-sm">{tr(photo.caption)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="section-padding bg-card">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-secondary/10 p-2 rounded-lg">
              <Play className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('media.videos')}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="aspect-video bg-muted rounded-xl flex items-center justify-center card-elevated">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">{t('coming.soon')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">{t('media.achievements')}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {config.media.achievements.map((achievement, index) => (
              <div key={index} className="feature-card">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{tr(achievement.title)}</h3>
                <p className="text-muted-foreground text-sm">{tr(achievement.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors" onClick={() => setSelectedImage(null)}>
            <X className="w-8 h-8" />
          </button>
          <img src={selectedImage} alt="Gallery" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Media;
