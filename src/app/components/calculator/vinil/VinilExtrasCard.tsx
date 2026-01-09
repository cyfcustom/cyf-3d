import { Input } from '@/app/components/ui/input';
import { Slider } from '@/app/components/ui/slider';
import { formatMoney, parseMoney } from '@/app/lib/money';

type Props = {
  extrasPerUnit: number;
  mermaPct: number;
  onExtrasChange: (value: number) => void;
  onMermaChange: (value: number) => void;
};

export function VinilExtrasCard({ extrasPerUnit, mermaPct, onExtrasChange, onMermaChange }: Props) {
  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <h3 className="text-lg font-semibold">Adicionales y merma</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Adicionales por unidad ($)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={extrasPerUnit}
            onChange={(e) => onExtrasChange(parseMoney(e.target.value))}
          />
          <p className="text-xs text-muted-foreground">Costos por unidad fuera de los insumos principales (ej. vinil extra, acabados).</p>
          <div className="text-sm font-semibold">{formatMoney(extrasPerUnit, 'USD')} por unidad</div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Merma (%)</span>
            <span className="text-sm font-semibold">{mermaPct.toFixed(0)}%</span>
          </div>
          <Slider
            value={[mermaPct]}
            min={0}
            max={30}
            step={1}
            onValueChange={(v) => onMermaChange(v[0] ?? 0)}
          />
          <p className="text-xs text-muted-foreground">Incrementa el costo base para cubrir desperdicio/recortes.</p>
        </div>
      </div>
    </div>
  );
}
