import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

type FieldKey = keyof ReturnType<typeof useSpheresCalculator>['state']['indirect']['monthly'];

type Props = {
  state: ReturnType<typeof useSpheresCalculator>['state']['indirect'];
  perUnit: number;
  onToggle: (value: boolean) => void;
  onMonthlyChange: (key: FieldKey, value: number) => void;
  onUnitsChange: (value: number) => void;
};

export function SpheresIndirectCard({ state, perUnit, onToggle, onMonthlyChange, onUnitsChange }: Props) {
  const { t } = useTranslation('calculator');

  const fields: Array<{ key: FieldKey; labelKey: string }> = [
    { key: 'rent', labelKey: 'indirectCosts.rentMonthly' },
    { key: 'internet', labelKey: 'indirectCosts.internetMonthly' },
    { key: 'subscriptions', labelKey: 'indirectCosts.subscriptionsMonthly' },
    { key: 'transport', labelKey: 'indirectCosts.transportMonthly' },
    { key: 'electricity', labelKey: 'indirectCosts.electricityMonthly' },
    { key: 'advertising', labelKey: 'indirectCosts.advertisingMonthly' },
    { key: 'other', labelKey: 'indirectCosts.otherMonthly' },
  ];

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.indirectCosts')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.indirectCostsSpheres')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('fields.activate')}</span>
          <Switch checked={state.enabled} onCheckedChange={onToggle} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <span className="text-xs text-muted-foreground">{t(field.labelKey)}</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={state.monthly[field.key]}
              onChange={(e) => onMonthlyChange(field.key, parseMoney(e.target.value))}
            />
          </div>
        ))}
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonthFull')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={state.unitsPerMonth}
            onChange={(e) => onUnitsChange(parseMoney(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="p-3 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-between">
        <span className="text-sm font-medium">{t('fields.unitCostIndirect')}</span>
        <span className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</span>
      </div>
    </div>
  );
}
