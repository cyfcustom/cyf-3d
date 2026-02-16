import { useSpheresCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';
import { SpheresDirectCostsCard } from './SpheresDirectCostsCard';
import { SpheresDepreciationCard } from './SpheresDepreciationCard';
import { SpheresIndirectCard } from './SpheresIndirectCard';
import { SpheresLaborCard } from './SpheresLaborCard';
import { SpheresGICard } from './SpheresGICard';
import { SpheresSummaryCard } from './SpheresSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function SpheresModule() {
  const { t } = useTranslation('calculator');
  const calculator = useSpheresCalculator();
  useSummaryReporter('spheres', calculator.totals.total);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.spheres.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.spheres.name')}</h2>
        <p className="text-sm text-muted-foreground">{t('modules.spheres.longDescription')}</p>
      </div>

      <SpheresDirectCostsCard
        items={calculator.state.direct}
        productSelection={calculator.state.productSelection}
        onProductChange={calculator.setProductSelection}
        onChange={calculator.updateDirect}
      />

      <SpheresDepreciationCard items={calculator.state.depreciation} onChange={calculator.updateDep} />

      <SpheresIndirectCard
        state={calculator.state.indirect}
        perUnit={calculator.totals.perUnit.indirectBase}
        onToggle={calculator.setIndirectEnabled}
        onMonthlyChange={calculator.updateIndirectMonthly}
        onUnitsChange={calculator.setIndirectUnits}
      />

      <SpheresLaborCard state={calculator.state.labor} perUnit={calculator.totals.perUnit.laborBase} onChange={calculator.updateLabor} />

      <SpheresGICard
        state={{
          profitPct: calculator.state.profitPct,
          taxPct: calculator.state.taxPct,
          applyProfit: calculator.state.applyProfit,
          applyTax: calculator.state.applyTax,
          profitMode: calculator.state.profitMode,
          quantity: calculator.state.quantity,
          quantityEnabled: calculator.state.quantityEnabled,
        }}
        onProfitChange={calculator.setProfitPct}
        onTaxChange={calculator.setTaxPct}
        onToggleProfit={calculator.setApplyProfit}
        onToggleTax={calculator.setApplyTax}
        onModeChange={calculator.setProfitMode}
        onQuantityChange={calculator.setQuantity}
        onQuantityToggle={calculator.setQuantityEnabled}
      />

      <SpheresSummaryCard totals={calculator.totals} onReset={calculator.reset} />
    </div>
  );
}
