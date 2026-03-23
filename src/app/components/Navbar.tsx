import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cartOpenAtom, cartCountAtom, isAuthenticatedAtom } from '../store/atoms';

export function Navbar() {
  const { t } = useTranslation();
  const setCartOpen = useSetAtom(cartOpenAtom);
  const cartCount = useAtomValue(cartCountAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  return (
    <nav className="w-full bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              CYF Custom
            </h1>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Mis Pedidos — authenticated users */}
            {isAuthenticated && (
              <Link
                to="/my-orders"
                className="hidden md:flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                My orders
              </Link>
            )}

          {/* Cart icon */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingCart size={20} className="text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Contact — desktop only */}
            <Link
              to="/contact"
              className="hidden md:flex px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold transition-all hover:scale-105 hover:opacity-90"
            >
              {t('nav.contact')}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}