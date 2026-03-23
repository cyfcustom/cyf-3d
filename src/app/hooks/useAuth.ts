import { useAtom, useSetAtom } from 'jotai';
import { supabase } from '@/app/lib/supabase';
import { authUserAtom, isAuthenticatedAtom, mfaRequiredAtom } from '@/app/store/atoms';
import { toast } from 'sonner';

export function useAuth() {
  const [authUser] = useAtom(authUserAtom);
  const [isAuthenticated] = useAtom(isAuthenticatedAtom);
  const [mfaRequired, setMfaRequired] = useAtom(mfaRequiredAtom);
  const setAuthUser = useSetAtom(authUserAtom);
  const setIsAuthenticated = useSetAtom(isAuthenticatedAtom);

  const signIn = async (email: string, password: string) => {
    try {
      // Step 1: Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Step 2: Check AAL (Authenticator Assurance Level)
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      // If current AAL is aal1 and next AAL is aal2, user needs to verify MFA
      if (aal && aal.currentLevel === 'aal1' && aal.nextLevel === 'aal2') {
        // User has MFA enrolled, needs verification
        const { data: factors } = await supabase.auth.mfa.listFactors();

        if (factors && factors.totp && factors.totp.length > 0) {
          const verifiedFactor = factors.totp.find(f => f.status === 'verified');

          if (verifiedFactor) {
            // Step 3: Create MFA challenge
            const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
              factorId: verifiedFactor.id,
            });

            if (challengeError) throw challengeError;

            setMfaRequired(true);
            toast.info('Ingresa tu código de 2FA');
            return {
              requiresMfa: true,
              factorId: verifiedFactor.id,
              challengeId: challenge.id
            };
          }
        }
      }

      // No MFA or already verified
      toast.success('Inicio de sesión exitoso');
      return { requiresMfa: false };
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const verifyMfa = async (factorId: string, challengeId: string, code: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code,
      });

      if (error) throw error;

      toast.success('Código 2FA verificado');
      return data;
    } catch (error: any) {
      toast.error('Código 2FA inválido');
      throw error;
    }
  };

  const enrollMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'CYF Custom Admin',
      });

      if (error) throw error;

      return {
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        factorId: data.id,
      };
    } catch (error: any) {
      toast.error('Error al configurar 2FA');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthUser(null);
      setIsAuthenticated(false);
      setMfaRequired(false);
      toast.success('Sesión cerrada');
    } catch (error: any) {
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  return {
    authUser,
    isAuthenticated,
    mfaRequired,
    signIn,
    verifyMfa,
    enrollMfa,
    signOut,
  };
}
