import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { LandingPage } from './pages/LandingPage';
import { ConfiguratorWorkspace } from './components/ConfiguratorWorkspace';
import { MobileDemo } from './pages/MobileDemo';
import { LegacyCalculatorPage } from './pages/LegacyCalculatorPage';
import { CalculatorSuitePage } from './pages/CalculatorSuitePage';
import { themeAtom } from './store/atoms';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAtomValue(themeAtom);

  // Initialize theme on first load
  useEffect(() => {
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem('theme') as 'light' | 'dark' || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/configurador" element={<ConfiguratorWorkspace />} />
          <Route path="/mobile-demo" element={<MobileDemo />} />
          <Route path="/calculadora" element={<CalculatorSuitePage />} />
          <Route path="/calculadora-legacy" element={<LegacyCalculatorPage />} />
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