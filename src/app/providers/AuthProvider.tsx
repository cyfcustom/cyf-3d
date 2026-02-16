import { useEffect, ReactNode, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { authUserAtom, isAuthenticatedAtom, mfaRequiredAtom } from '@/app/store/atoms';
import { userRoleAtom, userPermissionsAtom } from '@/app/store/roleAtoms';
import { fetchUserRole, fetchUserPermissions } from '@/app/lib/api/userRolesApi';
import { supabase } from '@/app/lib/supabase';
import { toast } from 'sonner';

interface AuthProviderProps {
  children: ReactNode;
}

// Session timeout: 30 minutes of inactivity
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * AuthProvider - Global auth state synchronization
 * Ensures Supabase session is always in sync with Jotai atoms
 * Handles session persistence across page reloads
 * Manages automatic logout after inactivity
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const setAuthUser = useSetAtom(authUserAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);
  const setMfaRequired = useSetAtom(mfaRequiredAtom);
  const setUserRole = useSetAtom(userRoleAtom);
  const setUserPermissions = useSetAtom(userPermissionsAtom);

  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef<number>(Date.now());

  async function hydrateUserRole(userId: string) {
    setUserRole({ role: null, isLoading: true });
    try {
      const role = await fetchUserRole(userId);
      // Fallback to 'admin' for legacy users without a role row
      setUserRole({ role: role ?? 'admin', isLoading: false });

      if (role === 'supervisor') {
        const perms = await fetchUserPermissions(userId);
        setUserPermissions(perms);
      } else {
        setUserPermissions([]);
      }
    } catch {
      setUserRole({ role: null, isLoading: false });
      setUserPermissions([]);
    }
  }

  function clearRoleState() {
    setUserRole({ role: null, isLoading: false });
    setUserPermissions([]);
  }

  useEffect(() => {
    // Initial session check
    checkInitialSession();

    // Setup inactivity detection
    setupInactivityDetection();

    // Listen for auth changes globally
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth event:', event);

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            setAuthUser({
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'admin',
            });
            setIsAuthenticated(true);
            setMfaRequired(false);
            hydrateUserRole(session.user.id);
          }
          break;

        case 'SIGNED_OUT':
          setAuthUser(null);
          setIsAuthenticated(false);
          setMfaRequired(false);
          clearRoleState();
          break;

        case 'MFA_CHALLENGE_VERIFIED':
          if (session?.user) {
            setAuthUser({
              id: session.user.id,
              email: session.user.email || '',
              role: session.user.user_metadata?.role || 'admin',
            });
            setIsAuthenticated(true);
            setMfaRequired(false);
            hydrateUserRole(session.user.id);
          }
          break;

        default:
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
      cleanupInactivityDetection();
    };
  }, [setAuthUser, setIsAuthenticated, setMfaRequired]);

  async function checkInitialSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('[AuthProvider] Session restored:', session.user.email);
        setAuthUser({
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.user_metadata?.role || 'admin',
        });
        setIsAuthenticated(true);
        hydrateUserRole(session.user.id);
      } else {
        console.log('[AuthProvider] No active session');
        setAuthUser(null);
        setIsAuthenticated(false);
        clearRoleState();
      }
    } catch (error) {
      console.error('[AuthProvider] Error checking session:', error);
      setAuthUser(null);
      setIsAuthenticated(false);
      clearRoleState();
    }
  }

  function setupInactivityDetection() {
    // Events that indicate user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const resetInactivityTimer = () => {
      lastActivityTime.current = Date.now();

      // Clear existing timer
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }

      // Set new timer
      inactivityTimer.current = setTimeout(async () => {
        const timeSinceLastActivity = Date.now() - lastActivityTime.current;

        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          await handleInactivityLogout();
        }
      }, INACTIVITY_TIMEOUT);
    };

    // Add event listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Start initial timer
    resetInactivityTimer();

    // Store cleanup function reference
    (window as any).__cleanupInactivityListeners = () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }

  function cleanupInactivityDetection() {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    // Remove event listeners
    if ((window as any).__cleanupInactivityListeners) {
      (window as any).__cleanupInactivityListeners();
    }
  }

  async function handleInactivityLogout() {
    console.log('[AuthProvider] Logging out due to inactivity');

    try {
      await supabase.auth.signOut();
      setAuthUser(null);
      setIsAuthenticated(false);
      setMfaRequired(false);
      clearRoleState();

      toast.info('Sesión cerrada por inactividad', {
        description: 'Por tu seguridad, hemos cerrado tu sesión después de 30 minutos de inactividad.',
        duration: 5000,
      });
    } catch (error) {
      console.error('[AuthProvider] Error during inactivity logout:', error);
    }
  }

  return <>{children}</>;
}
