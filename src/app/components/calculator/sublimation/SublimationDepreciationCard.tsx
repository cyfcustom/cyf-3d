import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSublimationCalculator } from '@/app/store/calculator';

type Props = {
  items: ReturnType<typeof useSublimationCalculator>['state']['depreciation'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; unitsPerMonth: number }>) => void;
  readOnly?: boolean;
};

export function SublimationDepreciationCard({ items, onChange, readOnly = false }: Props) {
  const { t } = useTranslation('calculator');
  const perItem = useMemo(() => {
    return items.map((it) => {
      const monthly = it.price / 24;
      const perUnit = it.unitsPerMonth > 0 ? monthly / it.unitsPerMonth : 0;
      return { id: it.id, perUnit };
    });
  }, [items]);

  const getUnit = (id: string) => perItem.find((p) => p.id === id)?.perUnit ?? 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('sections.depreciation24')}</h3>
        <p className="text-sm text-muted-foreground">{t('descriptions.depreciation24')}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            <label className="flex items-center gap-2 font-medium">
              <Switch
                checked={item.enabled}
                onCheckedChange={(v) => onChange(item.id, { enabled: v })}
                disabled={readOnly}
              />
              <span>{item.label}</span>
            </label>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.equipmentPriceDollar')}</span>
              <Input
                type="number"
                inputMode="decimal"
                step="0.01"
                value={item.price}
                onChange={(e) => onChange(item.id, { price: parseMoney(e.target.value) })}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonth')}</span>
              <Input
                type="number"
                inputMode="numeric"
                step="1"
                min="1"
                value={item.unitsPerMonth}
                onChange={(e) => onChange(item.id, { unitsPerMonth: parseMoney(e.target.value) || 1 })}
                disabled={readOnly}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.unitCostDepreciation')}</span>
              <div className="text-sm font-semibold">{formatMoney(getUnit(item.id), 'USD')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
