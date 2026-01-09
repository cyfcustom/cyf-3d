import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEtiquetasCalculator } from '@/app/hooks/useEtiquetasCalculator';

export function EtiquetasIndirectCard({
  state,
  onToggle,
  onMonthlyChange,
  onUnitsChange,
}: {
  state: ReturnType<typeof useEtiquetasCalculator>['state']['indirect'];
  onToggle: (enabled: boolean) => void;
  onMonthlyChange: (key: keyof typeof state.monthly, value: number) => void;
  onUnitsChange: (value: number) => void;
}) {
  const monthlyTotal =
    state.monthly.alquiler +
    state.monthly.internet +
    state.monthly.suscripciones +
    state.monthly.transporte +
    state.monthly.electricidad +
    state.monthly.publicidad +
    state.monthly.otros;
  const perUnit = state.enabled ? monthlyTotal / Math.max(1, state.unitsPerMonth) : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Costos indirectos</h3>
          <p className="text-sm text-muted-foreground">Suma mensual / unidades al mes.</p>
        </div>
        <Switch checked={state.enabled} onCheckedChange={onToggle} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {([
          ['alquiler', 'Alquiler'],
          ['internet', 'Internet'],
          ['suscripciones', 'Suscripciones'],
          ['transporte', 'Transporte'],
          ['electricidad', 'Electricidad'],
          ['publicidad', 'Publicidad'],
          ['otros', 'Otros'],
        ] as const).map(([key, label]) => (
          <div key={key} className="space-y-1">
            <span className="text-xs text-muted-foreground">{label}</span>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={state.monthly[key]}
              onChange={(e) => onMonthlyChange(key, parseMoney(e.target.value))}
            />
          </div>
        ))}

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Unidades/mes</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            value={state.unitsPerMonth}
            onChange={(e) => onUnitsChange(parseMoney(e.target.value) || 1)}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">Costo Ud.: {formatMoney(perUnit, 'USD')}</div>
    </div>
  );
}
