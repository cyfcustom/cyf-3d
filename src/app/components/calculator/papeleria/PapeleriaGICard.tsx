import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';
import { usePapeleriaCalculator } from '@/app/hooks/usePapeleriaCalculator';

export function PapeleriaGICard({
  state,
  onGananciaChange,
  onImpuestosChange,
  onToggleGanancia,
  onToggleImpuestos,
  onQuantityChange,
}: {
  state: Pick<ReturnType<typeof usePapeleriaCalculator>['state'], 'gananciaPct' | 'impuestosPct' | 'applyGanancia' | 'applyImpuestos' | 'quantity'>;
  onGananciaChange: (v: number) => void;
  onImpuestosChange: (v: number) => void;
  onToggleGanancia: (v: boolean) => void;
  onToggleImpuestos: (v: boolean) => void;
  onQuantityChange: (v: number) => void;
}) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">Ganancia (%)</span>
            <Switch checked={state.applyGanancia} onCheckedChange={onToggleGanancia} />
          </div>
          <Input
            type="number"
            inputMode="decimal"
            value={state.gananciaPct}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onGananciaChange(parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="font-medium">Impuestos (%)</span>
            <Switch checked={state.applyImpuestos} onCheckedChange={onToggleImpuestos} />
          </div>
          <Input
            type="number"
            inputMode="decimal"
            value={state.impuestosPct}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onImpuestosChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Cantidad de productos (visual)</span>
        <Input
          type="number"
          inputMode="decimal"
          min="1"
          value={state.quantity}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
        <p className="text-xs text-muted-foreground">Multiplica los totales por Q para la vista final.</p>
      </div>
    </div>
  );
}
