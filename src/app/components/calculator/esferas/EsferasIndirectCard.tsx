import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEsferasCalculator } from '@/app/hooks/useEsferasCalculator';

const fields: Array<{ key: keyof ReturnType<typeof useEsferasCalculator>['state']['indirect']['monthly']; label: string }> = [
  { key: 'alquiler', label: 'Alquiler (mensual)' },
  { key: 'internet', label: 'Internet (mensual)' },
  { key: 'suscripciones', label: 'Suscripciones (mensual)' },
  { key: 'transporte', label: 'Transporte (mensual)' },
  { key: 'electricidad', label: 'Electricidad (mensual)' },
  { key: 'publicidad', label: 'Publicidad (mensual)' },
  { key: 'otros', label: 'Otros (mensual)' },
];

type Props = {
  state: ReturnType<typeof useEsferasCalculator>['state']['indirect'];
  perUnit: number;
  onToggle: (value: boolean) => void;
  onMonthlyChange: (key: keyof ReturnType<typeof useEsferasCalculator>['state']['indirect']['monthly'], value: number) => void;
  onUnitsChange: (value: number) => void;
};

export function EsferasIndirectCard({ state, perUnit, onToggle, onMonthlyChange, onUnitsChange }: Props) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Costos indirectos</h3>
          <p className="text-sm text-muted-foreground">Prorratea gastos mensuales entre las unidades producidas al mes.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Activar</span>
          <Switch checked={state.enabled} onCheckedChange={onToggle} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div key={field.key} className="space-y-1">
            <span className="text-xs text-muted-foreground">{field.label}</span>
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
          <span className="text-xs text-muted-foreground">Unidades al mes</span>
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
        <span className="text-sm font-medium">Costo Ud. (indirectos)</span>
        <span className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</span>
      </div>
    </div>
  );
}
