import { usePapeleriaCalculator } from '@/app/store/calculator';
import { PapeleriaDirectCostsCard } from './PapeleriaDirectCostsCard';
import { PapeleriaDepreciationCard } from './PapeleriaDepreciationCard';
import { PapeleriaIndirectCard } from './PapeleriaIndirectCard';
import { PapeleriaMoCard } from './PapeleriaMoCard';
import { PapeleriaGICard } from './PapeleriaGICard';
import { PapeleriaSummaryCard } from './PapeleriaSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function PapeleriaModule() {
  const calc = usePapeleriaCalculator();
  useSummaryReporter('papeleria', calc.totals.total);

  return (
    <div className="space-y-6" id="papeleria">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 5</p>
        <h2 className="text-2xl font-bold">Papelería</h2>
        <p className="text-sm text-muted-foreground">Sustratos, adhesivos y empaques prorrateados por unidad.</p>
      </div>

      <PapeleriaDirectCostsCard items={calc.state.direct} onChange={calc.updateDirect} />

      <PapeleriaDepreciationCard items={calc.state.depreciation} onChange={calc.updateDepreciation} />

      <PapeleriaIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <PapeleriaMoCard state={calc.state.mo} onChange={calc.setMo} />

      <PapeleriaGICard
        state={{
          gananciaPct: calc.state.gananciaPct,
          impuestosPct: calc.state.impuestosPct,
          applyGanancia: calc.state.applyGanancia,
          applyImpuestos: calc.state.applyImpuestos,
          quantity: calc.state.quantity,
        }}
        onGananciaChange={calc.setGananciaPct}
        onImpuestosChange={calc.setImpuestosPct}
        onToggleGanancia={calc.setApplyGanancia}
        onToggleImpuestos={calc.setApplyImpuestos}
        onQuantityChange={calc.setQuantity}
      />

      <PapeleriaSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
