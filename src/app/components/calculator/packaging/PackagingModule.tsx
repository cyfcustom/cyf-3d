import { usePackagingCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';
import { PackagingDirectCostsCard } from './PackagingDirectCostsCard';
import { PackagingDepreciationCard } from './PackagingDepreciationCard';
import { PackagingIndirectCard } from './PackagingIndirectCard';
import { PackagingLaborCard } from './PackagingLaborCard';
import { PackagingGICard } from './PackagingGICard';
import { PackagingSummaryCard } from './PackagingSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function PackagingModule() {
  const { t } = useTranslation('calculator');
  const calc = usePackagingCalculator();
  useSummaryReporter('packaging', calc.totals.total);

  return (
    <div className="space-y-6" id="packaging">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.packaging.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.packaging.name')}</h2>
        <p className="text-sm text-muted-foreground">{t('modules.packaging.longDescription')}</p>
      </div>

      <PackagingDirectCostsCard items={calc.state.direct} onChange={calc.updateDirect} />

      <PackagingDepreciationCard item={calc.state.depreciation[0]} onChange={calc.updateDepreciation} />

      <PackagingIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <PackagingLaborCard state={calc.state.labor} onChange={calc.setLabor} />

      <PackagingGICard
        state={{
          profitPct: calc.state.profitPct,
          taxPct: calc.state.taxPct,
          applyProfit: calc.state.applyProfit,
          applyTax: calc.state.applyTax,
          quantity: calc.state.quantity,
        }}
        onProfitChange={calc.setProfitPct}
        onTaxChange={calc.setTaxPct}
        onToggleProfit={calc.setApplyProfit}
        onToggleTax={calc.setApplyTax}
        onQuantityChange={calc.setQuantity}
      />

      <PackagingSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
