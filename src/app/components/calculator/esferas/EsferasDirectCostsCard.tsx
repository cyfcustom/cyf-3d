import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useMemo } from 'react';
import { useEsferasCalculator } from '@/app/hooks/useEsferasCalculator';

const productOptions = [
  { value: 'colores6', label: 'Esfera colores 6 cm' },
  { value: 'colores7', label: 'Esfera colores 7 cm' },
  { value: 'colores8', label: 'Esfera colores 8 cm' },
  { value: 'blanca8', label: 'Esfera blanca 8 cm' },
  { value: 'transparente8', label: 'Esfera transparente 8 cm' },
  { value: 'rellena8', label: 'Rellena (foto) 8 cm' },
  { value: 'rellena10', label: 'Rellena (foto) 10 cm' },
  { value: 'glitter8', label: 'Esfera glitter 8 cm' },
  { value: 'mate8', label: 'Esfera mate 8 cm' },
  { value: 'vidrio8', label: 'Esfera de vidrio 8 cm' },
];

type Props = {
  items: ReturnType<typeof useEsferasCalculator>['state']['direct'];
  productSelection: string;
  onProductChange: (value: string) => void;
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
};

export function EsferasDirectCostsCard({ items, productSelection, onProductChange, onChange }: Props) {
  const perItem = useMemo(() => {
    return items.map((item) => {
      const unit = item.quantity > 0 ? item.price / item.quantity : 0;
      return { id: item.id, unit };
    });
  }, [items]);

  const getUnit = (id: string) => perItem.find((p) => p.id === id)?.unit ?? 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Costos directos</h3>
          <p className="text-sm text-muted-foreground">Activa los insumos que uses y ajusta cantidad y precio del paquete.</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2 rounded-xl border border-border p-4 bg-muted/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Switch checked={item.enabled} onCheckedChange={(v) => onChange(item.id, { enabled: v })} />
                <span>{item.id === 'producto' ? 'Producto' : item.label}</span>
              </label>

              {item.id === 'producto' && (
                <select
                  value={productSelection}
                  onChange={(e) => onProductChange(e.target.value)}
                  className="w-full md:w-auto rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {productOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
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
                  min="0.0001"
                  step="1"
                  value={item.quantity}
                  onChange={(e) => onChange(item.id, { quantity: parseMoney(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Costo Ud.</span>
                <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
