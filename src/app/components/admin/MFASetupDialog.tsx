import { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { supabase } from '@/app/lib/supabase';
import { Shield, Copy, Check, X, AlertCircle } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/app/components/ui/input-otp';

interface MFASetupDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MFASetupDialog({ isOpen, onClose }: MFASetupDialogProps) {
  const { enrollMfa, verifyMfa } = useAuth();

  // Enrollment data
  const [factorId, setFactorId] = useState<string>('');
  const [qrCode, setQRCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [challengeId, setChallengeId] = useState<string>('');

  // Verification
  const [code, setCode] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      initializeEnrollment();
    }
  }, [isOpen]);

  async function initializeEnrollment() {
    try {
      setLoading(true);
      setError(null);

      const enrollment = await enrollMfa();
      setFactorId(enrollment.factorId);
      setQRCode(enrollment.qrCode);
      setSecret(enrollment.secret);
    } catch (err: any) {
      console.error('Error initializing MFA enrollment:', err);
      setError(err.message || 'Error al iniciar la configuración de 2FA');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (code.length !== 6) {
      setError('Debes ingresar un código de 6 dígitos');
      return;
    }

    try {
      setVerifying(true);
      setError(null);

      // Create challenge first
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });

      if (challengeError) throw challengeError;

      // Verify code
      await verifyMfa(factorId, challenge.id, code);

      // Success! Close dialog
      onClose();
    } catch (err: any) {
      console.error('Error verifying MFA code:', err);
      setError(
        'Código incorrecto. Verifica el código en tu aplicación autenticadora e intenta nuevamente.'
      );
      setCode('');
    } finally {
      setVerifying(false);
    }
  }

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const formatSecret = (secret: string): string => {
    return secret.match(/.{1,4}/g)?.join(' ') || secret;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Autenticación de Dos Factores (2FA)
              </h2>
              <p className="text-sm text-slate-600">
                Configura Google Authenticator para mayor seguridad
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Step 1: QR Code */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Paso 1: Escanea el código QR
                  </h3>
                  <p className="text-sm text-slate-600">
                    Abre tu aplicación autenticadora (Google Authenticator, Authy, etc.) y
                    escanea este código QR:
                  </p>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center py-4">
                  <div className="p-6 bg-white border-2 border-slate-200 rounded-xl shadow-sm">
                    <img
                      src={qrCode}
                      alt="QR Code para autenticación de dos factores"
                      className="w-64 h-64"
                    />
                  </div>
                </div>

                {/* Fallback Secret Key */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    ¿No puedes escanear el código? Ingresa este código manualmente:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-sm text-slate-900 select-all">
                      {formatSecret(secret)}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="shrink-0 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      aria-label="Copiar código secreto"
                    >
                      {copied ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <Copy className="h-5 w-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Nombre de la cuenta: CYF Customs Admin
                  </p>
                </div>

                {/* Recommended Apps */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Aplicaciones recomendadas:
                  </p>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Google Authenticator (iOS/Android)</li>
                    <li>• Microsoft Authenticator (iOS/Android)</li>
                    <li>• Authy (iOS/Android/Desktop)</li>
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm font-medium text-slate-500">
                    Paso 2
                  </span>
                </div>
              </div>

              {/* Step 2: Verification */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Verifica tu configuración
                  </h3>
                  <p className="text-sm text-slate-600">
                    Ingresa el código de 6 dígitos que aparece en tu aplicación autenticadora:
                  </p>
                </div>

                {/* OTP Input */}
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={code}
                    onChange={setCode}
                    disabled={verifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={verifying}
                    className="flex-1 px-6 py-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={code.length !== 6 || verifying}
                    className="flex-1 px-6 py-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold transition-colors disabled:opacity-50"
                  >
                    {verifying ? 'Verificando...' : 'Verificar y Activar'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
