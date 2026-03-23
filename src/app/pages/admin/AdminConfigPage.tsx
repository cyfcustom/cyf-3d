import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAllConfigs } from '@/app/lib/api/calculatorConfigApi';
import type { CalculatorConfig } from '@/app/lib/api/calculatorConfigApi';
import { Settings, ChevronRight, Loader2, MessageCircle } from 'lucide-react';

export function AdminConfigPage() {
  const { t } = useTranslation('admin');
  const [configs, setConfigs] = useState<CalculatorConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const data = await fetchAllConfigs();
      setConfigs(data as CalculatorConfig[]);
    } catch (error) {
      console.error('[AdminConfig]', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">{t('config.title')}</h2>
        <p className="text-muted-foreground font-medium mt-2">
          {t('config.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('config.noConfigs')}</p>
          <p className="text-sm mt-1">{t('config.runMigration')}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── Calculadoras ── */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Calculadoras
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {configs.map((config) => (
                <Link
                  key={config.id}
                  to={`/admin/config/${config.module_name}`}
                  className="group flex items-center justify-between p-6 bg-card border border-border/40 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div>
                    <h3 className="text-lg font-bold">
                      {t(`modules.${config.module_name}`, { defaultValue: config.module_name })}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{t('config.version', { version: config.config_version })}</span>
                      <span>
                        {t('config.updated')}{' '}
                        {config.updated_at
                          ? new Date(config.updated_at).toLocaleDateString('es-VE', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : t('config.notAvailable')}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* ── Contacto ── */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Página de contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/admin/config/contact"
                className="group flex items-center justify-between p-6 bg-card border border-border/40 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">Canales & Mensajes</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Canales de contacto, activar/desactivar y mensajes recibidos
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={20}
                  className="text-muted-foreground/30 group-hover:text-primary transition-colors"
                />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
