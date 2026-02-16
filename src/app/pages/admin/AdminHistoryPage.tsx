import { useState, useEffect } from 'react';
import { fetchAllHistory } from '@/app/lib/api/calculationHistoryApi';
import type { CalculationHistoryEntry } from '@/app/lib/api/calculationHistoryApi';
import { formatMoney } from '@/app/lib/money';
import { Button } from '@/app/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

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

export function AdminHistoryPage() {
  const [entries, setEntries] = useState<CalculationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [moduleFilter, setModuleFilter] = useState<string>('');

  useEffect(() => {
    loadHistory();
  }, [page, moduleFilter]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllHistory(moduleFilter || undefined, page);
      setEntries(result.data as CalculationHistoryEntry[]);
      setTotalCount(result.count);
    } catch (error) {
      console.error('[AdminHistory]', error);
      toast.error('Error cargando historial');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FileText size={28} />
          Historial de Cálculos
        </h2>
        <p className="text-muted-foreground font-medium mt-2">
          Registro de todos los cálculos realizados por los usuarios.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Filtrar por módulo:</span>
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(0);
          }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">Todos</option>
          {Object.entries(MODULE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {totalCount} registro{totalCount !== 1 ? 's' : ''}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          Sin cálculos registrados.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl"
            >
              <div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold">
                    {MODULE_LABELS[entry.module_name] ?? entry.module_name}
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    v{entry.config_version}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.quantity} ud. &mdash; Usuario: {entry.user_id.slice(0, 12)}...
                  {entry.note && ` — ${entry.note}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(entry.created_at!).toLocaleString('es-VE')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">{formatMoney(entry.total_amount, 'USD')}</div>
              </div>
            </div>
          ))}

          {totalCount > 20 && (
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                Página {page + 1} de {Math.ceil(totalCount / 20)}
              </span>
              <Button
                variant="outline"
                disabled={(page + 1) * 20 >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
