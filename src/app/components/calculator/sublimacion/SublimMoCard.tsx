import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useSublimacionCalculator } from '@/app/hooks/useSublimacionCalculator';

type Props = {
  mo: ReturnType<typeof useSublimacionCalculator>['state']['mo'];
  onChange: (patch: Partial<Props['mo']>) => void;
};

export function SublimMoCard({ mo, onChange }: Props) {
  const perUnit = mo.enabled
    ? ((mo.setupMinutes + mo.runMinutesPerUnit) / 60) * mo.hourlyRate
    : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">Mano de obra</h3>
          <p className="text-sm text-muted-foreground">(setup + corrida) × tarifa / 60. Aplicada por unidad.</p>
        </div>
        <Switch checked={mo.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Setup (min)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.setupMinutes}
            onChange={(e) => onChange({ setupMinutes: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Corrida por unidad (min)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.runMinutesPerUnit}
            onChange={(e) => onChange({ runMinutesPerUnit: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tarifa hora ($)</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.hourlyRate}
            onChange={(e) => onChange({ hourlyRate: parseMoney(e.target.value) })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">MO por unidad</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      </div>
    </div>
  );
}
