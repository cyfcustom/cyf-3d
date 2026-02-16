import { useShippingCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';
import { ShippingCourierCard } from './ShippingCourierCard';
import { ShippingExtrasCard } from './ShippingExtrasCard';
import { ShippingSummaryCard } from './ShippingSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function ShippingModule() {
  const { t } = useTranslation('calculator');
  const calc = useShippingCalculator();
  useSummaryReporter('shipping', calc.totals.total);

  return (
    <div className="space-y-6" id="shipping">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.shipping.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.shipping.name')}</h2>
        <p className="text-sm text-muted-foreground">{t('modules.shipping.longDescription')}</p>
      </div>

      <ShippingCourierCard state={calc.state} onChange={calc.setField} />
      <ShippingExtrasCard state={calc.state} courier={calc.totals.courier} onChange={calc.setField} />
      <ShippingSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
