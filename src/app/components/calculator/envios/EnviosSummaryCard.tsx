import { Button } from '@/app/components/ui/button';
import { formatMoney } from '@/app/lib/money';
import { useEnviosCalculator } from '@/app/hooks/useEnviosCalculator';

type Props = {
  totals: ReturnType<typeof useEnviosCalculator>['totals'];
  onReset: () => void;
};

export function EnviosSummaryCard({ totals, onReset }: Props) {
  const copyBreakdown = () => {
    const lines = [
      `Mensajería: ${formatMoney(totals.mensajeria)}`,
      `Extras: ${formatMoney(totals.extras)}`,
      `Total Envíos: ${formatMoney(totals.total)}`,
    ];
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Resumen Envíos</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyBreakdown}>Copiar</Button>
          <Button variant="destructive" onClick={onReset}>Reset</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <Info label="Mensajería" value={formatMoney(totals.mensajeria)} />
        <Info label="Extras" value={formatMoney(totals.extras)} />
        <Info label="Total" value={formatMoney(totals.total)} />
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl border border-border bg-muted/30 flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
