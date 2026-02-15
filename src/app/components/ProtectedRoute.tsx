import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isAuthenticatedAtom } from '@/app/store/atoms';
import { supabase } from '@/app/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setIsChecking(false);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/cyf-admin-access" replace />;
  }

  return <>{children}</>;
}
