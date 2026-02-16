import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { listUsersWithRoles, assignRole, removeRole } from '@/app/lib/api/userRolesApi';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';
import { Loader2, UserPlus, Trash2, Shield, Eye, Wrench } from 'lucide-react';
import type { UserRole } from '@/app/types/supabase';

interface UserRoleRow {
  id: string;
  user_id: string;
  role: string;
  display_name: string | null;
  created_at: string | null;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Shield size={14} className="text-amber-500" />,
  supervisor: <Eye size={14} className="text-blue-500" />,
  worker: <Wrench size={14} className="text-emerald-500" />,
};

export function AdminUsersPage() {
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState<UserRoleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New user form
  const [newUserId, setNewUserId] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('worker');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await listUsersWithRoles();
      setUsers(data as UserRoleRow[]);
    } catch (error) {
      console.error('[AdminUsers]', error);
      toast.error(t('users.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!newUserId.trim()) {
      toast.warning(t('users.uuidRequired'));
      return;
    }

    setIsAdding(true);
    try {
      await assignRole(newUserId.trim(), newRole, newDisplayName || undefined);
      toast.success(t('users.roleAssigned'));
      setNewUserId('');
      setNewDisplayName('');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || t('users.errorAssigning'));
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      await removeRole(userId);
      toast.success(t('users.roleRemoved'));
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || t('users.errorRemoving'));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">{t('users.title')}</h2>
        <p className="text-muted-foreground font-medium mt-2">
          {t('users.subtitle')}
        </p>
      </div>

      {/* Add user role */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <UserPlus size={18} />
          {t('users.assignRole')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">{t('users.userUuid')}</span>
            <Input
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder={t('users.uuidPlaceholder')}
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{t('users.name')}</span>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder={t('users.namePlaceholder')}
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">{t('users.role')}</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="worker">{t('users.roles.worker')}</option>
              <option value="supervisor">{t('users.roles.supervisor')}</option>
              <option value="admin">{t('users.roles.admin')}</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAssignRole} disabled={isAdding} className="w-full gap-2">
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {t('users.assign')}
            </Button>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold">{t('users.usersWithRole')}</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('users.noUsersWithRoles')}
          </p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  {ROLE_ICONS[user.role]}
                  <div>
                    <div className="font-medium text-sm">
                      {user.display_name || user.user_id.slice(0, 8) + '...'}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className="font-semibold uppercase tracking-wider">
                        {t(`users.roles.${user.role}`, { defaultValue: user.role })}
                      </span>
                      <span>ID: {user.user_id.slice(0, 12)}...</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveRole(user.user_id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
