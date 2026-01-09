import { Menu } from 'lucide-react';
import logo from '@/assets/595648dd92054184149aeef68dbcc3758518b8db.png';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const phoneNumber = '584124553107';
  const message = encodeURIComponent(
    'Hola CYF Customs 👋\n\nQuiero realizar un pedido desde la web. ¿Podrían indicarme el precio y tiempo de entrega?'
  );
  const whatsappHref = `https://wa.me/${phoneNumber}?text=${message}`;
  return (
    <nav className="w-full bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src={logo} alt="CYF Customs Logo" className="h-10 sm:h-12 w-auto" />
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              CYF Customs
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <a 
              href="#mis-disenos" 
              className="text-foreground font-medium transition-colors hover:text-primary"
            >
              Mis Diseños
            </a>
            <a 
              href="/calculadora" 
              className="text-foreground font-medium transition-colors hover:text-primary"
            >
              Calculadoras
            </a>
            <ThemeToggle />
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:scale-105 hover:opacity-90"
            >
              Contacto
            </a>
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle />
            <a
              href="/calculadora"
              className="px-3 py-2 rounded-lg bg-muted text-foreground font-semibold"
            >
              Calculadoras
            </a>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
            >
              Contacto
            </a>
            <button className="p-2">
              <Menu size={28} className="text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}