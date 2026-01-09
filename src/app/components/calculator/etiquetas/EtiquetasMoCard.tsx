import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEtiquetasCalculator } from '@/app/hooks/useEtiquetasCalculator';

export function EtiquetasMoCard({
  state,
  onChange,
}: {
  state: ReturnType<typeof useEtiquetasCalculator>['state']['mo'];
  onChange: (patch: Partial<typeof state>) => void;
}) {
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
          <h3 className="text-lg font-semibold">Mano de obra</h3>
          <p className="text-sm text-muted-foreground">Setup + corrida × lote, dividido entre unidades.</p>
        </div>
        <Switch checked={state.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Salario mensual" value={state.salary} onChange={(v) => onChange({ salary: v })} />
        <Field label="Horas al mes" value={state.hoursPerMonth} onChange={(v) => onChange({ hoursPerMonth: v })} />
        <Field label="Setup (min)" value={state.setupMinutes} onChange={(v) => onChange({ setupMinutes: v })} />
        <Field
          label="Ejecución (min/ud)"
          value={state.runMinutesPerUnit}
          onChange={(v) => onChange({ runMinutesPerUnit: v })}
        />
        <Field
          label="Unidades por lote"
          value={state.unitsPerBatch}
          onChange={(v) => onChange({ unitsPerBatch: v })}
          min={1}
        />
      </div>

      <div className="text-sm text-muted-foreground">MO por unidad: {formatMoney(perUnit, 'USD')}</div>
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
