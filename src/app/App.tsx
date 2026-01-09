import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'next-themes';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './pages/LandingPage';
import { ConfiguratorWorkspace } from './components/ConfiguratorWorkspace';
import { MobileDemo } from './pages/MobileDemo';

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
          <Route path="/configurador" element={<ConfiguratorWorkspace />} />
          <Route path="/mobile-demo" element={<MobileDemo />} />
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