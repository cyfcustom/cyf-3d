import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useStationeryCalculator } from '@/app/store/calculator';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  items: ReturnType<typeof useStationeryCalculator>['state']['direct'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
};

export function StationeryDirectCostsCard({ items, onChange }: Props) {
  const { t } = useTranslation('calculator');
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
        <h3 className="text-lg font-semibold">{t('sections.directCosts')}</h3>
        <p className="text-sm text-muted-foreground">{t('descriptions.directCostsStationery')}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <label className="flex items-center gap-2 font-medium">
              <Switch checked={item.enabled} onCheckedChange={(v: boolean) => onChange(item.id, { enabled: v })} />
              <span>{item.label}</span>
            </label>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.packagePriceDollar')}</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(item.id, { price: parseMoney(e.target.value) })}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.unitsInPackage')}</span>
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
              <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
              <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
