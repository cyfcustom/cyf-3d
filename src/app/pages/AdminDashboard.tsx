import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Calculator, Palette, Shield, Settings, ExternalLink, ChevronRight, Users, History, FileText, Sliders, Package } from 'lucide-react';
import { useState } from 'react';
import { MFASetupDialog } from '@/app/components/admin/MFASetupDialog';
import { motion } from 'framer-motion';
import { useTranslation, Trans } from 'react-i18next';

export function AdminDashboard() {
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMfaSetup, setShowMfaSetup] = useState(false);
  const { t } = useTranslation('admin');

  const handleLogout = async () => {
    await signOut();
    navigate('/cyf-admin-access');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background font-urbanist text-foreground">
      {/* Admin Header */}
      <header className="bg-card/50 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-11 h-11 bg-[#FFD600] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FFD600]/20"
              >
                <img src="/CYF CUSTOM_isotipo circular negro.png" alt="CYF" className="w-8 h-8" />
              </motion.div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">{t('dashboard.title')}</h1>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{authUser?.email}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-muted/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-300 border border-border/50 font-bold text-xs uppercase tracking-wider"
            >
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span>{t('dashboard.logout')}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-4xl font-extrabold tracking-tight mb-3">
              <Trans
                i18nKey="dashboard.welcome"
                ns="admin"
                values={{ name: 'Francisco' }}
                components={{ highlight: <span className="text-[#FFD600]" /> }}
              />
            </h2>
            <p className="text-muted-foreground font-medium text-lg max-w-2xl">
              <Trans
                i18nKey="dashboard.subtitle"
                ns="admin"
                components={{ bold: <span className="text-foreground font-bold" /> }}
              />
            </p>
          </motion.div>

          {/* Admin Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
            <motion.div variants={itemVariants}>
              <Link
                to="/admin/config"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#FF6B35]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#FF6B35]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FF6B35] transition-all mb-4">
                  <Sliders className="w-6 h-6 text-[#FF6B35] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('cards.config.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('cards.config.description')}</p>
                <span className="mt-auto text-[10px] font-bold text-[#FF6B35] uppercase tracking-widest">{t('cards.config.action')}</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/admin/models"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#FFD600]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#FFD600]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FFD600] transition-all mb-4">
                  <Package className="w-6 h-6 text-[#FFD600] group-hover:text-slate-900" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('cards.models.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('cards.models.description')}</p>
                <span className="mt-auto text-[10px] font-bold text-[#FFD600] uppercase tracking-widest">{t('cards.models.action')}</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/admin/users"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#10B981]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#10B981]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#10B981] transition-all mb-4">
                  <Users className="w-6 h-6 text-[#10B981] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('cards.users.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('cards.users.description')}</p>
                <span className="mt-auto text-[10px] font-bold text-[#10B981] uppercase tracking-widest">{t('cards.users.action')}</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/admin/audit"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#8B5CF6]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#8B5CF6] transition-all mb-4">
                  <History className="w-6 h-6 text-[#8B5CF6] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('cards.audit.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('cards.audit.description')}</p>
                <span className="mt-auto text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest">{t('cards.audit.action')}</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/admin/calculations"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#06B6D4]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#06B6D4]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#06B6D4] transition-all mb-4">
                  <FileText className="w-6 h-6 text-[#06B6D4] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">{t('cards.calculations.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t('cards.calculations.description')}</p>
                <span className="mt-auto text-[10px] font-bold text-[#06B6D4] uppercase tracking-widest">{t('cards.calculations.action')}</span>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                to="/admin/orders"
                className="group flex flex-col bg-card border border-border/40 hover:border-[#F59E0B]/50 rounded-[24px] p-6 shadow-sm hover:shadow-xl transition-all duration-300 h-full"
              >
                <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#F59E0B] transition-all mb-4">
                  <Package className="w-6 h-6 text-[#F59E0B] group-hover:text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1">Pedidos</h3>
                <p className="text-sm text-muted-foreground mb-4">Gestiona pedidos, verifica comprobantes de pago y actualiza estados.</p>
                <span className="mt-auto text-[10px] font-bold text-[#F59E0B] uppercase tracking-widest">Ver pedidos →</span>
              </Link>
            </motion.div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Mis Diseños Card */}
            <motion.div variants={itemVariants}>
              <Link
                to="/configurator"
                className="group relative flex flex-col bg-card border border-border/40 hover:border-[#FFD600]/50 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-[#FFD600]/5 transition-all duration-500 overflow-hidden h-full"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FFD600]/5 blur-3xl rounded-full group-hover:bg-[#FFD600]/10 transition-colors" />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-[#FFD600]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#FFD600] group-hover:rotate-6 transition-all duration-500">
                    <Palette className="w-7 h-7 text-[#FFD600] group-hover:text-slate-900" />
                  </div>
                  <ExternalLink size={20} className="text-muted-foreground/30 group-hover:text-[#FFD600] transition-colors" />
                </div>

                <h3 className="text-2xl font-extrabold mb-3">{t('quickActions.designs.title')}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                  {t('quickActions.designs.description')}
                </p>

                <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-[#FFD600] uppercase tracking-widest">
                  {t('quickActions.designs.action')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Calculadoras Card */}
            <motion.div variants={itemVariants}>
              <Link
                to="/calculators"
                className="group relative flex flex-col bg-card border border-border/40 hover:border-[#00B4D8]/50 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:shadow-[#00B4D8]/5 transition-all duration-500 overflow-hidden h-full"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#00B4D8]/5 blur-3xl rounded-full group-hover:bg-[#00B4D8]/10 transition-colors" />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-[#00B4D8]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#00B4D8] group-hover:rotate-6 transition-all duration-500">
                    <Calculator className="w-7 h-7 text-[#00B4D8] group-hover:text-white" />
                  </div>
                  <ExternalLink size={20} className="text-muted-foreground/30 group-hover:text-[#00B4D8] transition-colors" />
                </div>

                <h3 className="text-2xl font-extrabold mb-3">{t('quickActions.calculators.title')}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                  {t('quickActions.calculators.description')}
                </p>

                <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-[#00B4D8] uppercase tracking-widest">
                  {t('quickActions.calculators.action')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>

            {/* Config Card */}
            <motion.div variants={itemVariants}>
              <button
                onClick={() => setShowMfaSetup(!showMfaSetup)}
                className="w-full h-full text-left group relative flex flex-col bg-card border border-border/40 hover:border-foreground/20 rounded-[32px] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-foreground/5 blur-3xl rounded-full group-hover:bg-foreground/10 transition-colors" />

                <div className="flex items-center justify-between mb-8">
                  <div className="w-14 h-14 bg-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-foreground group-hover:rotate-6 transition-all duration-500">
                    <Shield className="w-7 h-7 text-muted-foreground group-hover:text-background" />
                  </div>
                  <Settings size={20} className="text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                </div>

                <h3 className="text-2xl font-extrabold mb-3">{t('quickActions.security.title')}</h3>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-8">
                  {t('quickActions.security.description')}
                </p>

                <div className="mt-auto flex items-center gap-2 text-[11px] font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-widest transition-colors">
                  {t('quickActions.security.action')} <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </motion.div>
          </div>

          {/* Business Overview */}
          <motion.div variants={itemVariants} className="bg-card border border-border/40 rounded-[32px] p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h3 className="text-2xl font-extrabold mb-2">{t('overview.title')}</h3>
                <p className="text-muted-foreground font-medium text-sm tracking-wide">{t('overview.subtitle')}</p>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {t('overview.systemsOnline')}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-muted/30 border border-border/20 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('overview.activeModules')}</p>
                <p className="text-3xl font-extrabold tracking-tight">8</p>
              </div>
              <div className="bg-muted/30 border border-border/20 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('overview.adminSession')}</p>
                <p className="text-3xl font-extrabold tracking-tight text-emerald-500">{t('overview.protected')}</p>
              </div>
              <div className="bg-muted/30 border border-border/20 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('overview.database')}</p>
                <p className="text-3xl font-extrabold tracking-tight">Supabase</p>
              </div>
              <div className="bg-muted/30 border border-border/20 rounded-3xl p-6">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{t('overview.region')}</p>
                <p className="text-3xl font-extrabold tracking-tight">VE</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* MFA Setup Dialog */}
        <MFASetupDialog isOpen={showMfaSetup} onClose={() => setShowMfaSetup(false)} />
      </main>
    </div>
  );
}
