import { useVinilCalculator } from '@/app/hooks/useVinilCalculator';
import { VinilDirectCostsCard } from './VinilDirectCostsCard';
import { VinilDepreciationCard } from './VinilDepreciationCard';
import { VinilExtrasCard } from './VinilExtrasCard';
import { VinilGICard } from './VinilGICard';
import { VinilSummaryCard } from './VinilSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function VinilModule() {
  const calculator = useVinilCalculator();
  useSummaryReporter('vinil', calculator.totals.total);

  return (
    <div className="space-y-6">
      <VinilDirectCostsCard
        items={calculator.state.direct}
        onChange={calculator.updateDirect}
      />

      <VinilDepreciationCard
        items={calculator.state.depreciation}
        onChange={calculator.updateDep}
      />

      <VinilExtrasCard
        extrasPerUnit={calculator.state.extrasPerUnit}
        mermaPct={calculator.state.mermaPct}
        onExtrasChange={calculator.setExtrasPerUnit}
        onMermaChange={calculator.setMermaPct}
      />

      <VinilGICard
        gananciaPct={calculator.state.gananciaPct}
        impuestosPct={calculator.state.impuestosPct}
        applyGanancia={calculator.state.applyGanancia}
        applyImpuestos={calculator.state.applyImpuestos}
        quantity={calculator.state.quantity}
        onGananciaChange={calculator.setGananciaPct}
        onImpuestosChange={calculator.setImpuestosPct}
        onToggleGanancia={calculator.setApplyGanancia}
        onToggleImpuestos={calculator.setApplyImpuestos}
        onQuantityChange={calculator.setQuantity}
      />

      <VinilSummaryCard totals={calculator.totals} onReset={calculator.reset} />
    </div>
  );
}
