import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="w-full bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              CYF Customs
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <ThemeToggle />
            <button
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:scale-105 hover:opacity-90"
            >
              {t('nav.contact')}
            </button>
          </div>

          {/* Mobile: Just theme toggle */}
          <div className="flex md:hidden items-center">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}