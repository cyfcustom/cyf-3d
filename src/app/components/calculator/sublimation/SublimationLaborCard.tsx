import { Input } from '@/app/components/ui/input';
import { Switch } from '@/app/components/ui/switch';
import { parseMoney, formatMoney } from '@/app/lib/money';
import { useTranslation } from 'react-i18next';
import { useSublimationCalculator } from '@/app/store/calculator';

type Props = {
  mo: ReturnType<typeof useSublimationCalculator>['state']['labor'];
  onChange: (patch: Partial<Props['mo']>) => void;
  readOnly?: boolean;
};

export function SublimationLaborCard({ mo, onChange, readOnly = false }: Props) {
  const { t } = useTranslation('calculator');
  const perUnit = mo.enabled
    ? ((mo.setupMinutes + mo.runMinutesPerUnit) / 60) * mo.hourlyRate
    : 0;

  return (
    <div className="card bg-card border border-border rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold">{t('sections.labor')}</h3>
          <p className="text-sm text-muted-foreground">{t('descriptions.laborSublim')}</p>
        </div>
        <Switch checked={mo.enabled} onCheckedChange={(v) => onChange({ enabled: v })} disabled={readOnly} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.setupMin')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.setupMinutes}
            onChange={(e) => onChange({ setupMinutes: parseMoney(e.target.value) })}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.runPerUnit')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.runMinutesPerUnit}
            onChange={(e) => onChange({ runMinutesPerUnit: parseMoney(e.target.value) })}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.hourlyRate')}</span>
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={mo.hourlyRate}
            onChange={(e) => onChange({ hourlyRate: parseMoney(e.target.value) })}
            disabled={readOnly}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">{t('fields.laborPerUnit')}</span>
          <div className="text-sm font-semibold">{formatMoney(perUnit, 'USD')}</div>
        </div>
      </div>
    </div>
  );
}
