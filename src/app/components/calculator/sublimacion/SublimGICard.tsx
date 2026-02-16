import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';
import { useSublimacionCalculator } from '@/app/hooks/useSublimacionCalculator';

type Props = {
  state: Pick<ReturnType<typeof useSublimacionCalculator>['state'], 'gananciaPct' | 'impuestosPct' | 'applyGanancia' | 'applyImpuestos' | 'quantity'>;
  onGananciaChange: (value: number) => void;
  onImpuestosChange: (value: number) => void;
  onToggleGanancia: (value: boolean) => void;
  onToggleImpuestos: (value: boolean) => void;
  onQuantityChange: (value: number) => void;
  readOnly?: boolean;
};

export function SublimGICard({ state, onGananciaChange, onImpuestosChange, onToggleGanancia, onToggleImpuestos, onQuantityChange, readOnly = false }: Props) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">Ganancia / Impuestos / Cantidad</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyGanancia} onCheckedChange={onToggleGanancia} disabled={readOnly} />
            <span>Aplicar ganancia (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.gananciaPct}
            onChange={(e) => onGananciaChange(parseMoney(e.target.value))}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyImpuestos} onCheckedChange={onToggleImpuestos} disabled={readOnly} />
            <span>Aplicar impuestos (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.impuestosPct}
            onChange={(e) => onImpuestosChange(parseMoney(e.target.value))}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cantidad de productos</label>
        <Input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          value={state.quantity}
          onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}
