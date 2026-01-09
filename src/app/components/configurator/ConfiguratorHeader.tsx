import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';

export function ConfiguratorHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-card border-b border-border h-16">
      <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-foreground font-medium transition-colors hover:text-primary"
        >
          <ArrowLeft size={20} />
          <span>Volver a la tienda</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-foreground">
            CYF Customs
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Ayuda"
          >
            <HelpCircle size={24} className="text-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}