import { useTranslation } from 'react-i18next';
import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useShippingCalculator } from '@/app/store/calculator';

type Props = {
  state: ReturnType<typeof useShippingCalculator>['state'];
  courier: number;
  onChange: (key: keyof ReturnType<typeof useShippingCalculator>['state'], value: any) => void;
};

export function ShippingExtrasCard({ state, courier, onChange }: Props) {
  const { t } = useTranslation('calculator');
  const extras = state.extras;

  const extrasBase =
    (extras.packaging.enabled ? extras.packaging.cost : 0) +
    (extras.fragile.enabled ? extras.fragile.cost : 0) +
    extras.other;
  const insuranceVal = extras.insurance.enabled ? (courier + extrasBase) * (extras.insurance.percentage / 100) : 0;
  const extrasTotal = extrasBase + insuranceVal;

  const updateExtras = (patch: Partial<typeof extras>) => {
    onChange('extras', { ...extras, ...patch });
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{t('sections.extras')}</h3>
        <p className="text-sm text-muted-foreground">{t('descriptions.extras')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToggleField
          label={t('shipping.extraPackaging')}
          enabled={extras.packaging.enabled}
          onEnabledChange={(v) => updateExtras({ packaging: { ...extras.packaging, enabled: v } })}
          value={extras.packaging.cost}
          onValueChange={(v) => updateExtras({ packaging: { ...extras.packaging, cost: v } })}
        />
        <ToggleField
          label={t('shipping.fragileHandling')}
          enabled={extras.fragile.enabled}
          onEnabledChange={(v) => updateExtras({ fragile: { ...extras.fragile, enabled: v } })}
          value={extras.fragile.cost}
          onValueChange={(v) => updateExtras({ fragile: { ...extras.fragile, cost: v } })}
        />
        <ToggleField
          label={t('shipping.insurancePct')}
          enabled={extras.insurance.enabled}
          onEnabledChange={(v) => updateExtras({ insurance: { ...extras.insurance, enabled: v } })}
          value={extras.insurance.percentage}
          onValueChange={(v) => updateExtras({ insurance: { ...extras.insurance, percentage: v } })}
          percent
        />
        <Field
          label={t('shipping.otherAmount')}
          value={extras.other}
          onChange={(v) => updateExtras({ other: v })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Info label={t('summaryLabels.extrasBase')} value={formatMoney(extrasBase, 'USD')} />
        <Info label={t('summaryLabels.insurance')} value={formatMoney(insuranceVal, 'USD')} />
        <Info label={t('summaryLabels.totalExtras')} value={formatMoney(extrasTotal, 'USD')} />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  percent,
}: {
  label: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: number;
  onValueChange: (v: number) => void;
  percent?: boolean;
}) {
  return (
    <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step={percent ? '0.1' : '0.01'}
        value={value}
        onChange={(e) => onValueChange(parseMoney(e.target.value))}
      />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseMoney(e.target.value))}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
