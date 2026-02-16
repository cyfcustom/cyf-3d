import { useSublimationCalculator } from '@/app/store/calculator';
import { useUserPermissions } from '@/app/hooks/useUserPermissions';
import { useTranslation } from 'react-i18next';
import { SublimationDirectCostsCard } from './SublimationDirectCostsCard';
import { SublimationDepreciationCard } from './SublimationDepreciationCard';
import { SublimationLaborCard } from './SublimationLaborCard';
import { SublimationGICard } from './SublimationGICard';
import { SublimationSummaryCard } from './SublimationSummaryCard';
import { SublimationWorkerView } from './SublimationWorkerView';
import { SaveCalculationButton } from '../shared/SaveCalculationButton';
import { CalculationHistoryPanel } from '../shared/CalculationHistoryPanel';
import { useSummaryReporter } from '../summary/summaryContext';

export function SublimationModule() {
  const { t } = useTranslation('calculator');
  const calculator = useSublimationCalculator();
  const permissions = useUserPermissions('sublimation');
  useSummaryReporter('sublimation', calculator.totals.total);

  // Workers see a simplified view without cost breakdowns
  if (permissions.isWorker) {
    return <SublimationWorkerView />;
  }

  // Supervisors without edit permissions see read-only cards
  const readOnlyDirect = !permissions.canEditDirectCosts;
  const readOnlyDep = !permissions.canEditDepreciation;
  const readOnlyMo = !permissions.canEditLabor;
  const readOnlyGI = !permissions.canEditFinancials;

  return (
    <div className="space-y-6" id="sublimation">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.sublimation.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.sublimation.name')}</h2>
      </div>

      <SublimationDirectCostsCard
        items={calculator.state.direct}
        onChange={calculator.updateDirect}
        readOnly={readOnlyDirect}
      />

      <SublimationDepreciationCard
        items={calculator.state.depreciation}
        onChange={calculator.updateDep}
        readOnly={readOnlyDep}
      />

      <SublimationLaborCard
        mo={calculator.state.labor}
        onChange={calculator.updateLabor}
        readOnly={readOnlyMo}
      />

      <SublimationGICard
        state={{
          profitPct: calculator.state.profitPct,
          taxPct: calculator.state.taxPct,
          applyProfit: calculator.state.applyProfit,
          applyTax: calculator.state.applyTax,
          quantity: calculator.state.quantity,
        }}
        onProfitChange={calculator.setProfitPct}
        onTaxChange={calculator.setTaxPct}
        onToggleProfit={calculator.setApplyProfit}
        onToggleTax={calculator.setApplyTax}
        onQuantityChange={calculator.setQuantity}
        readOnly={readOnlyGI}
      />

      <SublimationSummaryCard totals={calculator.totals} onReset={calculator.reset} />

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
