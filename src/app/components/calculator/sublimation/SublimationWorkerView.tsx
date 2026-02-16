import { Input } from '@/app/components/ui/input';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useSublimationCalculator } from '@/app/store/calculator';
import { SaveCalculationButton } from '../shared/SaveCalculationButton';

export function SublimationWorkerView() {
  const { t } = useTranslation('calculator');
  const calculator = useSublimationCalculator();

  return (
    <div className="space-y-6" id="sublimation">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('worker.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('worker.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('descriptions.workerView')}</p>
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-semibold">{t('worker.calculatePrice')}</h3>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('fields.quantityProducts')}</label>
          <Input
            type="number"
            inputMode="numeric"
            step="1"
            min="1"
            value={calculator.state.quantity}
            onChange={(e) => calculator.setQuantity(parseMoney(e.target.value) || 1)}
            className="max-w-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-xl border border-border bg-muted/30">
            <span className="text-xs text-muted-foreground">{t('summaryLabels.pricePerUnitLong')}</span>
            <div className="text-2xl font-bold mt-1">
              {formatMoney(calculator.totals.perUnit.total, 'USD')}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
            <span className="text-xs text-muted-foreground">
              {t('summaryLabels.totalQty', { qty: calculator.totals.quantity })}
            </span>
            <div className="text-2xl font-bold text-primary mt-1">
              {formatMoney(calculator.totals.total, 'USD')}
            </div>
          </div>
        </div>

        <SaveCalculationButton
          moduleName="sublimacion"
          totals={calculator.totals}
          quantity={calculator.state.quantity}
        />
      </div>
    </div>
  );
}
