import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllHistory } from '@/app/lib/api/calculationHistoryApi';
import type { CalculationHistoryEntry } from '@/app/lib/api/calculationHistoryApi';
import { formatMoney } from '@/app/lib/money';
import { Button } from '@/app/components/ui/button';
import { Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function AdminHistoryPage() {
  const { t } = useTranslation('admin');
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
      toast.error(t('history.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const moduleKeys = ['sublimacion', 'vinil', 'papeleria', 'etiquetas', 'dtf', 'empaques', 'esferas', 'envios'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <FileText size={28} />
          {t('history.title')}
        </h2>
        <p className="text-muted-foreground font-medium mt-2">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{t('history.filterByModule')}</span>
        <select
          value={moduleFilter}
          onChange={(e) => {
            setModuleFilter(e.target.value);
            setPage(0);
          }}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="">{t('history.all')}</option>
          {moduleKeys.map((key) => (
            <option key={key} value={key}>
              {t(`modules.${key}`)}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground">
          {totalCount === 1
            ? t('history.records', { count: totalCount })
            : t('history.records_plural', { count: totalCount })}
        </span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t('history.noCalculations')}
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
                    {t(`modules.${entry.module_name}`, { defaultValue: entry.module_name })}
                  </span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    v{entry.config_version}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {entry.quantity} {t('history.unit')} &mdash; {t('history.user')} {entry.user_id.slice(0, 12)}...
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
                {t('history.previous')}
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                {t('history.pageOf', { current: page + 1, total: Math.ceil(totalCount / 20) })}
              </span>
              <Button
                variant="outline"
                disabled={(page + 1) * 20 >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('history.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
