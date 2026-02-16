import { useTranslation } from 'react-i18next';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useShippingCalculator } from '@/app/store/calculator';

type Props = {
  state: ReturnType<typeof useShippingCalculator>['state'];
  onChange: (key: keyof ReturnType<typeof useShippingCalculator>['state'], value: any) => void;
};

export function ShippingCourierCard({ state, onChange }: Props) {
  const { t } = useTranslation('calculator');
  const courier = state.courier;
  const courierTotal = courier.enabled
    ? courier.baseRate + courier.km * courier.kmRate + courier.kg * courier.kgRate
    : 0;

  const TYPES: Array<{ value: typeof courier.type; label: string }> = [
    { value: 'local_motorcycle', label: t('shipping.types.localMotorcycle') },
    { value: 'urban_courier', label: t('shipping.types.urbanCourier') },
    { value: 'national_shipping', label: t('shipping.types.nationalShipping') },
    { value: 'international', label: t('shipping.types.international') },
    { value: 'other', label: t('shipping.types.other') },
  ];

  const updateCourier = (patch: Partial<typeof courier>) => {
    onChange('courier', { ...courier, ...patch });
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.courierFreight')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.courierFreight')}</p>
        </div>
        <Switch
          checked={courier.enabled}
          onCheckedChange={(v) => updateCourier({ enabled: v })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('shipping.type')}</span>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={courier.type}
            onChange={(e) => updateCourier({ type: e.target.value as typeof courier.type })}
          >
            {TYPES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('shipping.distanceKm')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={courier.km}
            onChange={(e) => updateCourier({ km: parseMoney(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.baseRate')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={courier.baseRate}
            onChange={(e) => updateCourier({ baseRate: parseMoney(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('shipping.ratePerKm')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={courier.kmRate}
            onChange={(e) => updateCourier({ kmRate: parseMoney(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('shipping.weightKg')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={courier.kg}
            onChange={(e) => updateCourier({ kg: parseMoney(e.target.value) })}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('shipping.ratePerKg')}</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={courier.kgRate}
            onChange={(e) => updateCourier({ kgRate: parseMoney(e.target.value) })}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">{t('summaryLabels.totalCourier')} {formatMoney(courierTotal, 'USD')}</div>
    </div>
  );
}
