import { useMemo, useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { formatMoney } from '@/app/lib/money';
import { useSummaryTotals } from './summaryContext';

const MODULES = [
  { id: 'vinil', label: 'Vinil', defaultOn: true },
  { id: 'sublimacion', label: 'Sublimación', defaultOn: true },
  { id: 'etiquetas', label: 'Etiquetas', defaultOn: true },
  { id: 'empaques', label: 'Empaques', defaultOn: true },
  { id: 'papeleria', label: 'Papelería', defaultOn: true },
  { id: 'envios', label: 'Envíos', defaultOn: false },
  { id: 'dtf', label: 'DTF', defaultOn: false },
  { id: 'esferas', label: 'Esferas navideñas', defaultOn: true },
  { id: 'personalizado', label: 'Producto personalizable', defaultOn: true },
] as const;

type ModuleId = (typeof MODULES)[number]['id'];

export function ResumenGeneralModule() {
  const ctx = useSummaryTotals();
  const totals = ctx?.totals ?? {};

  const [enabled, setEnabled] = useState<Record<ModuleId, boolean>>(() => {
    const initial: Record<ModuleId, boolean> = {} as Record<ModuleId, boolean>;
    MODULES.forEach((m) => {
      initial[m.id] = m.defaultOn;
    });
    return initial;
  });

  const totalSeleccionado = useMemo(() => {
    return MODULES.reduce((acc, m) => {
      const val = totals[m.id] ?? 0;
      return acc + (enabled[m.id] ? val : 0);
    }, 0);
  }, [enabled, totals]);

  const copyResumen = () => {
    const lines = MODULES.map((m) => `${m.label} = ${formatMoney(totals[m.id] ?? 0)}${enabled[m.id] ? '' : ' (omitido)'}`);
    lines.push(`Total General = ${formatMoney(totalSeleccionado)}`);
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {});
  };

  return (
    <div className="space-y-6" id="resumen">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 11</p>
        <h2 className="text-2xl font-bold">Resumen General</h2>
        <p className="text-sm text-muted-foreground">Suma los totales de cada módulo y permite omitir los que no aplican.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MODULES.map((m) => (
          <div key={m.id} className="p-4 border border-border rounded-xl bg-card space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold">{m.label}</span>
              <Switch
                checked={enabled[m.id]}
                onCheckedChange={(v) => setEnabled((prev) => ({ ...prev, [m.id]: v }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">{formatMoney(totals[m.id] ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold">Total General Seleccionado</h3>
            <p className="text-sm text-muted-foreground">Suma de los módulos marcados.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={copyResumen}>Copiar</Button>
            <Button variant="outline" onClick={() => window.print()}>Exportar / Imprimir</Button>
          </div>
        </div>
        <div className="text-3xl font-bold">{formatMoney(totalSeleccionado)}</div>
      </div>
    </div>
  );
}
