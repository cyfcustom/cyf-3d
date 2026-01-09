import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEtiquetasCalculator } from '@/app/hooks/useEtiquetasCalculator';
import { useMemo } from 'react';

const PRODUCT_OPTIONS: Array<ReturnType<typeof useEtiquetasCalculator>['state']['productType']> = [
  'Vinil imprimible',
  'Papel fotográfico adhesivo',
  'Etiqueta PVC',
  'Etiqueta BOPP',
  'Holográfico',
  'Transparente',
  'Kraft',
  'Otros',
];

type Props = {
  items: ReturnType<typeof useEtiquetasCalculator>['state']['direct'];
  productType: ReturnType<typeof useEtiquetasCalculator>['state']['productType'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
  onProductTypeChange: (type: ReturnType<typeof useEtiquetasCalculator>['state']['productType']) => void;
};

export function EtiquetasDirectCostsCard({ items, productType, onChange, onProductTypeChange }: Props) {
  const perUnit = useMemo(
    () =>
      items.map((it: Props['items'][number]) => ({
        id: it.id,
        value: it.quantity > 0 ? it.price / it.quantity : 0,
      })),
    [items]
  );

  const getUnit = (id: string) => perUnit.find((p: { id: string; value: number }) => p.id === id)?.value ?? 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Costos directos</h3>
        <p className="text-sm text-muted-foreground">Selecciona el sustrato y prorratea por unidades.</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            <div className="space-y-1">
              <label className="flex items-center gap-2 font-medium">
                <Switch checked={item.enabled} onCheckedChange={(v: boolean) => onChange(item.id, { enabled: v })} />
                <span>{item.label}</span>
              </label>
              {item.id === 'producto' && (
                <select
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={productType}
                  onChange={(e) => onProductTypeChange(e.target.value as typeof productType)}
                >
                  {PRODUCT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Precio del paquete ($)</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(item.id, { price: parseMoney(e.target.value) })}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(item.id, { quantity: parseMoney(e.target.value) })}
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Costo Ud.</span>
              <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Costo Ud. activo</span>
              <div className="text-sm font-semibold">
                {item.enabled ? formatMoney(getUnit(item.id), 'USD') : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
