import { supabase } from '@/app/lib/supabase';
import type { UserRole } from '@/app/types/supabase';

export async function fetchUserRole(userId: string): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}

export async function fetchUserPermissions(userId: string) {
  const { data, error } = await supabase
    .from('supervisor_permissions')
    .select('*')
    .eq('user_id', userId);

  if (error) return [];
  return data ?? [];
}

export async function assignRole(
  userId: string,
  role: UserRole,
  displayName?: string
) {
  const { error } = await supabase
    .from('user_roles')
    .upsert(
      {
        user_id: userId,
        role,
        display_name: displayName ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}

export async function updatePermissions(
  userId: string,
  moduleName: string,
  permissions: {
    can_edit_direct_costs?: boolean;
    can_edit_depreciation?: boolean;
    can_edit_labor?: boolean;
    can_edit_financials?: boolean;
  }
) {
  const { error } = await supabase
    .from('supervisor_permissions')
    .upsert(
      {
        user_id: userId,
        module_name: moduleName,
        ...permissions,
      },
      { onConflict: 'user_id,module_name' }
    );

  if (error) throw error;
}

export async function listUsersWithRoles() {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function removeRole(userId: string) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}
