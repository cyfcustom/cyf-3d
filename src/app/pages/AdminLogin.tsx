import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/hooks/useAuth';
import { Lock, Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AdminLogin() {
  const { t } = useTranslation('admin');
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 font-urbanist">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 relative inline-block"
          >
            <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
            <img
              src="/CYF CUSTOM_isotipo circular negro.png"
              alt="CYF Custom"
              className="w-28 h-28 mx-auto relative z-10 drop-shadow-xl dark:invert"
            />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tighter mb-2">
            CYF Custom
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">
            {t('login.panelTitle')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] rounded-[32px] p-8 md:p-10 backdrop-blur-sm relative overflow-hidden">
          {/* Subtle Accent Gradient */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FFD600]/10 blur-[64px] rounded-full" />

          <AnimatePresence mode="wait">
            {!mfaRequired ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-6 relative z-10"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-bold text-foreground/70 ml-1 uppercase tracking-wider"
                  >
                    {t('login.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-muted/50 border-none ring-1 ring-border focus:ring-2 focus:ring-[#FFD600] outline-none transition-all duration-300 placeholder:text-muted-foreground/50 text-foreground"
                    placeholder={t('login.emailPlaceholder')}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-[13px] font-bold text-foreground/70 ml-1 uppercase tracking-wider"
                  >
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-muted/50 border-none ring-1 ring-border focus:ring-2 focus:ring-[#FFD600] outline-none transition-all duration-300 pr-14 text-foreground placeholder-transparent"
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FFD600] text-slate-900 font-extrabold py-4 rounded-2xl shadow-lg shadow-[#FFD600]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-8 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={18} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
                      <span>{t('login.submit')}</span>
                    </>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="mfa-form"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                onSubmit={handleMfaVerify}
                className="space-y-6 relative z-10"
              >
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-[#FFD600]/20 rounded-2xl mb-4">
                    <Shield className="w-7 h-7 text-[#FFD600]" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {t('login.mfa.title')}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed px-4">
                    {t('login.mfa.description')}
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    id="mfaCode"
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-6 rounded-2xl bg-muted/50 border-none ring-1 ring-border focus:ring-2 focus:ring-[#FFD600] outline-none transition-all text-center text-4xl tracking-[0.5em] font-extrabold text-foreground"
                    placeholder={t('login.mfa.placeholder')}
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading || mfaCode.length !== 6}
                  className="w-full bg-[#FFD600] text-slate-900 font-extrabold py-4 rounded-2xl shadow-lg shadow-[#FFD600]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield size={18} strokeWidth={2.5} />
                      <span>{t('login.mfa.verify')}</span>
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full text-sm font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 pt-2"
                >
                  <ArrowLeft size={16} />
                  {t('login.mfa.back')}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-10 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
            <Shield size={12} className="text-[#FFD600]" />
            {t('login.restricted')}
          </div>
          <p className="text-[10px] text-muted-foreground/40 font-medium uppercase tracking-[0.3em]">
            {t('login.copyright', { year: new Date().getFullYear() })}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
