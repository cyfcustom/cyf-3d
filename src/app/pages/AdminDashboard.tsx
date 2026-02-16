import { useAuth } from '@/app/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Calculator, Palette, Shield, Settings } from 'lucide-react';
import { useState } from 'react';
import { MFASetupDialog } from '@/app/components/admin/MFASetupDialog';

export function AdminDashboard() {
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [showMfaSetup, setShowMfaSetup] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/cyf-admin-access');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">CYF Customs Admin</h1>
                <p className="text-xs text-slate-500">{authUser?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Bienvenido al Panel de Administración
          </h2>
          <p className="text-slate-600">
            Gestiona tus diseños, calculadoras y configuraciones desde aquí.
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Mis Diseños Card */}
          <Link
            to="/configurador"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-400"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                Configurador
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Mis Diseños</h3>
            <p className="text-sm text-slate-600 mb-4">
              Crea y gestiona diseños personalizados para tus productos.
            </p>
            <div className="text-yellow-600 font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
              Ir al Configurador →
            </div>
          </Link>

          {/* Calculadoras Card */}
          <Link
            to="/calculadoras"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-yellow-400"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                Herramientas
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Calculadoras</h3>
            <p className="text-sm text-slate-600 mb-4">
              Accede a todas las calculadoras de precios para tus servicios.
            </p>
            <div className="text-blue-600 font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
              Ver Calculadoras →
            </div>
          </Link>

          {/* Settings Card */}
          <button
            onClick={() => setShowMfaSetup(!showMfaSetup)}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border-2 border-transparent hover:border-slate-300 text-left"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1 rounded-full">
                Seguridad
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Configuración</h3>
            <p className="text-sm text-slate-600 mb-4">
              Gestiona tu cuenta y configuraciones de seguridad.
            </p>
            <div className="text-slate-600 font-semibold text-sm group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
              Administrar →
            </div>
          </button>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Panel de Control</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <p className="text-sm text-yellow-700 font-medium mb-1">Diseños Activos</p>
              <p className="text-3xl font-bold text-yellow-900">0</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-sm text-blue-700 font-medium mb-1">Calculadoras</p>
              <p className="text-3xl font-bold text-blue-900">8</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-sm text-green-700 font-medium mb-1">Estado</p>
              <p className="text-xl font-bold text-green-900">Activo</p>
            </div>
          </div>
        </div>

        {/* MFA Setup Dialog */}
        <MFASetupDialog isOpen={showMfaSetup} onClose={() => setShowMfaSetup(false)} />
      </main>
    </div>
  );
}
