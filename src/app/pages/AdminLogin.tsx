import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/hooks/useAuth';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { signIn, verifyMfa, mfaRequired } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.requiresMfa && result.factorId && result.challengeId) {
        setFactorId(result.factorId);
        setChallengeId(result.challengeId);
      } else {
        // No MFA required, redirect to admin
        navigate('/admin');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyMfa(factorId, challengeId, mfaCode);
      navigate('/admin');
    } catch (error) {
      console.error('MFA verification error:', error);
      setMfaCode('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4">
            <Shield className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CYF Customs</h1>
          <p className="text-slate-400">Panel de Administración</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {!mfaRequired ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
                  placeholder="admin@cyfcustoms.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all pr-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock size={20} />
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleMfaVerify} className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mb-3">
                  <Shield className="w-6 h-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Autenticación de Dos Factores
                </h2>
                <p className="text-sm text-slate-600">
                  Ingresa el código de 6 dígitos desde tu aplicación de autenticación
                </p>
              </div>

              <div>
                <label
                  htmlFor="mfaCode"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Código de Verificación
                </label>
                <input
                  id="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  required
                  maxLength={6}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || mfaCode.length !== 6}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold py-3 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Shield size={20} />
                {isLoading ? 'Verificando...' : 'Verificar Código'}
              </button>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Acceso restringido - Solo personal autorizado
          </p>
        </div>
      </div>
    </div>
  );
}
