import { supabase } from '@/app/lib/supabase';
import type { Json } from '@/app/types/supabase';

export interface CalculationHistoryEntry {
  id: string;
  user_id: string;
  module_name: string;
  input_state: Json;
  config_version: number;
  result_totals: Json;
  quantity: number;
  total_amount: number;
  note: string | null;
  created_at: string | null;
}

export async function saveCalculation(
  userId: string,
  moduleName: string,
  inputState: Json,
  configVersion: number,
  resultTotals: Json,
  quantity: number,
  totalAmount: number,
  note?: string
) {
  const { data, error } = await supabase
    .from('calculation_history')
    .insert({
      user_id: userId,
      module_name: moduleName,
      input_state: inputState,
      config_version: configVersion,
      result_totals: resultTotals,
      quantity,
      total_amount: totalAmount,
      note: note ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserHistory(
  userId: string,
  moduleName: string,
  page = 0,
  pageSize = 10
) {
  const { data, error, count } = await supabase
    .from('calculation_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('module_name', moduleName)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function fetchAllHistory(
  moduleName?: string,
  page = 0,
  pageSize = 20
) {
  let query = supabase
    .from('calculation_history')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (moduleName) {
    query = query.eq('module_name', moduleName);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function deleteCalculation(id: string) {
  const { error } = await supabase
    .from('calculation_history')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
