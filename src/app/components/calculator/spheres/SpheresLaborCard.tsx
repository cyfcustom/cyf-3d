import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

type Props = {
  state: ReturnType<typeof useSpheresCalculator>['state']['labor'];
  perUnit: number;
  onChange: (patch: Partial<ReturnType<typeof useSpheresCalculator>['state']['labor']>) => void;
};

export function SpheresLaborCard({ state, perUnit, onChange }: Props) {
  const { t } = useTranslation('calculator');

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.labor')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.laborSpheres')}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{t('fields.activate')}</span>
          <Switch checked={state.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.monthlySalaryDollar')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={state.salary}
            onChange={(e) => onChange({ salary: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.hoursPerMonth')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={state.hoursPerMonth}
            onChange={(e) => onChange({ hoursPerMonth: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.setupMin')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={state.setupMinutes}
            onChange={(e) => onChange({ setupMinutes: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.runPerUnitShort')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={state.runMinutesPerUnit}
            onChange={(e) => onChange({ runMinutesPerUnit: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.unitsInBatch')}</span>
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={state.unitsPerBatch}
            onChange={(e) => onChange({ unitsPerBatch: parseMoney(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="p-3 rounded-xl border border-dashed border-border bg-muted/20 flex items-center justify-between">
        <span className="text-sm font-medium">{t('fields.unitCostLabor')}</span>
        <span className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</span>
      </div>
    </div>
  );
}
