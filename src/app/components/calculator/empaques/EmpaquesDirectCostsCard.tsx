import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEmpaquesCalculator } from '@/app/hooks/useEmpaquesCalculator';
import { useMemo } from 'react';

type Props = {
  items: ReturnType<typeof useEmpaquesCalculator>['state']['direct'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
};

export function EmpaquesDirectCostsCard({ items, onChange }: Props) {
  const perUnit = useMemo(
    () =>
      items.map((it) => ({
        id: it.id,
        value: it.quantity > 0 ? it.price / it.quantity : 0,
      })),
    [items]
  );

  const getUnit = (id: string) => perUnit.find((p) => p.id === id)?.value ?? 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Costos directos</h3>
        <p className="text-sm text-muted-foreground">Cajas, bolsas, relleno, etiquetas y cinta prorrateados por unidad.</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <label className="flex items-center gap-2 font-medium">
              <Switch checked={item.enabled} onCheckedChange={(v) => onChange(item.id, { enabled: v })} />
              <span>{item.label}</span>
            </label>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Precio del paquete ($)</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.price}
                onChange={(e) => onChange(item.id, { price: parseMoney(e.target.value) })}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Unidades en el paquete</span>
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="1"
                value={item.quantity}
                onChange={(e) => onChange(item.id, { quantity: parseMoney(e.target.value) })}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Costo Ud.</span>
              <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
