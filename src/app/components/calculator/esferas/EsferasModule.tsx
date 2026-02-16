import { useEsferasCalculator } from '@/app/store/calculator';
import { EsferasDirectCostsCard } from './EsferasDirectCostsCard';
import { EsferasDepreciationCard } from './EsferasDepreciationCard';
import { EsferasIndirectCard } from './EsferasIndirectCard';
import { EsferasMoCard } from './EsferasMoCard';
import { EsferasGICard } from './EsferasGICard';
import { EsferasSummaryCard } from './EsferasSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function EsferasModule() {
  const calculator = useEsferasCalculator();
  useSummaryReporter('esferas', calculator.totals.total);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 3</p>
        <h2 className="text-2xl font-bold">Esferas navideñas</h2>
        <p className="text-sm text-muted-foreground">Replica la lógica del HTML legado: costos directos, depreciación, indirectos, mano de obra y G/I.</p>
      </div>

      <EsferasDirectCostsCard
        items={calculator.state.direct}
        productSelection={calculator.state.productSelection}
        onProductChange={calculator.setProductSelection}
        onChange={calculator.updateDirect}
      />

      <EsferasDepreciationCard items={calculator.state.depreciation} onChange={calculator.updateDep} />

      <EsferasIndirectCard
        state={calculator.state.indirect}
        perUnit={calculator.totals.perUnit.indirectBase}
        onToggle={calculator.setIndirectEnabled}
        onMonthlyChange={calculator.updateIndirectMonthly}
        onUnitsChange={calculator.setIndirectUnits}
      />

      <EsferasMoCard state={calculator.state.mo} perUnit={calculator.totals.perUnit.moBase} onChange={calculator.updateMo} />

      <EsferasGICard
        state={{
          gananciaPct: calculator.state.gananciaPct,
          impuestosPct: calculator.state.impuestosPct,
          applyGanancia: calculator.state.applyGanancia,
          applyImpuestos: calculator.state.applyImpuestos,
          gananciaMode: calculator.state.gananciaMode,
          quantity: calculator.state.quantity,
          quantityEnabled: calculator.state.quantityEnabled,
        }}
        onGananciaChange={calculator.setGananciaPct}
        onImpuestosChange={calculator.setImpuestosPct}
        onToggleGanancia={calculator.setApplyGanancia}
        onToggleImpuestos={calculator.setApplyImpuestos}
        onModeChange={calculator.setGananciaMode}
        onQuantityChange={calculator.setQuantity}
        onQuantityToggle={calculator.setQuantityEnabled}
      />

      <EsferasSummaryCard totals={calculator.totals} onReset={calculator.reset} />
    </div>
  );
}
