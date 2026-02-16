import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useStationeryCalculator } from '@/app/store/calculator';

export function StationeryLaborCard({
  state,
  onChange,
}: {
  state: ReturnType<typeof useStationeryCalculator>['state']['labor'];
  onChange: (patch: Partial<typeof state>) => void;
}) {
  const { t } = useTranslation('calculator');
  const perUnit = state.enabled
    ? (() => {
        const costPerHour = state.hoursPerMonth > 0 ? state.salary / state.hoursPerMonth : 0;
        const totalMinutes = state.setupMinutes + state.runMinutesPerUnit * state.unitsPerBatch;
        return state.unitsPerBatch > 0 ? (costPerHour * (totalMinutes / 60)) / state.unitsPerBatch : 0;
      })()
    : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.labor')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.laborStationery')}</p>
        </div>
        <Switch checked={state.enabled} onCheckedChange={(v: boolean) => onChange({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          label={t('fields.monthlySalary')}
          value={state.salary}
          onChange={(v) => onChange({ salary: v })}
        />
        <Field
          label={t('fields.hoursPerMonth')}
          value={state.hoursPerMonth}
          onChange={(v) => onChange({ hoursPerMonth: v })}
        />
        <Field
          label={t('fields.setupMin')}
          value={state.setupMinutes}
          onChange={(v) => onChange({ setupMinutes: v })}
        />
        <Field
          label={t('fields.runPerUnitShort')}
          value={state.runMinutesPerUnit}
          onChange={(v) => onChange({ runMinutesPerUnit: v })}
        />
        <Field
          label={t('fields.unitsPerBatch')}
          value={state.unitsPerBatch}
          onChange={(v) => onChange({ unitsPerBatch: v })}
          min={1}
        />
      </div>

      <div className="text-sm text-muted-foreground">{t('fields.laborPerUnitColon')} {formatMoney(perUnit, 'USD')}</div>
    </div>
  );
}

function Field({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        min={min ?? 0}
        value={value}
        onChange={(e) => onChange(parseMoney(e.target.value))}
      />
    </div>
  );
}
