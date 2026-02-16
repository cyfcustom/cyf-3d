import { useAtomValue } from 'jotai';
import { userRoleAtom, userPermissionsAtom } from '@/app/store/roleAtoms';

export function useUserPermissions(moduleName?: string) {
  const { role, isLoading } = useAtomValue(userRoleAtom);
  const permissions = useAtomValue(userPermissionsAtom);

  const isAdmin = role === 'admin';
  const isSupervisor = role === 'supervisor';
  const isWorker = role === 'worker';

  const modulePermission = moduleName
    ? permissions.find((p) => p.module_name === moduleName)
    : null;

  return {
    role,
    isLoading,
    isAdmin,
    isSupervisor,
    isWorker,

    // Admins can always view/edit everything
    canViewPrices: isAdmin || isSupervisor,
    canEditConfig: isAdmin,

    // Granular supervisor permissions for a specific module
    canEditDirectCosts: isAdmin || (isSupervisor && !!modulePermission?.can_edit_direct_costs),
    canEditDepreciation: isAdmin || (isSupervisor && !!modulePermission?.can_edit_depreciation),
    canEditLabor: isAdmin || (isSupervisor && !!modulePermission?.can_edit_labor),
    canEditFinancials: isAdmin || (isSupervisor && !!modulePermission?.can_edit_financials),

    // Workers can only see simplified view (no cost breakdown)
    canViewCostBreakdown: isAdmin || isSupervisor,
  };
}
