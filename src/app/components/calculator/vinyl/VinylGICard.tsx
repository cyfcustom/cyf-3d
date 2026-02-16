import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';

type Props = {
  profitPct: number;
  taxPct: number;
  applyProfit: boolean;
  applyTax: boolean;
  quantity: number;
  onProfitChange: (value: number) => void;
  onTaxChange: (value: number) => void;
  onToggleProfit: (value: boolean) => void;
  onToggleTax: (value: boolean) => void;
  onQuantityChange: (value: number) => void;
};

export function VinylGICard({
  profitPct,
  taxPct,
  applyProfit,
  applyTax,
  quantity,
  onProfitChange,
  onTaxChange,
  onToggleProfit,
  onToggleTax,
  onQuantityChange,
}: Props) {
  const { t } = useTranslation('calculator');
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('sections.profitTaxes')}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={applyProfit} onCheckedChange={onToggleProfit} />
            <span>{t('fields.applyProfit')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={profitPct}
            onChange={(e) => onProfitChange(parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={applyTax} onCheckedChange={onToggleTax} />
            <span>{t('fields.applyTaxes')}</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={taxPct}
            onChange={(e) => onTaxChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t('fields.quantityProductsMultiply')}</label>
        <Input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}
