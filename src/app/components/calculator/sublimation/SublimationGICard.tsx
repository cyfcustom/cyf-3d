import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useSublimationCalculator } from '@/app/store/calculator';

type Props = {
  state: Pick<ReturnType<typeof useSublimationCalculator>['state'], 'profitPct' | 'taxPct' | 'applyProfit' | 'applyTax' | 'quantity'>;
  onProfitChange: (value: number) => void;
  onTaxChange: (value: number) => void;
  onToggleProfit: (value: boolean) => void;
  onToggleTax: (value: boolean) => void;
  onQuantityChange: (value: number) => void;
  readOnly?: boolean;
};

export function SublimationGICard({ state, onProfitChange, onTaxChange, onToggleProfit, onToggleTax, onQuantityChange, readOnly = false }: Props) {
  const { t } = useTranslation('calculator');
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">{t('sections.profitTaxesQty')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyProfit} onCheckedChange={onToggleProfit} disabled={readOnly} />
            <span>{t('fields.applyProfit')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.profitPct}
            onChange={(e) => onProfitChange(parseMoney(e.target.value))}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyTax} onCheckedChange={onToggleTax} disabled={readOnly} />
            <span>{t('fields.applyTaxes')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.taxPct}
            onChange={(e) => onTaxChange(parseMoney(e.target.value))}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('fields.quantityProducts')}</label>
        <Input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          value={state.quantity}
          onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}
