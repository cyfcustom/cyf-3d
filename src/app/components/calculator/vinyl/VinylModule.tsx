import { useVinylCalculator } from '@/app/store/calculator';
import { VinylDirectCostsCard } from './VinylDirectCostsCard';
import { VinylDepreciationCard } from './VinylDepreciationCard';
import { VinylExtrasCard } from './VinylExtrasCard';
import { VinylGICard } from './VinylGICard';
import { VinylSummaryCard } from './VinylSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function VinylModule() {
  const calculator = useVinylCalculator();
  useSummaryReporter('vinyl', calculator.totals.total);

  return (
    <div className="space-y-6">
      <VinylDirectCostsCard
        items={calculator.state.direct}
        onChange={calculator.updateDirect}
      />

      <VinylDepreciationCard
        items={calculator.state.depreciation}
        onChange={calculator.updateDep}
      />

      <VinylExtrasCard
        extrasPerUnit={calculator.state.extrasPerUnit}
        wastePct={calculator.state.wastePct}
        onExtrasChange={calculator.setExtrasPerUnit}
        onWasteChange={calculator.setWastePct}
      />

      <VinylGICard
        profitPct={calculator.state.profitPct}
        taxPct={calculator.state.taxPct}
        applyProfit={calculator.state.applyProfit}
        applyTax={calculator.state.applyTax}
        quantity={calculator.state.quantity}
        onProfitChange={calculator.setProfitPct}
        onTaxChange={calculator.setTaxPct}
        onToggleProfit={calculator.setApplyProfit}
        onToggleTax={calculator.setApplyTax}
        onQuantityChange={calculator.setQuantity}
      />

      <VinylSummaryCard totals={calculator.totals} onReset={calculator.reset} />
    </div>
  );
}
