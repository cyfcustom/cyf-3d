import { useState, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { authUserAtom } from '@/app/store/atoms';
import { fetchUserHistory } from '@/app/lib/api/calculationHistoryApi';
import type { CalculationHistoryEntry } from '@/app/lib/api/calculationHistoryApi';
import { formatMoney } from '@/app/lib/money';
import { ChevronDown, ChevronUp, History } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface Props {
  moduleName: string;
}

export function CalculationHistoryPanel({ moduleName }: Props) {
  const authUser = useAtomValue(authUserAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [entries, setEntries] = useState<CalculationHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (isOpen && authUser) {
      loadHistory();
    }
  }, [isOpen, page, authUser?.id]);

  const loadHistory = async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      const result = await fetchUserHistory(authUser.id, moduleName, page);
      setEntries(result.data as CalculationHistoryEntry[]);
      setTotalCount(result.count);
    } catch (error) {
      console.error('[History]', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!authUser) return null;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <History size={16} />
          Historial de cálculos
          {totalCount > 0 && (
            <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{totalCount}</span>
          )}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div className="border-t border-border p-4 space-y-3">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
          ) : entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin cálculos guardados todavía.
            </p>
          ) : (
            <>
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 text-sm"
                >
                  <div>
                    <div className="font-medium">
                      {entry.quantity} ud. &mdash; {formatMoney(entry.total_amount, 'USD')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(entry.created_at!).toLocaleDateString('es-VE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {entry.note && ` — ${entry.note}`}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">v{entry.config_version}</span>
                </div>
              ))}

              {totalCount > 10 && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(page + 1) * 10 >= totalCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
