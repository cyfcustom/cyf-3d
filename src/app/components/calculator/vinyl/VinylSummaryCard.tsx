import { Button } from '@/app/components/ui/button';
import { formatMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useVinylCalculator } from '@/app/store/calculator';

type Props = {
  totals: ReturnType<typeof useVinylCalculator>['totals'];
  onReset: () => void;
};

export function VinylSummaryCard({ totals, onReset }: Props) {
  const { t } = useTranslation('calculator');
  const copyBreakdown = () => {
    const lines = [
      `${t('summaryLabels.directPerUnit')}: ${formatMoney(totals.perUnit.direct)}`,
      `${t('summaryLabels.depreciationPerUnit')}: ${formatMoney(totals.perUnit.depreciation)}`,
      `${t('summaryLabels.extrasPerUnit')}: ${formatMoney(totals.perUnit.indirect)}`,
      `${t('summaryLabels.wasteApplied')}: ${(totals.perUnit.subtotal / Math.max(totals.perUnit.subtotalBeforeProfitAndTax, 0.0001) - 1).toFixed(2)}x`,
      `${t('summaryLabels.subtotalNoGITotal')}: ${formatMoney(totals.subtotalBeforeProfitAndTax)}`,
      `${t('summaryLabels.profitTotal')}: ${formatMoney(totals.perUnit.profit * totals.quantity)}`,
      `${t('summaryLabels.taxTotal')}: ${formatMoney(totals.perUnit.tax * totals.quantity)}`,
      `${t('summaryLabels.total')}: ${formatMoney(totals.total)}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{t('summaryModule.vinyl')}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBreakdown}>{t('actions.copy')}</Button>
          <Button variant="destructive" onClick={onReset}>{t('actions.reset')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Info label={t('summaryLabels.directPerUnit')} value={formatMoney(totals.perUnit.direct)} />
        <Info label={t('summaryLabels.depreciationPerUnit')} value={formatMoney(totals.perUnit.depreciation)} />
        <Info label={t('summaryLabels.extrasPerUnit')} value={formatMoney(totals.perUnit.indirect)} />
        <Info label={t('summaryLabels.subtotalNoGI')} value={formatMoney(totals.perUnit.subtotal)} />
        <Info label={t('summaryLabels.profitPerUnit')} value={formatMoney(totals.perUnit.profit)} />
        <Info label={t('summaryLabels.taxPerUnit')} value={formatMoney(totals.perUnit.tax)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base font-semibold">
        <Info label={t('summaryLabels.totalTimesQty', { qty: totals.quantity })} value={formatMoney(totals.total)} large />
        <Info label={t('summaryLabels.pricePerUnit')} value={formatMoney(totals.perUnit.total)} large />
      </div>
    </div>
  );
}

function Info({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-semibold ${large ? 'text-xl' : 'text-sm'}`}>{value}</span>
    </div>
  );
}
