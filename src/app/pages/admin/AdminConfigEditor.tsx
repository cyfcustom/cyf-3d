import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  fetchActiveConfig,
  updateConfigField,
  fetchConfigAuditLog,
} from '@/app/lib/api/calculatorConfigApi';
import type { CalculatorConfig } from '@/app/lib/api/calculatorConfigApi';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, History } from 'lucide-react';
import { formatMoney, parseMoney } from '@/app/lib/money';
import type { Json } from '@/app/types/supabase';

interface DirectCostRow {
  id: string;
  label: string;
  enabled: boolean;
  price: number;
  quantity: number;
}

interface DepreciationRow {
  id: string;
  label: string;
  enabled: boolean;
  mode: string;
  price: number;
  unitsPerMonth?: number;
  lifeUnits?: number;
}

interface AuditEntry {
  id: string;
  field_changed: string;
  changed_at: string;
  change_reason: string | null;
  previous_version: number;
}

export function AdminConfigEditor() {
  const { t } = useTranslation('admin');
  const { module } = useParams<{ module: string }>();
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [directCosts, setDirectCosts] = useState<DirectCostRow[]>([]);
  const [depreciation, setDepreciation] = useState<DepreciationRow[]>([]);
  const [financials, setFinancials] = useState<any>({});
  const [changeReason, setChangeReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);

  useEffect(() => {
    if (module) loadConfig();
  }, [module]);

  const loadConfig = async () => {
    try {
      const data = await fetchActiveConfig(module!);
      if (data) {
        setConfig(data);
        setDirectCosts((data.direct_costs as DirectCostRow[]) ?? []);
        setDepreciation((data.depreciation as DepreciationRow[]) ?? []);
        setFinancials(data.financials ?? {});
      }

      const audit = await fetchConfigAuditLog(module!, 0, 10);
      setAuditLog(audit.data as AuditEntry[]);
    } catch (error) {
      console.error('[AdminConfigEditor]', error);
      toast.error(t('config.editor.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveField = async (field: string, value: Json) => {
    if (!config) return;
    if (!changeReason.trim()) {
      toast.warning(t('config.editor.changeReasonRequired'));
      return;
    }

    setIsSaving(true);
    try {
      await updateConfigField(config.id, field, value, changeReason);
      toast.success(t('config.editor.fieldUpdated', { field }));
      setChangeReason('');
      await loadConfig(); // Reload to get new version
    } catch (error) {
      console.error('[Save]', error);
      toast.error(t('config.editor.errorSaving'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateDirectCost = (id: string, patch: Partial<DirectCostRow>) => {
    setDirectCosts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const updateDep = (id: string, patch: Partial<DepreciationRow>) => {
    setDepreciation((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{t('config.editor.notFound', { module })}</p>
        <Link to="/admin/config" className="text-primary mt-4 inline-block">
          {t('config.editor.back')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link to="/admin/config" className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight capitalize">{module}</h2>
          <p className="text-muted-foreground text-sm font-medium">
            {t('config.editor.versionInfo', {
              version: config.config_version,
              date: config.updated_at
                ? new Date(config.updated_at).toLocaleString('es-VE')
                : t('config.notAvailable'),
            })}
          </p>
        </div>
      </div>

      {/* Change reason input */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
        <label className="text-sm font-bold text-amber-700 dark:text-amber-400">
          {t('config.editor.changeReason')}
        </label>
        <Input
          value={changeReason}
          onChange={(e) => setChangeReason(e.target.value)}
          placeholder={t('config.editor.changeReasonPlaceholder')}
          className="mt-2"
        />
      </div>

      {/* Direct Costs */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t('config.editor.directCosts')}</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSaveField('direct_costs', directCosts as unknown as Json)}
            className="gap-2"
          >
            <Save size={14} />
            {t('config.editor.saveDirectCosts')}
          </Button>
        </div>
        <div className="space-y-3">
          {directCosts.map((item) => (
            <div key={item.id} className="grid grid-cols-4 gap-3 items-center">
              <span className="font-medium text-sm">{item.label}</span>
              <div>
                <span className="text-xs text-muted-foreground">{t('config.editor.priceLabel')}</span>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateDirectCost(item.id, { price: parseMoney(e.target.value) })}
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{t('config.editor.quantityLabel')}</span>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateDirectCost(item.id, { quantity: parseMoney(e.target.value) || 1 })
                  }
                />
              </div>
              <div className="text-sm">
                <span className="text-xs text-muted-foreground">{t('config.editor.unitCostLabel')}</span>
                <div className="font-semibold">
                  {formatMoney(item.quantity > 0 ? item.price / item.quantity : 0, 'USD')}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Depreciation */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t('config.editor.depreciation')}</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSaveField('depreciation', depreciation as unknown as Json)}
            className="gap-2"
          >
            <Save size={14} />
            {t('config.editor.saveDepreciation')}
          </Button>
        </div>
        <div className="space-y-3">
          {depreciation.map((item) => (
            <div key={item.id} className="grid grid-cols-4 gap-3 items-center">
              <span className="font-medium text-sm">{item.label}</span>
              <div>
                <span className="text-xs text-muted-foreground">{t('config.editor.equipmentPrice')}</span>
                <Input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateDep(item.id, { price: parseMoney(e.target.value) })}
                />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">
                  {item.mode === 'life' ? t('config.editor.lifeUnits') : t('config.editor.unitsPerMonth')}
                </span>
                <Input
                  type="number"
                  step="1"
                  min="1"
                  value={item.mode === 'life' ? item.lifeUnits ?? 0 : item.unitsPerMonth ?? 0}
                  onChange={(e) => {
                    const val = parseMoney(e.target.value) || 1;
                    updateDep(
                      item.id,
                      item.mode === 'life' ? { lifeUnits: val } : { unitsPerMonth: val }
                    );
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                {t('config.editor.mode', { mode: item.mode })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{t('config.editor.financials')}</h3>
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={() => handleSaveField('financials', financials as Json)}
            className="gap-2"
          >
            <Save size={14} />
            {t('config.editor.saveFinancials')}
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-muted-foreground">{t('config.editor.profitPct')}</span>
            <Input
              type="number"
              step="1"
              value={financials.profitPct ?? 0}
              onChange={(e) =>
                setFinancials({ ...financials, profitPct: parseMoney(e.target.value) })
              }
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{t('config.editor.taxPct')}</span>
            <Input
              type="number"
              step="1"
              value={financials.taxPct ?? 0}
              onChange={(e) =>
                setFinancials({ ...financials, taxPct: parseMoney(e.target.value) })
              }
            />
          </div>
        </div>
      </div>

      {/* Audit Log Sidebar */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History size={18} />
          <h3 className="text-lg font-bold">{t('config.editor.recentChanges')}</h3>
        </div>
        {auditLog.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('config.editor.noChanges')}</p>
        ) : (
          <div className="space-y-2">
            {auditLog.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 text-sm"
              >
                <div>
                  <span className="font-medium">{entry.field_changed}</span>
                  {entry.change_reason && (
                    <span className="text-muted-foreground"> — {entry.change_reason}</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  v{entry.previous_version} &rarr; v{entry.previous_version + 1}
                  <br />
                  {new Date(entry.changed_at).toLocaleDateString('es-VE', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
