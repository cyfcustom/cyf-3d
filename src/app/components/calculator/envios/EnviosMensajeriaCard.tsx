import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useEnviosCalculator } from '@/app/hooks/useEnviosCalculator';

const TYPES: Array<ReturnType<typeof useEnviosCalculator>['state']['tipo']> = [
  'Motorizado local',
  'Mensajería urbana',
  'Encomienda nacional',
  'Internacional',
  'Otro',
];

type Props = {
  state: ReturnType<typeof useEnviosCalculator>['state'];
  onChange: (key: keyof ReturnType<typeof useEnviosCalculator>['state'], value: any) => void;
};

export function EnviosMensajeriaCard({ state, onChange }: Props) {
  const mensajeria = state.mensajeriaEnabled
    ? state.base + state.km * state.tarifaKm + state.kg * state.tarifaKg
    : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Mensajería / Flete</h3>
          <p className="text-sm text-muted-foreground">Tarifa base + km + kg. Activa cuando aplica.</p>
        </div>
        <Switch
          checked={state.mensajeriaEnabled}
          onCheckedChange={(v) => onChange('mensajeriaEnabled', v)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tipo</span>
          <select
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={state.tipo}
            onChange={(e) => onChange('tipo', e.target.value as typeof state.tipo)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Distancia (km)</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={state.km}
            onChange={(e) => onChange('km', parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tarifa base</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={state.base}
            onChange={(e) => onChange('base', parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tarifa por km</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={state.tarifaKm}
            onChange={(e) => onChange('tarifaKm', parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Peso (kg)</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={state.kg}
            onChange={(e) => onChange('kg', parseMoney(e.target.value))}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Tarifa por kg</span>
          <Input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={state.tarifaKg}
            onChange={(e) => onChange('tarifaKg', parseMoney(e.target.value))}
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">Total mensajería: {formatMoney(mensajeria, 'USD')}</div>
    </div>
  );
}
