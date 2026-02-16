import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useLabelsCalculator } from '@/app/store/calculator';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const PRODUCT_OPTIONS: Array<ReturnType<typeof useLabelsCalculator>['state']['productType']> = [
  'printable_vinyl',
  'adhesive_photo_paper',
  'pvc_label',
  'bopp_label',
  'holographic',
  'transparent',
  'kraft',
  'other',
];

// PRODUCT_LABELS now come from i18n - see t() calls below

type Props = {
  items: ReturnType<typeof useLabelsCalculator>['state']['direct'];
  productType: ReturnType<typeof useLabelsCalculator>['state']['productType'];
  onChange: (id: string, patch: Partial<{ enabled: boolean; price: number; quantity: number }>) => void;
  onProductTypeChange: (type: ReturnType<typeof useLabelsCalculator>['state']['productType']) => void;
};

export function LabelsDirectCostsCard({ items, productType, onChange, onProductTypeChange }: Props) {
  const { t } = useTranslation('calculator');
  const PRODUCT_LABELS: Record<string, string> = {
    'printable_vinyl': t('labels.productTypes.printableVinyl'),
    'adhesive_photo_paper': t('labels.productTypes.adhesivePhoto'),
    'pvc_label': t('labels.productTypes.pvcLabel'),
    'bopp_label': t('labels.productTypes.boppLabel'),
    'holographic': t('labels.productTypes.holographic'),
    'transparent': t('labels.productTypes.transparent'),
    'kraft': t('labels.productTypes.kraft'),
    'other': t('labels.productTypes.other'),
  };
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
        <p className="text-sm text-muted-foreground">{t('descriptions.directCostsLabels')}</p>
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
                      {PRODUCT_LABELS[opt] || opt}
                    </option>
                  ))}
                </select>
              )}
            </div>

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

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">{t('fields.unitCostActive')}</span>
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
