import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney } from '@/app/lib/money';
import { useSummaryTotals } from './summaryContext';

const MODULE_DEFS = [
  { id: 'vinyl', labelKey: 'modules.vinyl.name', defaultOn: true },
  { id: 'sublimation', labelKey: 'modules.sublimation.name', defaultOn: true },
  { id: 'labels', labelKey: 'modules.labels.name', defaultOn: true },
  { id: 'packaging', labelKey: 'modules.packaging.name', defaultOn: true },
  { id: 'stationery', labelKey: 'modules.stationery.name', defaultOn: true },
  { id: 'shipping', labelKey: 'modules.shipping.name', defaultOn: false },
  { id: 'dtf', labelKey: 'modules.dtf.name', defaultOn: false },
  { id: 'spheres', labelKey: 'modules.spheres.name', defaultOn: true },
  { id: 'customizable', labelKey: 'modules.custom.name', defaultOn: true },
] as const;

type ModuleId = (typeof MODULE_DEFS)[number]['id'];

export function SummaryModule() {
  const { t } = useTranslation(['calculator', 'common']);
  const ctx = useSummaryTotals();
  const totals = ctx?.totals ?? {};

  const MODULES = MODULE_DEFS.map((m) => ({
    ...m,
    label: t(`calculator:${m.labelKey}`),
  }));

  const [enabled, setEnabled] = useState<Record<ModuleId, boolean>>(() => {
    const initial: Record<ModuleId, boolean> = {} as Record<ModuleId, boolean>;
    MODULE_DEFS.forEach((m) => {
      initial[m.id] = m.defaultOn;
    });
    return initial;
  });

  const selectedTotal = useMemo(() => {
    return MODULE_DEFS.reduce((acc, m) => {
      const val = totals[m.id] ?? 0;
      return acc + (enabled[m.id] ? val : 0);
    }, 0);
  }, [enabled, totals]);

  const copySummary = () => {
    const lines = MODULES.map((m) => `${m.label} = ${formatMoney(totals[m.id] ?? 0)}${enabled[m.id] ? '' : ' (omitted)'}`);
    lines.push(`Total General = ${formatMoney(selectedTotal)}`);
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="space-y-6" id="summary">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('calculator:summary.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('calculator:summary.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('calculator:summary.description')}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MODULES.map((m) => (
          <div key={m.id} className="p-4 border border-border rounded-xl bg-card space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{m.label}</span>
              <Switch
                checked={enabled[m.id]}
                onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [m.id]: v }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">{formatMoney(totals[m.id] ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">{t('calculator:fields.totalSelected')}</h3>
            <p className="text-sm text-muted-foreground">{t('calculator:fields.totalSelectedDesc')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copySummary}>{t('common:actions.copy')}</Button>
            <Button variant="outline" onClick={() => window.print()}>{t('common:actions.export')}</Button>
          </div>
        </div>
        <div className="text-3xl font-bold">{formatMoney(selectedTotal)}</div>
      </div>
    </div>
  );
}
