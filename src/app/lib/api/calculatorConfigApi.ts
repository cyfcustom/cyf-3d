import { supabase } from '@/app/lib/supabase';
import type { Json } from '@/app/types/supabase';

export interface CalculatorConfig {
  id: string;
  module_name: string;
  config_version: number;
  is_active: boolean;
  direct_costs: Json;
  depreciation: Json;
  indirect_costs: Json | null;
  labor_costs: Json | null;
  financials: Json;
  extra_config: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

export async function fetchActiveConfig(
  moduleName: string
): Promise<CalculatorConfig | null> {
  const { data, error } = await supabase
    .from('calculator_configs')
    .select('*')
    .eq('module_name', moduleName)
    .eq('is_active', true)
    .order('config_version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.warn(`[ConfigAPI] Failed to fetch config for ${moduleName}:`, error.message);
    return null;
  }
  return data;
}

export async function updateConfigField(
  configId: string,
  field: string,
  value: Json,
  reason?: string
) {
  const { error } = await supabase.rpc('update_calculator_config', {
    p_config_id: configId,
    p_field: field,
    p_new_value: value,
    p_reason: reason ?? null,
  });

  if (error) throw error;
}

export async function fetchConfigAuditLog(
  moduleName: string,
  page = 0,
  pageSize = 20
) {
  const { data, error, count } = await supabase
    .from('config_audit_log')
    .select('*', { count: 'exact' })
    .eq('module_name', moduleName)
    .order('changed_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchAllAuditLogs(page = 0, pageSize = 20) {
  const { data, error, count } = await supabase
    .from('config_audit_log')
    .select('*', { count: 'exact' })
    .order('changed_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function revertConfig(
  configId: string,
  auditEntryId: string
) {
  // Fetch the audit entry to get old_value
  const { data: auditEntry, error: fetchError } = await supabase
    .from('config_audit_log')
    .select('*')
    .eq('id', auditEntryId)
    .single();

  if (fetchError || !auditEntry) throw fetchError ?? new Error('Audit entry not found');

  // Apply the old_value as new value (revert)
  await updateConfigField(
    configId,
    auditEntry.field_changed,
    auditEntry.old_value as Json,
    `Revert: undoing change from version ${auditEntry.previous_version}`
  );
}

export async function fetchAllConfigs() {
  const { data, error } = await supabase
    .from('calculator_configs')
    .select('*')
    .eq('is_active', true)
    .order('module_name');

  if (error) throw error;
  return data ?? [];
}
