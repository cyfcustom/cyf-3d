import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { usePackagingCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

export function PackagingDepreciationCard({
  item,
  onChange,
}: {
  item: ReturnType<typeof usePackagingCalculator>['state']['depreciation'][number];
  onChange: (patch: Partial<typeof item>) => void;
}) {
  const { t } = useTranslation('calculator');
  const perMonth = item.price / 24;
  const perUnit = perMonth / Math.max(1, item.unitsPerMonth);

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.depreciation')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.depreciationPackaging')}</p>
        </div>
        <Switch checked={item.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.equipmentPriceDollar')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={item.price}
            onChange={(e) => onChange({ price: parseMoney(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.costPerMonth')}</span>
          <div className="text-sm font-semibold">{formatMoney(perMonth, 'USD')}</div>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.unitCostAssumed')}</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      </div>
    </div>
  );
}
