import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEmpaquesCalculator } from '@/app/hooks/useEmpaquesCalculator';

export function EmpaquesDepreciationCard({
  item,
  onChange,
}: {
  item: ReturnType<typeof useEmpaquesCalculator>['state']['depreciation'][number];
  onChange: (patch: Partial<typeof item>) => void;
}) {
  const perMonth = item.price / 24;
  const perUnit = perMonth / Math.max(1, item.unitsPerMonth);

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Depreciación</h3>
          <p className="text-sm text-muted-foreground">Impresora de etiquetas prorrateada a 24 meses / 100 uds.</p>
        </div>
        <Switch checked={item.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Precio del equipo ($)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={item.price}
            onChange={(e) => onChange({ price: parseMoney(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Costo x mes</span>
          <div className="text-sm font-semibold">{formatMoney(perMonth, 'USD')}</div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Costo Ud. (asume 100 uds/mes)</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      </div>
    </div>
  );
}
