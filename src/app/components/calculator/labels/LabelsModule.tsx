import { useLabelsCalculator } from '@/app/store/calculator';
import { useTranslation } from 'react-i18next';
import { LabelsDirectCostsCard } from './LabelsDirectCostsCard';
import { LabelsDepreciationCard } from './LabelsDepreciationCard';
import { LabelsIndirectCard } from './LabelsIndirectCard';
import { LabelsLaborCard } from './LabelsLaborCard';
import { LabelsGICard } from './LabelsGICard';
import { LabelsSummaryCard } from './LabelsSummaryCard';
import { useSummaryReporter } from '../summary/summaryContext';

export function LabelsModule() {
  const { t } = useTranslation('calculator');
  const calc = useLabelsCalculator();
  useSummaryReporter('labels', calc.totals.total);

  return (
    <div className="space-y-6" id="labels">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">{t('modules.labels.moduleLabel')}</p>
        <h2 className="text-2xl font-bold">{t('modules.labels.name')}</h2>
        <p className="text-sm text-muted-foreground">{t('modules.labels.longDescription')}</p>
      </div>

      <LabelsDirectCostsCard
        items={calc.state.direct}
        productType={calc.state.productType}
        onChange={calc.updateDirect}
        onProductTypeChange={calc.setProductType}
      />

      <LabelsDepreciationCard items={calc.state.depreciation} onChange={calc.updateDepreciation} />

      <LabelsIndirectCard
        state={calc.state.indirect}
        onToggle={(v) => calc.setIndirect({ enabled: v })}
        onMonthlyChange={calc.setIndirectMonthly}
        onUnitsChange={(v) => calc.setIndirect({ unitsPerMonth: v })}
      />

      <LabelsLaborCard state={calc.state.labor} onChange={calc.setLabor} />

      <LabelsGICard
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

      <LabelsSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
