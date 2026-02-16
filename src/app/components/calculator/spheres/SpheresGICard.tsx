import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { useSpheresCalculator } from '@/app/store/calculator';
import { parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';

type Props = {
  state: Pick<ReturnType<typeof useSpheresCalculator>['state'], 'profitPct' | 'taxPct' | 'applyProfit' | 'applyTax' | 'profitMode' | 'quantity' | 'quantityEnabled'>;
  onProfitChange: (value: number) => void;
  onTaxChange: (value: number) => void;
  onToggleProfit: (value: boolean) => void;
  onToggleTax: (value: boolean) => void;
  onModeChange: (mode: 'markup' | 'margin') => void;
  onQuantityChange: (value: number) => void;
  onQuantityToggle: (value: boolean) => void;
};

export function SpheresGICard({ state, onProfitChange, onTaxChange, onToggleProfit, onToggleTax, onModeChange, onQuantityChange, onQuantityToggle }: Props) {
  const { t } = useTranslation('calculator');

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">{t('sections.profitTaxesQty')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyProfit} onCheckedChange={onToggleProfit} />
            <span>{t('fields.applyProfit')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.profitPct}
            onChange={(e) => onProfitChange(parseMoney(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyTax} onCheckedChange={onToggleTax} />
            <span>{t('fields.applyTaxes')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.taxPct}
            onChange={(e) => onTaxChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t('fields.profitMode')}</label>
          <select
            value={state.profitMode}
            onChange={(e) => onModeChange(e.target.value === 'markup' ? 'markup' : 'margin')}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="markup">{t('custom.markup')}</option>
            <option value="margin">{t('custom.margin')}</option>
          </select>
          <p className="text-xs text-muted-foreground">{state.profitMode === 'markup' ? t('descriptions.profitMarkup') : t('descriptions.profitMargin')}</p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.quantityEnabled} onCheckedChange={onQuantityToggle} />
            <span>{t('fields.multiplyTotalsByQty')}</span>
          </label>
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            disabled={!state.quantityEnabled}
            value={state.quantity}
            onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">{t('descriptions.qtyMultiplierLegacy')}</p>
        </div>
      </div>
    </div>
  );
}
