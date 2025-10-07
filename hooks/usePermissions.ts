import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export type Role = 'admin' | 'editor' | 'read_write' | 'read_only';

export interface UserPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageProjects: boolean;
}

interface UserRole {
  project: string;
  role: Role;
}

export function usePermissions(project: string) {
  const [permissions, setPermissions] = useState<UserPermissions>({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canManageProjects: false,
  });
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPermissions() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch user's roles
        const { data: roles } = await supabase
          .from('user_project_roles')
          .select('project, role')
          .eq('user_id', user.id);

        if (!roles) {
          setLoading(false);
          return;
        }

        // Find role for this specific project or "ALL"
        const projectRole = roles.find((r: UserRole) => r.project === project) as UserRole | undefined;
        const allProjectsRole = roles.find((r: UserRole) => r.project === 'ALL') as UserRole | undefined;

        const effectiveRole = projectRole?.role || allProjectsRole?.role || null;
        setRole(effectiveRole);

        if (effectiveRole) {
          setPermissions(getPermissionsForRole(effectiveRole));
        }
      } catch (err) {
        console.error('Error loading permissions:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPermissions();
  }, [project]);

  return { permissions, role, loading };
}

function getPermissionsForRole(role: Role): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageUsers: true,
        canManageProjects: true,
      };

    case 'editor':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManageUsers: false,
        canManageProjects: true,
      };

    case 'read_write':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false,
        canManageUsers: false,
        canManageProjects: false,
      };

    case 'read_only':
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canManageProjects: false,
      };

    default:
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageUsers: false,
        canManageProjects: false,
      };
  }
}
