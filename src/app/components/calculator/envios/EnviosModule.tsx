import { useEnviosCalculator } from '@/app/store/calculator';
import { EnviosMensajeriaCard } from './EnviosMensajeriaCard';
import { EnviosExtrasCard } from './EnviosExtrasCard';
import { EnviosSummaryCard } from './EnviosSummaryCard';
import { useSummaryReporter } from '../resumen/summaryContext';

export function EnviosModule() {
  const calc = useEnviosCalculator();
  useSummaryReporter('envios', calc.totals.total);

  return (
    <div className="space-y-6" id="envios">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-primary font-semibold">Módulo 8</p>
        <h2 className="text-2xl font-bold">Envíos</h2>
        <p className="text-sm text-muted-foreground">Calcula mensajería (base + km + kg) y extras: embalaje, frágil, seguro y otros.</p>
      </div>

      <EnviosMensajeriaCard state={calc.state} onChange={calc.setField} />
      <EnviosExtrasCard state={calc.state} mensajeria={calc.totals.mensajeria} onChange={calc.setField} />
      <EnviosSummaryCard totals={calc.totals} onReset={calc.reset} />
    </div>
  );
}
