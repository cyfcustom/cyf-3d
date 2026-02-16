import { Input } from '@/app/components/ui/input';
import { Slider } from '@/app/components/ui/slider';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';

type Props = {
  extrasPerUnit: number;
  wastePct: number;
  onExtrasChange: (value: number) => void;
  onWasteChange: (value: number) => void;
};

export function VinylExtrasCard({ extrasPerUnit, wastePct, onExtrasChange, onWasteChange }: Props) {
  const { t } = useTranslation('calculator');
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">{t('sections.extrasAndWaste')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.extrasPerUnit')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={extrasPerUnit}
            onChange={(e) => onExtrasChange(parseMoney(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">{t('descriptions.extrasVinyl')}</p>
          <div className="text-sm font-semibold">{formatMoney(extrasPerUnit, 'USD')} {t('fields.perUnit')}</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('fields.wastePct')}</span>
            <span className="text-sm font-semibold">{wastePct.toFixed(0)}%</span>
          </div>
          <Slider
            value={[wastePct]}
            min={0}
            max={30}
            step={1}
            onValueChange={(v) => onWasteChange(v[0] ?? 0)}
          />
          <p className="text-xs text-muted-foreground">{t('descriptions.wasteVinyl')}</p>
        </div>
      </div>
    </div>
  );
}
