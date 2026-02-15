import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './pages/LandingPage';
import { ConfiguratorWorkspace } from './components/ConfiguratorWorkspace';
import { MobileDemo } from './pages/MobileDemo';
import { CalculatorSuitePage } from './pages/CalculatorSuitePage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="cyf-customs-theme"
    >
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
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configurador"
            element={
              <ProtectedRoute>
                <ConfiguratorWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculadoras"
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
    </ThemeProvider>
  );
}