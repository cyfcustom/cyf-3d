import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './pages/LandingPage';
import { MobileDemo } from './pages/MobileDemo';

// Lazy load heavy components (Babylon.js ~5MB)
const ConfiguratorWorkspace = lazy(() =>
  import('./components/ConfiguratorWorkspace').then(m => ({ default: m.ConfiguratorWorkspace }))
);
import { CalculatorSuitePage } from './pages/CalculatorSuitePage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminConfigPage } from './pages/admin/AdminConfigPage';
import { AdminConfigEditor } from './pages/admin/AdminConfigEditor';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditPage } from './pages/admin/AdminAuditPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminModelsPage } from './pages/admin/AdminModelsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './providers/AuthProvider';

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="cyf-customs-theme"
    >
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/mobile-demo" element={<MobileDemo />} />

          {/* Hidden Admin Login Route */}
          <Route path="/cyf-admin-access" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminConfigPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config/:module"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminConfigEditor />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminUsersPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminAuditPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/calculations"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminHistoryPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/models"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <div className="min-h-screen bg-background font-urbanist text-foreground">
                  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                    <AdminModelsPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/configurator"
            element={
              <ProtectedRoute>
                <Suspense fallback={
                  <div className="h-screen flex items-center justify-center bg-background">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-muted-foreground font-medium">Cargando configurador 3D...</p>
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
            element={
              <ProtectedRoute>
                <CalculatorSuitePage />
              </ProtectedRoute>
            }
          />
        </Routes>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-center"
          expand={false}
          richColors
          closeButton
        />
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}