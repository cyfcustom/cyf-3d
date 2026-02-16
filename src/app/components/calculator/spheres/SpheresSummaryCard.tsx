import { Button } from '@/app/components/ui/button';
import { formatMoney } from '@/app/lib/money';
import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';

type Props = {
  totals: ReturnType<typeof useSpheresCalculator>['totals'];
  onReset: () => void;
};

export function SpheresSummaryCard({ totals, onReset }: Props) {
  const { t } = useTranslation('calculator');

  const copyBreakdown = () => {
    const lines = [
      `${t('summaryLabels.directPerUnit')}: ${formatMoney(totals.perUnit.direct)}`,
      `${t('summaryLabels.depreciationPerUnit')}: ${formatMoney(totals.perUnit.depreciation)}`,
      `${t('summaryLabels.indirectPerUnit')}: ${formatMoney(totals.perUnit.indirectApplied)}`,
      `${t('summaryLabels.laborPerUnit')}: ${formatMoney(totals.perUnit.laborApplied)}`,
      `${t('summaryLabels.subtotalNoGI')}: ${formatMoney(totals.perUnit.base)}`,
      `${t('summaryLabels.profitPerUnit')}: ${formatMoney(totals.perUnit.profit)}`,
      `${t('summaryLabels.taxPerUnit')}: ${formatMoney(totals.perUnit.tax)}`,
      `${t('summaryLabels.totalPerUnit')}: ${formatMoney(totals.perUnit.total)}`,
      totals.quantityEnabled ? `${t('summaryLabels.totalTimesQty', { qty: totals.quantity })}: ${formatMoney(totals.total)}` : `${t('summaryLabels.total')}: ${formatMoney(totals.total)}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{t('summaryModule.spheres')}</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBreakdown}>{t('actions.copy')}</Button>
          <Button variant="destructive" onClick={onReset}>{t('actions.reset')}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Info label={t('summaryLabels.directPerUnit')} value={formatMoney(totals.perUnit.direct)} />
        <Info label={t('summaryLabels.depreciationPerUnit')} value={formatMoney(totals.perUnit.depreciation)} />
        <Info label={t('summaryLabels.indirectPerUnit')} value={formatMoney(totals.perUnit.indirectApplied)} />
        <Info label={t('summaryLabels.laborPerUnit')} value={formatMoney(totals.perUnit.laborApplied)} />
        <Info label={t('summaryLabels.subtotalNoGI')} value={formatMoney(totals.perUnit.base)} />
        <Info label={t('summaryLabels.profitPerUnit')} value={formatMoney(totals.perUnit.profit)} />
        <Info label={t('summaryLabels.taxPerUnit')} value={formatMoney(totals.perUnit.tax)} />
        <Info label={t('summaryLabels.totalPerUnit')} value={formatMoney(totals.perUnit.total)} />
        {totals.quantityEnabled && <Info label={t('summaryLabels.quantityApplied')} value={`x${totals.quantity}`} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base font-semibold">
        <Info label={t('summaryLabels.subtotalNoGIShort')} value={formatMoney(totals.subtotalBeforeFinancials)} large />
        <Info label={t('summaryLabels.salePrice')} value={formatMoney(totals.total)} large />
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
