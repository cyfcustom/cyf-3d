import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEtiquetasCalculator } from '@/app/hooks/useEtiquetasCalculator';

function DepRow({
  item,
  onChange,
}: {
  item: ReturnType<typeof useEtiquetasCalculator>['state']['depreciation'][number];
  onChange: (patch: Partial<typeof item>) => void;
}) {
  const perUnit = (() => {
    if (item.mode === 'life') {
      return item.lifeUnits > 0 ? item.price / item.lifeUnits : 0;
    }
    const perMonth = item.price / 24;
    return perMonth / Math.max(1, item.unitsPerMonth);
  })();

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
      <label className="flex items-center gap-2 font-medium">
        <Switch checked={item.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
        <span>{item.label}</span>
      </label>

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

      {item.mode === 'life' ? (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Vida útil (cortes)</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            value={item.lifeUnits}
            onChange={(e) => onChange({ lifeUnits: parseMoney(e.target.value) || 1 })}
          />
        </div>
      ) : (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Unidades al mes</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            value={item.unitsPerMonth}
            onChange={(e) => onChange({ unitsPerMonth: parseMoney(e.target.value) || 1 })}
          />
        </div>
      )}

      {item.mode === 'month' ? (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Costo x mes</span>
          <div className="text-sm font-semibold">{formatMoney(item.price / 24, 'USD')}</div>
        </div>
      ) : (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Costo x uso</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      )}

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Costo Ud.</span>
        <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
      </div>
    </div>
  );
}

export function EtiquetasDepreciationCard({
  items,
  onChange,
}: {
  items: ReturnType<typeof useEtiquetasCalculator>['state']['depreciation'];
  onChange: (
    id: string,
    patch: Partial<ReturnType<typeof useEtiquetasCalculator>['state']['depreciation'][number]>
  ) => void;
}) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Depreciación</h3>
        <p className="text-sm text-muted-foreground">Plotter e impresora prorrateados 24 meses. Cuchilla por vida útil.</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <DepRow key={item.id} item={item} onChange={(patch) => onChange(item.id, patch)} />
        ))}
      </div>
    </div>
  );
}
