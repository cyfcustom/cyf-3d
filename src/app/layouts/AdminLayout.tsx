import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Palette, Settings, FileText, Users, Shield,
  LogOut, ExternalLink, Menu, ChevronRight, Calculator,
  PanelLeftClose, PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../components/ui/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '../components/ui/sheet';

// ─── Nav structure ─────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Tienda',
    items: [
      { label: 'Pedidos',    href: '/admin/orders',       icon: ShoppingBag },
      { label: 'Modelos 3D', href: '/admin/models',       icon: Palette },
    ],
  },
  {
    title: 'Calculadoras',
    items: [
      { label: 'Configuración', href: '/admin/config',       icon: Settings },
      { label: 'Historial',     href: '/admin/calculations', icon: FileText },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Usuarios',  href: '/admin/users', icon: Users },
      { label: 'Auditoría', href: '/admin/audit', icon: Shield },
    ],
  },
];

// ─── Single nav link ───────────────────────────────────────────────────────

function NavLink({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const { pathname } = useLocation();
  const active = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  return (
    <Link
      to={item.href}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'flex items-center rounded-xl text-sm font-semibold transition-all duration-150',
        collapsed
          ? 'justify-center w-10 h-10 mx-auto'
          : 'gap-3 px-3 py-2.5',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
      )}
    >
      <item.icon size={16} className={active ? 'text-primary' : ''} />
      {!collapsed && (
        <>
          <span>{item.label}</span>
          {active && <ChevronRight size={14} className="ml-auto text-primary/60" />}
        </>
      )}
    </Link>
  );
}

// ─── Nav content (shared between sidebar + drawer) ─────────────────────────

function NavContent({
  collapsed = false,
  onLinkClick,
}: {
  collapsed?: boolean;
  onLinkClick?: () => void;
}) {
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/cyf-admin-access');
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Logo */}
      <div className={cn('py-4 mb-2 shrink-0', collapsed ? 'px-0 flex justify-center' : 'px-3')}>
        {collapsed ? (
          <div className="w-8 h-8 bg-[#FFD600] rounded-xl flex items-center justify-center">
            <img src="/CYF CUSTOM_isotipo circular negro.png" alt="CYF" className="w-5 h-5" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFD600] rounded-xl flex items-center justify-center shrink-0">
              <img src="/CYF CUSTOM_isotipo circular negro.png" alt="CYF" className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-foreground truncate">CYF Custom</p>
              <p className="text-[10px] text-muted-foreground truncate">{authUser?.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation groups */}
      <nav className={cn('flex-1 overflow-y-auto space-y-5', collapsed ? 'px-1' : 'px-3')}>
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-3 mb-1.5">
                {group.title}
              </p>
            )}
            {collapsed && <div className="h-px bg-border/60 mb-1.5" />}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  onClick={onLinkClick}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className={cn(
        'py-4 border-t border-border space-y-0.5 shrink-0',
        collapsed ? 'px-1' : 'px-3',
      )}>
        <Link
          to="/"
          onClick={onLinkClick}
          title={collapsed ? 'Ver tienda' : undefined}
          className={cn(
            'flex items-center rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all',
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5',
          )}
        >
          <ExternalLink size={16} />
          {!collapsed && 'Ver tienda'}
        </Link>
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'flex items-center rounded-xl text-sm font-semibold text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all',
            collapsed ? 'justify-center w-10 h-10 mx-auto' : 'gap-3 px-3 py-2.5 w-full',
          )}
        >
          <LogOut size={16} />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </div>
  );
}

// ─── Bottom mobile nav ─────────────────────────────────────────────────────

const MOBILE_NAV: NavItem[] = [
  { label: 'Pedidos',    href: '/admin/orders',       icon: ShoppingBag },
  { label: 'Calc',       href: '/admin/config',        icon: Calculator },
  { label: 'Modelos',    href: '/admin/models',        icon: Palette },
  { label: 'Usuarios',   href: '/admin/users',         icon: Users },
];

function BottomNav({ onMoreClick }: { onMoreClick: () => void }) {
  const { pathname } = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border">
      <div className="flex items-stretch">
        {MOBILE_NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
        {/* More menu */}
        <button
          onClick={onMoreClick}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-bold text-muted-foreground"
        >
          <Menu size={18} />
          Más
        </button>
      </div>
    </nav>
  );
}

// ─── Admin Layout ──────────────────────────────────────────────────────────

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('admin-sidebar-collapsed') === 'true'; }
    catch { return false; }
  });

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem('admin-sidebar-collapsed', String(next)); }
    catch { /* ignore */ }
  }

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground flex">

      {/* ── Desktop sidebar (lg+) ── */}
      <aside
        className={cn(
          'hidden lg:flex shrink-0 flex-col fixed inset-y-0 left-0 border-r border-border bg-card/60 backdrop-blur-sm z-40 transition-[width] duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <NavContent collapsed={collapsed} />

        {/* Collapse toggle button */}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className={cn(
            'absolute top-4 -right-3 z-50',
            'flex items-center justify-center w-6 h-6 rounded-full',
            'bg-card border border-border shadow-sm',
            'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
          )}
        >
          {collapsed
            ? <PanelLeftOpen size={12} />
            : <PanelLeftClose size={12} />
          }
        </button>
      </aside>

      {/* ── Mobile: full-menu sheet drawer ── */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-64 p-0 flex flex-col gap-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <div className="flex-1">
            <NavContent onLinkClick={() => setDrawerOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Main content ── */}
      <main
        className={cn(
          'flex-1 min-h-screen pb-16 lg:pb-0 transition-[margin] duration-300 ease-in-out',
          collapsed ? 'lg:ml-14' : 'lg:ml-56',
        )}
      >
        {children}
      </main>

      {/* ── Mobile bottom navigation ── */}
      <BottomNav onMoreClick={() => setDrawerOpen(true)} />
    </div>
  );
}
