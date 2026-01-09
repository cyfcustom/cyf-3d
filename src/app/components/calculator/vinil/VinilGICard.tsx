import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney } from '@/app/lib/money';

type Props = {
  gananciaPct: number;
  impuestosPct: number;
  applyGanancia: boolean;
  applyImpuestos: boolean;
  quantity: number;
  onGananciaChange: (value: number) => void;
  onImpuestosChange: (value: number) => void;
  onToggleGanancia: (value: boolean) => void;
  onToggleImpuestos: (value: boolean) => void;
  onQuantityChange: (value: number) => void;
};

export function VinilGICard({
  gananciaPct,
  impuestosPct,
  applyGanancia,
  applyImpuestos,
  quantity,
  onGananciaChange,
  onImpuestosChange,
  onToggleGanancia,
  onToggleImpuestos,
  onQuantityChange,
}: Props) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ganancia / Impuestos</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={applyGanancia} onCheckedChange={onToggleGanancia} />
            <span>Aplicar ganancia (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={gananciaPct}
            onChange={(e) => onGananciaChange(parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={applyImpuestos} onCheckedChange={onToggleImpuestos} />
            <span>Aplicar impuestos (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={impuestosPct}
            onChange={(e) => onImpuestosChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Cantidad de productos (multiplica el total)</label>
        <Input
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          value={quantity}
          onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
        />
      </div>
    </div>
  );
}
