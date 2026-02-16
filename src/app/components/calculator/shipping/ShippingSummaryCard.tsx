import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui/button';
import { formatMoney } from '@/app/lib/money';
import { useShippingCalculator } from '@/app/store/calculator';

type Props = {
  totals: ReturnType<typeof useShippingCalculator>['totals'];
  onReset: () => void;
};

export function ShippingSummaryCard({ totals, onReset }: Props) {
  const { t } = useTranslation('calculator');

  const copyBreakdown = () => {
    const lines = [
      `${t('summaryLabels.courier')}: ${formatMoney(totals.courier)}`,
      `${t('summaryLabels.extrasLabel')}: ${formatMoney(totals.extras)}`,
      `${t('summaryLabels.totalShipping')}: ${formatMoney(totals.total)}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{t('summaryModule.shipping')}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBreakdown}>{t('actions.copy')}</Button>
          <Button variant="destructive" onClick={onReset}>{t('actions.reset')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Info label={t('summaryLabels.courier')} value={formatMoney(totals.courier)} />
        <Info label={t('summaryLabels.extrasLabel')} value={formatMoney(totals.extras)} />
        <Info label={t('summaryLabels.total')} value={formatMoney(totals.total)} />
      </div>
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
