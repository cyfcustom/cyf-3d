import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { useEsferasCalculator } from '@/app/hooks/useEsferasCalculator';
import { parseMoney } from '@/app/lib/money';

const modeHelp: Record<'markup' | 'margen', string> = {
  markup: 'Porcentaje sobre el costo base.',
  margen: 'Porcentaje de margen (convierte a markup interno).',
};

type Props = {
  state: Pick<ReturnType<typeof useEsferasCalculator>['state'], 'gananciaPct' | 'impuestosPct' | 'applyGanancia' | 'applyImpuestos' | 'gananciaMode' | 'quantity' | 'quantityEnabled'>;
  onGananciaChange: (value: number) => void;
  onImpuestosChange: (value: number) => void;
  onToggleGanancia: (value: boolean) => void;
  onToggleImpuestos: (value: boolean) => void;
  onModeChange: (mode: 'markup' | 'margen') => void;
  onQuantityChange: (value: number) => void;
  onQuantityToggle: (value: boolean) => void;
};

export function EsferasGICard({ state, onGananciaChange, onImpuestosChange, onToggleGanancia, onToggleImpuestos, onModeChange, onQuantityChange, onQuantityToggle }: Props) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">Ganancia / Impuestos / Cantidad</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyGanancia} onCheckedChange={onToggleGanancia} />
            <span>Aplicar ganancia (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.gananciaPct}
            onChange={(e) => onGananciaChange(parseMoney(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.applyImpuestos} onCheckedChange={onToggleImpuestos} />
            <span>Aplicar impuestos (%)</span>
          </label>
          <Input
            type="number"
            inputMode="decimal"
            step="1"
            min="0"
            value={state.impuestosPct}
            onChange={(e) => onImpuestosChange(parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Modo de ganancia</label>
          <select
            value={state.gananciaMode}
            onChange={(e) => onModeChange(e.target.value === 'markup' ? 'markup' : 'margen')}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="markup">Markup</option>
            <option value="margen">Margen</option>
          </select>
          <p className="text-xs text-muted-foreground">{modeHelp[state.gananciaMode]}</p>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 font-medium">
            <Switch checked={state.quantityEnabled} onCheckedChange={onQuantityToggle} />
            <span>Multiplicar totales por cantidad</span>
          </label>
          <Input
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            disabled={!state.quantityEnabled}
            value={state.quantity}
            onChange={(e) => onQuantityChange(parseMoney(e.target.value) || 1)}
          />
          <p className="text-xs text-muted-foreground">Emula el bloque de cantidad del HTML legado.</p>
        </div>
      </div>
    </div>
  );
}
