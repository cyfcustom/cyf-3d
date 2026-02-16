import { useEtiquetasCalculator } from '@/app/store/calculator';
import { EtiquetasDirectCostsCard } from './EtiquetasDirectCostsCard';
import { EtiquetasDepreciationCard } from './EtiquetasDepreciationCard';
import { EtiquetasIndirectCard } from './EtiquetasIndirectCard';
import { EtiquetasMoCard } from './EtiquetasMoCard';
import { EtiquetasGICard } from './EtiquetasGICard';
import { EtiquetasSummaryCard } from './EtiquetasSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function EtiquetasModule() {
  const calc = useEtiquetasCalculator();
  useSummaryReporter('etiquetas', calc.totals.total);

  return (
    <div className="space-y-6" id="etiquetas">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 6</p>
        <h2 className="text-2xl font-bold">Etiquetas</h2>
        <p className="text-sm text-muted-foreground">Sustrato, tinta y laminado con depreciación y G/I.</p>
      </div>

      <EtiquetasDirectCostsCard
        items={calc.state.direct}
        productType={calc.state.productType}
        onChange={calc.updateDirect}
        onProductTypeChange={calc.setProductType}
      />

      <EtiquetasDepreciationCard items={calc.state.depreciation} onChange={calc.updateDepreciation} />

      <EtiquetasIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <EtiquetasMoCard state={calc.state.mo} onChange={calc.setMo} />

      <EtiquetasGICard
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

      <EtiquetasSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
