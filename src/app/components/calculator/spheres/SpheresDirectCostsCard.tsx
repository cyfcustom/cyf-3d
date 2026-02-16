import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useMemo } from 'react';
import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

const productOptionKeys = [
  { value: 'colores6', labelKey: 'spheres.products.colores6' },
  { value: 'colores7', labelKey: 'spheres.products.colores7' },
  { value: 'colores8', labelKey: 'spheres.products.colores8' },
  { value: 'blanca8', labelKey: 'spheres.products.blanca8' },
  { value: 'transparente8', labelKey: 'spheres.products.transparente8' },
  { value: 'rellena8', labelKey: 'spheres.products.rellena8' },
  { value: 'rellena10', labelKey: 'spheres.products.rellena10' },
  { value: 'glitter8', labelKey: 'spheres.products.glitter8' },
  { value: 'mate8', labelKey: 'spheres.products.mate8' },
  { value: 'vidrio8', labelKey: 'spheres.products.vidrio8' },
];

type Props = {
  items: ReturnType<typeof useSpheresCalculator>['state']['direct'];
  productSelection: string;
  onProductChange: (value: string) => void;
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
};

export function SpheresDirectCostsCard({ items, productSelection, onProductChange, onChange }: Props) {
  const { t } = useTranslation('calculator');

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
          <h3 className="text-lg font-semibold">{t('sections.directCosts')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.directCostsSpheres')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="space-y-2 rounded-xl border border-border p-4 bg-muted/30">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="flex items-center gap-2 font-medium">
                <Switch checked={item.enabled} onCheckedChange={(v) => onChange(item.id, { enabled: v })} />
                <span>{item.id === 'producto' ? t('fields.product') : item.label}</span>
              </label>

              {item.id === 'producto' && (
                <select
                  value={productSelection}
                  onChange={(e) => onProductChange(e.target.value)}
                  className="w-full md:w-auto rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {productOptionKeys.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('fields.packagePriceDollar')}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => onChange(item.id, { price: parseMoney(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">{t('fields.unitsInPackage')}</span>
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
                <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
                <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
