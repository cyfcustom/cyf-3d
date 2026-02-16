import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useMemo } from 'react';
import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

type Props = {
  items: ReturnType<typeof useSpheresCalculator>['state']['depreciation'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; unitsPerMonth?: number; lifeUnits?: number }>) => void;
};

export function SpheresDepreciationCard({ items, onChange }: Props) {
  const { t } = useTranslation('calculator');

  const computed = useMemo(() => {
    return items.map((item) => {
      if (item.mode === 'life') {
        const life = Math.max(1, item.lifeUnits ?? 0);
        return { id: item.id, perMonth: 0, perUnit: item.price / life };
      }
      const units = Math.max(1, item.unitsPerMonth ?? 0);
      const perMonth = item.price / 24;
      return { id: item.id, perMonth, perUnit: perMonth / units };
    });
  }, [items]);

  const get = (id: string) => computed.find((c) => c.id === id) ?? { perMonth: 0, perUnit: 0 };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.depreciationEquipment')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.depreciationSpheres')}</p>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const vals = get(item.id);
          const isLife = item.mode === 'life';
          return (
            <div key={item.id} className="rounded-xl border border-border p-4 bg-muted/30 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 font-medium">
                  <Switch checked={item.enabled} onCheckedChange={(v) => onChange(item.id, { enabled: v })} />
                  <span>{item.label}</span>
                </label>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{isLife ? t('fields.lifeInUses') : t('fields.monthlyCost')}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.priceDollar')}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => onChange(item.id, { price: parseMoney(e.target.value) })}
                  />
                </div>

                {isLife ? (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t('fields.usefulLifeUses')}</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={item.lifeUnits ?? 0}
                      onChange={(e) => onChange(item.id, { lifeUnits: parseMoney(e.target.value) || 0 })}
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonthFull')}</span>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min="1"
                      step="1"
                      value={item.unitsPerMonth ?? 0}
                      onChange={(e) => onChange(item.id, { unitsPerMonth: parseMoney(e.target.value) || 0 })}
                    />
                  </div>
                )}

                {!isLife && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">{t('fields.costPerMonth')}</span>
                    <div className="text-sm font-semibold">{formatMoney(vals.perMonth, 'USD')}</div>
                  </div>
                )}

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
                  <div className="text-sm font-semibold">{formatMoney(vals.perUnit, 'USD')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
