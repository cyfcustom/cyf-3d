import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useStationeryCalculator } from '@/app/store/calculator';

function DepRow({
  item,
  onChange,
}: {
  item: ReturnType<typeof useStationeryCalculator>['state']['depreciation'][number];
  onChange: (patch: Partial<typeof item>) => void;
}) {
  const { t } = useTranslation('calculator');
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
        <span className="text-xs text-muted-foreground">{t('fields.equipmentPriceDollar')}</span>
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
          <span className="text-xs text-muted-foreground">{t('fields.usefulLifeUses')}</span>
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
          <span className="text-xs text-muted-foreground">{t('fields.unitsPerMonthFull')}</span>
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
          <span className="text-xs text-muted-foreground">{t('fields.costPerMonth')}</span>
          <div className="text-sm font-semibold">{formatMoney(item.price / 24, 'USD')}</div>
        </div>
      ) : (
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.costPerUse')}</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      )}

      <div className="space-y-1">
        <span className="text-xs text-muted-foreground">{t('fields.unitCostShort')}</span>
        <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
      </div>
    </div>
  );
}

export function StationeryDepreciationCard({
  items,
  onChange,
}: {
  items: ReturnType<typeof useStationeryCalculator>['state']['depreciation'];
  onChange: (
    id: string,
    patch: Partial<ReturnType<typeof useStationeryCalculator>['state']['depreciation'][number]>
  ) => void;
}) {
  const { t } = useTranslation('calculator');
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('sections.depreciationEquipment')}</h3>
        <p className="text-sm text-muted-foreground">{t('descriptions.depreciationStationery')}</p>
      </div>

      <div className="space-y-4">
        {items.map((item: typeof items[number]) => (
          <DepRow key={item.id} item={item} onChange={(patch) => onChange(item.id, patch)} />
        ))}
      </div>
    </div>
  );
}
