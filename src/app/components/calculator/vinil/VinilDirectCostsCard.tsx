import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useMemo } from 'react';
import { useVinilCalculator } from '@/app/hooks/useVinilCalculator';

type Props = {
  items: ReturnType<typeof useVinilCalculator>['state']['direct'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
};

export function VinilDirectCostsCard({ items, onChange }: Props) {
  const perItem = useMemo(() => {
    return items.map((item) => {
      const unit = item.quantity > 0 ? parseMoney(item.price) / item.quantity : 0;
      return { id: item.id, unit };
    });
  }, [items]);

  const getUnit = (id: string) => perItem.find((p) => p.id === id)?.unit ?? 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Costos directos</h3>
          <p className="text-sm text-muted-foreground">Activa los insumos que uses y define precio del paquete y cantidad.</p>
        </div>
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
                inputMode="numeric"
                step="1"
                min="1"
                value={item.quantity}
                onChange={(e) => onChange(item.id, { quantity: parseMoney(e.target.value) || 1 })}
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
