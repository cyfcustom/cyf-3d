import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllConfigs } from '@/app/lib/api/calculatorConfigApi';
import type { CalculatorConfig } from '@/app/lib/api/calculatorConfigApi';
import { Settings, ChevronRight, Loader2 } from 'lucide-react';

const MODULE_LABELS: Record<string, string> = {
  sublimacion: 'Sublimación',
  vinil: 'Vinil',
  papeleria: 'Papelería',
  etiquetas: 'Etiquetas',
  dtf: 'DTF',
  empaques: 'Empaques',
  esferas: 'Esferas',
  envios: 'Envíos',
};

export function AdminConfigPage() {
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
        <h2 className="text-3xl font-extrabold tracking-tight">Configuración de Calculadoras</h2>
        <p className="text-muted-foreground font-medium mt-2">
          Gestiona las tarifas y parámetros de cada módulo de cálculo.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No hay configuraciones en Supabase todavía.</p>
          <p className="text-sm mt-1">Ejecuta la migración SQL para crear la configuración inicial.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {configs.map((config) => (
            <Link
              key={config.id}
              to={`/admin/config/${config.module_name}`}
              className="group flex items-center justify-between p-6 bg-card border border-border/40 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all"
            >
              <div>
                <h3 className="text-lg font-bold">
                  {MODULE_LABELS[config.module_name] ?? config.module_name}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Versión {config.config_version}</span>
                  <span>
                    Actualizado:{' '}
                    {config.updated_at
                      ? new Date(config.updated_at).toLocaleDateString('es-VE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'N/A'}
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
      )}
    </div>
  );
}
