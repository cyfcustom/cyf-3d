import { useSublimacionCalculator } from '@/app/store/calculator';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { SublimDirectCostsCard } from './SublimDirectCostsCard';
import { SublimDepreciationCard } from './SublimDepreciationCard';
import { SublimMoCard } from './SublimMoCard';
import { SublimGICard } from './SublimGICard';
import { SublimSummaryCard } from './SublimSummaryCard';
import { SublimWorkerView } from './SublimWorkerView';
import { SaveCalculationButton } from '../shared/SaveCalculationButton';
import { CalculationHistoryPanel } from '../shared/CalculationHistoryPanel';
import { useSummaryReporter } from '../summary/summaryContext';

export function SublimModule() {
  const calculator = useSublimacionCalculator();
  const permissions = useUserPermissions('sublimacion');
  useSummaryReporter('sublimacion', calculator.totals.total);

  // Workers see a simplified view without cost breakdowns
  if (permissions.isWorker) {
    return <SublimWorkerView />;
  }

  // Supervisors without edit permissions see read-only cards
  const readOnlyDirect = !permissions.canEditDirectCosts;
  const readOnlyDep = !permissions.canEditDepreciation;
  const readOnlyMo = !permissions.canEditLabor;
  const readOnlyGI = !permissions.canEditFinancials;

  return (
    <div className="space-y-6" id="sublimacion">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 2</p>
        <h2 className="text-2xl font-bold">Sublimación</h2>
      </div>

      <SublimDirectCostsCard
        items={calculator.state.direct}
        onChange={calculator.updateDirect}
        readOnly={readOnlyDirect}
      />

      <SublimDepreciationCard
        items={calculator.state.depreciation}
        onChange={calculator.updateDep}
        readOnly={readOnlyDep}
      />

      <SublimMoCard
        mo={calculator.state.mo}
        onChange={calculator.updateMo}
        readOnly={readOnlyMo}
      />

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
        readOnly={readOnlyGI}
      />

      <SublimSummaryCard totals={calculator.totals} onReset={calculator.reset} />

      <div className="flex items-center gap-3">
        <SaveCalculationButton
          moduleName="sublimacion"
          totals={calculator.totals}
          quantity={calculator.state.quantity}
        />
      </div>

      <CalculationHistoryPanel moduleName="sublimacion" />
    </div>
  );
}
