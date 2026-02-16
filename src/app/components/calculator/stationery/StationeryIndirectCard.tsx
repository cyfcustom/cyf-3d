import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useStationeryCalculator } from '@/app/store/calculator';

export function StationeryIndirectCard({
  state,
  onToggle,
  onMonthlyChange,
  onUnitsChange,
}: {
  state: ReturnType<typeof useStationeryCalculator>['state']['indirect'];
  onToggle: (enabled: boolean) => void;
  onMonthlyChange: (key: keyof typeof state.monthly, value: number) => void;
  onUnitsChange: (value: number) => void;
}) {
  const { t } = useTranslation('calculator');
  const monthlyTotal =
    state.monthly.rent +
    state.monthly.internet +
    state.monthly.subscriptions +
    state.monthly.transport +
    state.monthly.electricity +
    state.monthly.advertising +
    state.monthly.other;
  const perUnit = state.enabled ? monthlyTotal / Math.max(1, state.unitsPerMonth) : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.indirectCosts')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.indirectCosts')}</p>
        </div>
        <Switch checked={state.enabled} onCheckedChange={onToggle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {([
          ['rent', t('indirectCosts.rent')],
          ['internet', t('indirectCosts.internet')],
          ['subscriptions', t('indirectCosts.subscriptions')],
          ['transport', t('indirectCosts.transport')],
          ['electricity', t('indirectCosts.electricity')],
          ['advertising', t('indirectCosts.advertising')],
          ['other', t('indirectCosts.other')],
        ] as const).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={state.monthly[key]}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onMonthlyChange(key, parseMoney(e.target.value))}
            />
          </div>
        ))}

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonth')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            value={state.unitsPerMonth}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUnitsChange(parseMoney(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{t('fields.unitCostShort')}: {formatMoney(perUnit, 'USD')}</div>
    </div>
  );
}
