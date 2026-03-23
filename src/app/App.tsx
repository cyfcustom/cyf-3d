import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Loader2 } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

// ── Always-eager: critical path (needed on every first render) ────────────
import { AdminLayout } from './layouts/AdminLayout';
import { ConsumerLayout } from './layouts/ConsumerLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './providers/AuthProvider';
import { LandingPage } from './pages/LandingPage'; // entry point — zero delay

// ── Helper: lazy-load a named export without boilerplate ──────────────────
// Usage: lazyPage(() => import('./pages/Foo'), 'Foo')
function lazyPage<K extends string>(
  factory: () => Promise<Record<K, React.ComponentType>>,
  name: K
) {
  return lazy(() => factory().then((m) => ({ default: m[name] })));
}

// ── Consumer pages (lazy) ─────────────────────────────────────────────────
const MobileDemo          = lazyPage(() => import('./pages/MobileDemo'),          'MobileDemo');
const OrderViewPage       = lazyPage(() => import('./pages/OrderViewPage'),       'OrderViewPage');
const ContactPage         = lazyPage(() => import('./pages/ContactPage'),         'ContactPage');
const ProductDetailPage   = lazyPage(() => import('./pages/ProductDetailPage'),  'ProductDetailPage');
const CheckoutPage        = lazyPage(() => import('./pages/CheckoutPage'),       'CheckoutPage');
const MyOrdersPage        = lazyPage(() => import('./pages/MyOrdersPage'),       'MyOrdersPage');
const CalculatorSuitePage = lazyPage(() => import('./pages/CalculatorSuitePage'), 'CalculatorSuitePage');

// ── Admin pages (lazy) — never downloaded by non-admin visitors ───────────
const AdminLogin            = lazyPage(() => import('./pages/AdminLogin'),                    'AdminLogin');
const AdminDashboard        = lazyPage(() => import('./pages/AdminDashboard'),               'AdminDashboard');
const AdminOrdersPage       = lazyPage(() => import('./pages/admin/AdminOrdersPage'),        'AdminOrdersPage');
const AdminOrderDetailPage  = lazyPage(() => import('./pages/admin/AdminOrderDetailPage'),   'AdminOrderDetailPage');
const AdminConfigPage       = lazyPage(() => import('./pages/admin/AdminConfigPage'),        'AdminConfigPage');
const AdminConfigEditor     = lazyPage(() => import('./pages/admin/AdminConfigEditor'),      'AdminConfigEditor');
const AdminContactPage      = lazyPage(() => import('./pages/admin/AdminContactPage'),       'AdminContactPage');
const AdminModelsPage       = lazyPage(() => import('./pages/admin/AdminModelsPage'),        'AdminModelsPage');
const AdminUsersPage        = lazyPage(() => import('./pages/admin/AdminUsersPage'),         'AdminUsersPage');
const AdminAuditPage        = lazyPage(() => import('./pages/admin/AdminAuditPage'),         'AdminAuditPage');
const AdminHistoryPage      = lazyPage(() => import('./pages/admin/AdminHistoryPage'),       'AdminHistoryPage');

// ── Babylon.js 3D configurator (~5 MB) — own Suspense with custom message ─
const ConfiguratorWorkspace = lazyPage(
  () => import('./components/ConfiguratorWorkspace'),
  'ConfiguratorWorkspace'
);

// ── Fallback spinners ─────────────────────────────────────────────────────

/** Generic thin spinner — used for all page transitions */
function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

/** Heavier fallback for the 3D configurator */
function ConfiguratorLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground font-medium">Cargando configurador 3D…</p>
      </div>
    </div>
  );
}

// ─── Admin page shell ─────────────────────────────────────────────────────
function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 lg:px-10 py-8 max-w-6xl">
      {children}
    </div>
  );
}

// ─── Admin route wrapper ──────────────────────────────────────────────────
function AdminRoute({
  children,
  roles = ['admin'],
}: {
  children: React.ReactNode;
  roles?: ('admin' | 'supervisor' | 'worker')[];
}) {
  return (
    <ProtectedRoute allowedRoles={roles}>
      <AdminLayout>
        <AdminPage>{children}</AdminPage>
      </AdminLayout>
    </ProtectedRoute>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="cyf-Custom-theme"
    >
      <AuthProvider>
        <BrowserRouter>

          {/* Single Suspense boundary — catches all lazy page loads */}
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* ── Public / consumer ──────────────────────────────────── */}

              <Route path="/"            element={<LandingPage />} />
              <Route path="/mobile-demo" element={<MobileDemo />} />
              <Route path="/order/:id"   element={<OrderViewPage />} />
              <Route path="/contact"     element={<ContactPage />} />

              <Route path="/product/:id" element={
                <ConsumerLayout><ProductDetailPage /></ConsumerLayout>
              } />
              <Route path="/checkout" element={
                <ConsumerLayout><CheckoutPage /></ConsumerLayout>
              } />
              <Route path="/my-orders" element={
                <ProtectedRoute>
                  <ConsumerLayout><MyOrdersPage /></ConsumerLayout>
                </ProtectedRoute>
              } />

              {/* ── Admin login ─────────────────────────────────────────── */}
              <Route path="/cyf-admin-access" element={<AdminLogin />} />

              {/* ── Admin dashboard (full-page layout, no AdminPage shell) ─ */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout><AdminDashboard /></AdminLayout>
                </ProtectedRoute>
              } />

              {/* ── Admin pages ─────────────────────────────────────────── */}
              <Route path="/admin/orders"              element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
              <Route path="/admin/orders/:id"          element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
              <Route path="/admin/config"              element={<AdminRoute><AdminConfigPage /></AdminRoute>} />
              {/* /admin/config/contact must precede /:module to avoid conflict */}
              <Route path="/admin/config/contact"      element={<AdminRoute><AdminContactPage /></AdminRoute>} />
              <Route path="/admin/config/:module"      element={<AdminRoute><AdminConfigEditor /></AdminRoute>} />
              <Route path="/admin/models"              element={<AdminRoute><AdminModelsPage /></AdminRoute>} />
              <Route path="/admin/users"               element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/audit"               element={<AdminRoute><AdminAuditPage /></AdminRoute>} />
              <Route path="/admin/calculations"        element={<AdminRoute><AdminHistoryPage /></AdminRoute>} />

              {/* ── Protected tools ─────────────────────────────────────── */}
              <Route path="/configurator" element={
                <ProtectedRoute>
                  {/* Nested Suspense: overrides PageLoader with the 3D-specific message */}
                  <Suspense fallback={<ConfiguratorLoader />}>
                    <ConfiguratorWorkspace />
                  </Suspense>
                </ProtectedRoute>
              } />
              <Route path="/calculators" element={
                <ProtectedRoute><CalculatorSuitePage /></ProtectedRoute>
              } />

            </Routes>
          </Suspense>

          {/* Global toasts — outside Suspense so they never get suspended */}
          <Toaster position="top-center" expand={false} richColors closeButton />

        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
