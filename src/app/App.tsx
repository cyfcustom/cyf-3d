import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';

// ── Layouts ──────────────────────────────────────────────────────────────────
import { AdminLayout } from './layouts/AdminLayout';
import { ConsumerLayout } from './layouts/ConsumerLayout';

// ── Pages: public / consumer ──────────────────────────────────────────────
import { LandingPage } from './pages/LandingPage';
import { MobileDemo } from './pages/MobileDemo';
import { OrderViewPage } from './pages/OrderViewPage';   // self-contained (shareable link)
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { ContactPage } from './pages/ContactPage';

// ── Pages: admin ──────────────────────────────────────────────────────────
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminConfigPage } from './pages/admin/AdminConfigPage';
import { AdminConfigEditor } from './pages/admin/AdminConfigEditor';
import { AdminContactPage } from './pages/admin/AdminContactPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminModelsPage } from './pages/admin/AdminModelsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminOrderDetailPage } from './pages/admin/AdminOrderDetailPage';

// ── Heavy lazy load (Babylon.js ~5MB) ────────────────────────────────────
const ConfiguratorWorkspace = lazy(() =>
  import('./components/ConfiguratorWorkspace').then(m => ({ default: m.ConfiguratorWorkspace }))
);
import { CalculatorSuitePage } from './pages/CalculatorSuitePage';

// ── Auth ──────────────────────────────────────────────────────────────────
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './providers/AuthProvider';

// ─── Admin page shell ──────────────────────────────────────────────────────
// Provides consistent padding + max-width for all admin content pages.
function AdminPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 lg:px-10 py-8 max-w-6xl">
      {children}
    </div>
  );
}

// ─── Admin route wrapper ───────────────────────────────────────────────────
// Combines ProtectedRoute + AdminLayout + AdminPage for every admin route.
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
          <Routes>

            {/* ── Public / consumer ──────────────────────────────────────── */}

            {/* Landing: has its own Navbar internally */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/mobile-demo" element={<MobileDemo />} />

            {/* Self-contained: shareable order link, no persistent nav */}
            <Route path="/order/:id" element={<OrderViewPage />} />

            {/* Contact page — standalone Linktree-style */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Consumer pages: need Navbar + cart access */}
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

            {/* ── Admin login (not wrapped in any layout) ─────────────── */}
            <Route path="/cyf-admin-access" element={<AdminLogin />} />

            {/* ── Admin: dashboard (has its own full-page header) ─────── */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* ── Admin: all other pages use AdminRoute ────────────────── */}
            <Route path="/admin/orders"     element={<AdminRoute><AdminOrdersPage /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><AdminOrderDetailPage /></AdminRoute>} />
            <Route path="/admin/config"          element={<AdminRoute><AdminConfigPage /></AdminRoute>} />
            <Route path="/admin/config/contact"  element={<AdminRoute><AdminContactPage /></AdminRoute>} />
            <Route path="/admin/config/:module"  element={<AdminRoute><AdminConfigEditor /></AdminRoute>} />
            <Route path="/admin/models"     element={<AdminRoute><AdminModelsPage /></AdminRoute>} />
            <Route path="/admin/users"      element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/audit"      element={<AdminRoute><AdminAuditPage /></AdminRoute>} />
            <Route path="/admin/calculations" element={<AdminRoute><AdminHistoryPage /></AdminRoute>} />

            {/* ── Protected tools ──────────────────────────────────────── */}
            <Route
              path="/configurator"
              element={
                <ProtectedRoute>
                  <Suspense fallback={
                    <div className="h-screen flex items-center justify-center bg-background">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-muted-foreground font-medium">Cargando configurador 3D…</p>
                      </div>
                    </div>
                  }>
                    <ConfiguratorWorkspace />
                  </Suspense>
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculators"
              element={<ProtectedRoute><CalculatorSuitePage /></ProtectedRoute>}
            />

          </Routes>

          {/* Global toasts — outside layouts so they always render */}
          <Toaster position="top-center" expand={false} richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
