import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useLabelsCalculator } from '@/app/store/calculator';

export function LabelsGICard({
  state,
  onProfitChange,
  onTaxChange,
  onToggleProfit,
  onToggleTax,
  onQuantityChange,
}: {
  state: Pick<ReturnType<typeof useLabelsCalculator>['state'], 'profitPct' | 'taxPct' | 'applyProfit' | 'applyTax' | 'quantity'>;
  onProfitChange: (v: number) => void;
  onTaxChange: (v: number) => void;
  onToggleProfit: (v: boolean) => void;
  onToggleTax: (v: boolean) => void;
  onQuantityChange: (v: number) => void;
}) {
  const { t } = useTranslation('calculator');
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('fields.profitPct')}</span>
            <Switch checked={state.applyProfit} onCheckedChange={onToggleProfit} />
          </div>
          <Input
            type="number"
            inputMode="decimal"
            value={state.profitPct}
            onChange={(e) => onProfitChange(parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">{t('fields.taxPct')}</span>
            <Switch checked={state.applyTax} onCheckedChange={onToggleTax} />
          </div>
          <Input
            type="number"
            inputMode="decimal"
            value={state.taxPct}
            onChange={(e) => onTaxChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">{t('fields.quantityProductsVisual')}</span>
        <Input
          type="number"
          inputMode="decimal"
          min="1"
          value={state.quantity}
          onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
        <p className="text-xs text-muted-foreground">{t('descriptions.qtyMultiplier')}</p>
      </div>
    </div>
  );
}
