import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { usePapeleriaCalculator } from '@/app/hooks/usePapeleriaCalculator';

function DepRow({
  item,
  onChange,
}: {
  item: ReturnType<typeof usePapeleriaCalculator>['state']['depreciation'][number];
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
        <Switch checked={item.enabled} onCheckedChange={(v: boolean) => onChange({ enabled: v })} />
        <span>{item.label}</span>
      </label>

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">Precio del equipo ($)</span>
        <Input
          type="number"
          inputMode="decimal"
          step="0.01"
          value={item.price}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ price: parseMoney(e.target.value) })}
        />
      </div>

      {item.mode === 'life' ? (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Vida útil (usos)</span>
          <Input
            type="number"
            inputMode="decimal"
            min="1"
            value={item.lifeUnits}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ lifeUnits: parseMoney(e.target.value) || 1 })}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ unitsPerMonth: parseMoney(e.target.value) || 1 })}
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

export function PapeleriaDepreciationCard({
  items,
  onChange,
}: {
  items: ReturnType<typeof usePapeleriaCalculator>['state']['depreciation'];
  onChange: (
    id: string,
    patch: Partial<ReturnType<typeof usePapeleriaCalculator>['state']['depreciation'][number]>
  ) => void;
}) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Depreciación de equipos</h3>
        <p className="text-sm text-muted-foreground">Base 24 meses. Cuchilla/tapete se prorratean por vida útil.</p>
      </div>

      <div className="space-y-4">
        {items.map((item: typeof items[number]) => (
          <DepRow key={item.id} item={item} onChange={(patch) => onChange(item.id, patch)} />
        ))}
      </div>
    </div>
  );
}
