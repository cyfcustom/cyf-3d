import { useStationeryCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';
import { StationeryDirectCostsCard } from './StationeryDirectCostsCard';
import { StationeryDepreciationCard } from './StationeryDepreciationCard';
import { StationeryIndirectCard } from './StationeryIndirectCard';
import { StationeryLaborCard } from './StationeryLaborCard';
import { StationeryGICard } from './StationeryGICard';
import { StationerySummaryCard } from './StationerySummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function StationeryModule() {
  const { t } = useTranslation('calculator');
  const calc = useStationeryCalculator();
  useSummaryReporter('stationery', calc.totals.total);

  return (
    <div className="space-y-6" id="stationery">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.stationery.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.stationery.name')}</h2>
        <p className="text-sm text-muted-foreground">{t('modules.stationery.longDescription')}</p>
      </div>

      <StationeryDirectCostsCard items={calc.state.direct} onChange={calc.updateDirect} />

      <StationeryDepreciationCard items={calc.state.depreciation} onChange={calc.updateDepreciation} />

      <StationeryIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <StationeryLaborCard state={calc.state.labor} onChange={calc.setLabor} />

      <StationeryGICard
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

      <StationerySummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
