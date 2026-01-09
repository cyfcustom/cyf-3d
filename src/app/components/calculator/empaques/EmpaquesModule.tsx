import { useEmpaquesCalculator } from '@/app/hooks/useEmpaquesCalculator';
import { EmpaquesDirectCostsCard } from './EmpaquesDirectCostsCard';
import { EmpaquesDepreciationCard } from './EmpaquesDepreciationCard';
import { EmpaquesIndirectCard } from './EmpaquesIndirectCard';
import { EmpaquesMoCard } from './EmpaquesMoCard';
import { EmpaquesGICard } from './EmpaquesGICard';
import { EmpaquesSummaryCard } from './EmpaquesSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function EmpaquesModule() {
  const calc = useEmpaquesCalculator();
  useSummaryReporter('empaques', calc.totals.total);

  return (
    <div className="space-y-6" id="empaques">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 7</p>
        <h2 className="text-2xl font-bold">Empaques</h2>
        <p className="text-sm text-muted-foreground">Cajas, bolsas y acabados con depreciación, MO e indirectos opcionales.</p>
      </div>

      <EmpaquesDirectCostsCard items={calc.state.direct} onChange={calc.updateDirect} />

      <EmpaquesDepreciationCard item={calc.state.depreciation[0]} onChange={calc.updateDepreciation} />

      <EmpaquesIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <EmpaquesMoCard state={calc.state.mo} onChange={calc.setMo} />

      <EmpaquesGICard
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

      <EmpaquesSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
