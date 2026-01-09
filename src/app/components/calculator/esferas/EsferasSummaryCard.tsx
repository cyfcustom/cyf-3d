import { Button } from '@/app/components/ui/button';
import { formatMoney } from '@/app/lib/money';
import { useEsferasCalculator } from '@/app/hooks/useEsferasCalculator';

type Props = {
  totals: ReturnType<typeof useEsferasCalculator>['totals'];
  onReset: () => void;
};

export function EsferasSummaryCard({ totals, onReset }: Props) {
  const copyBreakdown = () => {
    const lines = [
      `Directos (ud): ${formatMoney(totals.perUnit.direct)}`,
      `Depreciación (ud): ${formatMoney(totals.perUnit.depreciation)}`,
      `Indirectos (ud): ${formatMoney(totals.perUnit.indirectApplied)}`,
      `Mano de obra (ud): ${formatMoney(totals.perUnit.moApplied)}`,
      `Subtotal sin G/I (ud): ${formatMoney(totals.perUnit.base)}`,
      `Ganancia (ud): ${formatMoney(totals.perUnit.ganancia)}`,
      `Impuestos (ud): ${formatMoney(totals.perUnit.impuestos)}`,
      `Total (ud): ${formatMoney(totals.perUnit.total)}`,
      totals.quantityEnabled ? `Total x${totals.quantity}: ${formatMoney(totals.total)}` : `Total: ${formatMoney(totals.total)}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Resumen Esferas navideñas</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBreakdown}>Copiar</Button>
          <Button variant="destructive" onClick={onReset}>Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Info label="Directos (ud)" value={formatMoney(totals.perUnit.direct)} />
        <Info label="Depreciación (ud)" value={formatMoney(totals.perUnit.depreciation)} />
        <Info label="Indirectos (ud)" value={formatMoney(totals.perUnit.indirectApplied)} />
        <Info label="Mano de obra (ud)" value={formatMoney(totals.perUnit.moApplied)} />
        <Info label="Subtotal sin G/I (ud)" value={formatMoney(totals.perUnit.base)} />
        <Info label="Ganancia (ud)" value={formatMoney(totals.perUnit.ganancia)} />
        <Info label="Impuestos (ud)" value={formatMoney(totals.perUnit.impuestos)} />
        <Info label="Total (ud)" value={formatMoney(totals.perUnit.total)} />
        {totals.quantityEnabled && <Info label="Cantidad aplicada" value={`x${totals.quantity}`} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-base font-semibold">
        <Info label="Subtotal sin G/I" value={formatMoney(totals.subtotalSinGI)} large />
        <Info label="Precio de venta" value={formatMoney(totals.total)} large />
      </div>
    </div>
  );
}

function Info({ label, value, large = false }: { label: string; value: string; large?: boolean }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-semibold ${large ? 'text-xl' : 'text-sm'}`}>{value}</span>
    </div>
  );
}
