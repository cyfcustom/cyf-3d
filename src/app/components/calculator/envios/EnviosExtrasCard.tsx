import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney, parseMoney } from '@/app/lib/money';
import { useEnviosCalculator } from '@/app/hooks/useEnviosCalculator';

type Props = {
  state: ReturnType<typeof useEnviosCalculator>['state'];
  mensajeria: number;
  onChange: (key: keyof ReturnType<typeof useEnviosCalculator>['state'], value: any) => void;
};

export function EnviosExtrasCard({ state, mensajeria, onChange }: Props) {
  const extrasBase =
    (state.embalajeEnabled ? state.embalaje : 0) +
    (state.fragilEnabled ? state.fragil : 0) +
    state.otros;
  const seguroVal = state.seguroEnabled ? (mensajeria + extrasBase) * (state.seguroPct / 100) : 0;
  const extras = extrasBase + seguroVal;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Extras</h3>
        <p className="text-sm text-muted-foreground">Embalaje, frágil, seguro y otros montos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToggleField
          label="Embalaje extra"
          enabled={state.embalajeEnabled}
          onEnabledChange={(v) => onChange('embalajeEnabled', v)}
          value={state.embalaje}
          onValueChange={(v) => onChange('embalaje', v)}
        />
        <ToggleField
          label="Manejo frágil"
          enabled={state.fragilEnabled}
          onEnabledChange={(v) => onChange('fragilEnabled', v)}
          value={state.fragil}
          onValueChange={(v) => onChange('fragil', v)}
        />
        <ToggleField
          label="Seguro (%)"
          enabled={state.seguroEnabled}
          onEnabledChange={(v) => onChange('seguroEnabled', v)}
          value={state.seguroPct}
          onValueChange={(v) => onChange('seguroPct', v)}
          percent
        />
        <Field
          label="Otros (monto)"
          value={state.otros}
          onChange={(v) => onChange('otros', v)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <Info label="Extras base" value={formatMoney(extrasBase, 'USD')} />
        <Info label="Seguro" value={formatMoney(seguroVal, 'USD')} />
        <Info label="Total extras" value={formatMoney(extras, 'USD')} />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  enabled,
  onEnabledChange,
  value,
  onValueChange,
  percent,
}: {
  label: string;
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  value: number;
  onValueChange: (v: number) => void;
  percent?: boolean;
}) {
  return (
    <div className="space-y-2 border border-border rounded-xl p-4 bg-muted/20">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step={percent ? '0.1' : '0.01'}
        value={value}
        onChange={(e) => onValueChange(parseMoney(e.target.value))}
      />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        onChange={(e) => onChange(parseMoney(e.target.value))}
      />
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
