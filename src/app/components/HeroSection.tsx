import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation('landing');
  const heroImage = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjB0LXNoaXJ0c3xlbnwxfHx8fDE3MzU0Nzg0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080';

  return (
    <section className="w-full bg-gradient-to-b from-background to-card py-12 sm:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center md:text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/30">
              <Sparkles size={20} style={{ color: 'var(--vibrant-orange)' }} />
              <span className="text-sm sm:text-base text-accent-foreground font-medium" style={{ color: 'var(--vibrant-orange)' }}>
                {t('hero.title')}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-bold text-foreground"
            >
              {t('hero.subtitle_1')}<span style={{ color: 'var(--vibrant-orange)' }}>{t('hero.subtitle_imagine')}</span>{t('hero.subtitle_2')}<span style={{ color: 'var(--electric-blue)' }}>{t('hero.subtitle_reality')}</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground font-medium">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className="px-8 py-4 rounded-xl text-lg font-bold text-white transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: 'var(--vibrant-orange)' }}
              >
                {t('hero.cta')}
              </button>
              <button
                className="px-8 py-4 rounded-xl text-lg font-medium text-foreground transition-all hover:bg-muted border-2 border-border"
              >
                {t('hero.examples')}
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt={t('hero.imageAlt')}
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] object-cover"
              />
            </div>
            {/* Decorative elements */}
            <div
              className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-60"
              style={{ backgroundColor: 'var(--vibrant-orange)' }}
            />
            <div
              className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full blur-2xl opacity-60"
              style={{ backgroundColor: 'var(--electric-blue)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
