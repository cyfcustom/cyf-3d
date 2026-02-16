import { atom } from 'jotai';
import type { UserRole } from '@/app/types/supabase';

export interface UserRoleState {
  role: UserRole | null;
  isLoading: boolean;
}

export interface SupervisorPermission {
  module_name: string;
  can_edit_direct_costs: boolean;
  can_edit_depreciation: boolean;
  can_edit_labor: boolean;
  can_edit_financials: boolean;
}

export const userRoleAtom = atom<UserRoleState>({
  role: null,
  isLoading: true,
});

export const userPermissionsAtom = atom<SupervisorPermission[]>([]);
