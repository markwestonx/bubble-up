import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type Role = 'admin' | 'editor' | 'read_write' | 'read_only';

export interface UserPermissions {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageProjects: boolean;
}

/**
 * Get user's role for a specific project
 */
export async function getUserRole(userId: string, project: string): Promise<Role | null> {
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Check for specific project role first
  const { data: projectRole } = await supabaseAdmin
    .from('user_project_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('project', project)
    .single();

  if (projectRole) {
    return projectRole.role as Role;
  }

  // Check for "ALL" projects role
  const { data: allProjectsRole } = await supabaseAdmin
    .from('user_project_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('project', 'ALL')
    .single();

  if (allProjectsRole) {
    return allProjectsRole.role as Role;
  }

  return null;
}

/**
 * Get user's permissions based on their role
 */
export function getPermissionsForRole(role: Role | null): UserPermissions {
  if (!role) {
    // No role = no access
    return {
      canView: false,
      canCreate: false,
      canEdit: false,
      canDelete: false,
      canManageUsers: false,
      canManageProjects: false,
    };
  }

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
        canDelete: false, // Cannot delete projects
        canManageUsers: false,
        canManageProjects: true, // Can modify project details
      };

    case 'read_write':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false, // Cannot delete
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

/**
 * Check if user has permission for an action on a project
 */
export async function checkPermission(
  userId: string,
  project: string,
  action: keyof UserPermissions
): Promise<boolean> {
  const role = await getUserRole(userId, project);
  const permissions = getPermissionsForRole(role);
  return permissions[action];
}

/**
 * Middleware helper to check permissions in API routes
 */
export async function requirePermission(
  userId: string | undefined,
  project: string,
  action: keyof UserPermissions
): Promise<{ authorized: boolean; error?: string }> {
  if (!userId) {
    return { authorized: false, error: 'Not authenticated' };
  }

  const hasPermission = await checkPermission(userId, project, action);

  if (!hasPermission) {
    const role = await getUserRole(userId, project);
    return {
      authorized: false,
      error: `Insufficient permissions. Your role: ${role || 'none'}. Required: ${action}`
    };
  }

  return { authorized: true };
}
