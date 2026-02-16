import { useState, useEffect } from 'react';
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

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  worker: 'Trabajador',
};

export function AdminUsersPage() {
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
      toast.error('Error cargando usuarios');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!newUserId.trim()) {
      toast.warning('Ingresa el UUID del usuario');
      return;
    }

    setIsAdding(true);
    try {
      await assignRole(newUserId.trim(), newRole, newDisplayName || undefined);
      toast.success('Rol asignado correctamente');
      setNewUserId('');
      setNewDisplayName('');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar rol');
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveRole = async (userId: string) => {
    try {
      await removeRole(userId);
      toast.success('Rol eliminado');
      await loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar rol');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight">Gestión de Usuarios</h2>
        <p className="text-muted-foreground font-medium mt-2">
          Asigna roles y gestiona permisos de acceso a las calculadoras.
        </p>
      </div>

      {/* Add user role */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <UserPlus size={18} />
          Asignar Rol
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <span className="text-xs text-muted-foreground">UUID del usuario</span>
            <Input
              value={newUserId}
              onChange={(e) => setNewUserId(e.target.value)}
              placeholder="uuid..."
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Nombre</span>
            <Input
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Nombre visible"
            />
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Rol</span>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm"
            >
              <option value="worker">Trabajador</option>
              <option value="supervisor">Supervisor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={handleAssignRole} disabled={isAdding} className="w-full gap-2">
              {isAdding ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              Asignar
            </Button>
          </div>
        </div>
      </div>

      {/* Users list */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-bold">Usuarios con Rol</h3>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No hay usuarios con roles asignados.
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
                        {ROLE_LABELS[user.role] ?? user.role}
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
