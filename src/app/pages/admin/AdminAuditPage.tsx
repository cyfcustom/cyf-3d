import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchAllAuditLogs, revertConfig } from '@/app/lib/api/calculatorConfigApi';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RotateCcw, History } from 'lucide-react';

interface AuditEntry {
  id: string;
  config_id: string;
  module_name: string;
  changed_at: string;
  field_changed: string;
  old_value: any;
  new_value: any;
  change_reason: string | null;
  previous_version: number;
}

export function AdminAuditPage() {
  const { t } = useTranslation('admin');
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  useEffect(() => {
    loadAudit();
  }, [page]);

  const loadAudit = async () => {
    setIsLoading(true);
    try {
      const result = await fetchAllAuditLogs(page);
      setEntries(result.data as AuditEntry[]);
      setTotalCount(result.count);
    } catch (error) {
      console.error('[Audit]', error);
      toast.error(t('audit.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevert = async (entry: AuditEntry) => {
    setRevertingId(entry.id);
    try {
      await revertConfig(entry.config_id, entry.id);
      toast.success(t('audit.reverted', { module: entry.module_name, field: entry.field_changed }));
      await loadAudit();
    } catch (error) {
      console.error('[Revert]', error);
      toast.error(t('audit.errorReverting'));
    } finally {
      setRevertingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <History size={28} />
          {t('audit.title')}
        </h2>
        <p className="text-muted-foreground font-medium mt-2">
          {t('audit.subtitle')}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          {t('audit.noChanges')}
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-card border border-border rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold capitalize">{entry.module_name}</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-medium">{entry.field_changed}</span>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      v{entry.previous_version} → v{entry.previous_version + 1}
                    </span>
                  </div>
                  {entry.change_reason && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{entry.change_reason}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(entry.changed_at).toLocaleString('es-VE')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevert(entry)}
                  disabled={revertingId === entry.id}
                  className="gap-1.5 shrink-0"
                >
                  {revertingId === entry.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  {t('audit.revert')}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="font-semibold text-red-600 dark:text-red-400">{t('audit.oldValue')}</span>
                  <pre className="mt-1 text-muted-foreground overflow-x-auto max-h-24">
                    {JSON.stringify(entry.old_value, null, 2)}
                  </pre>
                </div>
                <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                  <span className="font-semibold text-green-600 dark:text-green-400">{t('audit.newValue')}</span>
                  <pre className="mt-1 text-muted-foreground overflow-x-auto max-h-24">
                    {JSON.stringify(entry.new_value, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalCount > 20 && (
            <div className="flex justify-center gap-3 pt-4">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('audit.previous')}
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                {t('audit.pageOf', { current: page + 1, total: Math.ceil(totalCount / 20) })}
              </span>
              <Button
                variant="outline"
                disabled={(page + 1) * 20 >= totalCount}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('audit.next')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
