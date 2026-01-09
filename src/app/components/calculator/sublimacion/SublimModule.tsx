import { useSublimacionCalculator } from '@/app/hooks/useSublimacionCalculator';
import { SublimDirectCostsCard } from './SublimDirectCostsCard';
import { SublimDepreciationCard } from './SublimDepreciationCard';
import { SublimMoCard } from './SublimMoCard';
import { SublimGICard } from './SublimGICard';
import { SublimSummaryCard } from './SublimSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function SublimModule() {
  const calculator = useSublimacionCalculator();
  useSummaryReporter('sublimacion', calculator.totals.total);

  return (
    <div className="space-y-6" id="sublimacion">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 2</p>
        <h2 className="text-2xl font-bold">Sublimación</h2>
      </div>

      <SublimDirectCostsCard items={calculator.state.direct} onChange={calculator.updateDirect} />

      <SublimDepreciationCard items={calculator.state.depreciation} onChange={calculator.updateDep} />

      <SublimMoCard mo={calculator.state.mo} onChange={calculator.updateMo} />

      <SublimGICard
        state={{
          gananciaPct: calculator.state.gananciaPct,
          impuestosPct: calculator.state.impuestosPct,
          applyGanancia: calculator.state.applyGanancia,
          applyImpuestos: calculator.state.applyImpuestos,
          quantity: calculator.state.quantity,
        }}
        onGananciaChange={calculator.setGananciaPct}
        onImpuestosChange={calculator.setImpuestosPct}
        onToggleGanancia={calculator.setApplyGanancia}
        onToggleImpuestos={calculator.setApplyImpuestos}
        onQuantityChange={calculator.setQuantity}
      />

      <SublimSummaryCard totals={calculator.totals} onReset={calculator.reset} />
    </div>
  );
}
