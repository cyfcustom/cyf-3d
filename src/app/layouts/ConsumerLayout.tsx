import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';

/**
 * ConsumerLayout
 * Wraps all customer-facing pages that need the persistent
 * Navbar (with cart icon, theme toggle, auth links).
 *
 * Pages that are self-contained (OrderViewPage = shareable link,
 * Configurator = full-screen tool) do NOT use this layout.
 */
export function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <CartDrawer />
    </div>
  );
}
