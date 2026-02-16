import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { isAuthenticatedAtom, authUserAtom } from '@/app/store/atoms';
import { userRoleAtom } from '@/app/store/roleAtoms';
import { supabase } from '@/app/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/app/types/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [authUser, setAuthUser] = useAtom(authUserAtom);
  const { role, isLoading: isRoleLoading } = useAtomValue(userRoleAtom);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'admin',
        });
        setIsAuthenticated(true);
      } else {
        setAuthUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setAuthUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking || (isAuthenticated && isRoleLoading)) {
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

  // Check role-based access
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Acceso Restringido</h2>
          <p className="text-slate-600">No tienes los permisos necesarios para acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
