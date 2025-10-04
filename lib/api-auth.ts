import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type UserRole = 'Admin' | 'Editor' | 'Contributor' | 'Read Only';

export interface AuthContext {
  userId: string;
  userEmail: string;
  role: UserRole | null;
  project: string;
}

/**
 * Authenticate API request and check role-based permissions
 * @param request NextRequest object
 * @param requiredRoles Roles allowed to access this endpoint
 * @param requireProject Whether project parameter is required
 * @returns AuthContext if authenticated, error object if not
 */
export async function authenticateRequest(
  request: NextRequest,
  requiredRoles: UserRole[] = [],
  requireProject: boolean = true
): Promise<{ success: true; context: AuthContext } | { success: false; error: string; status: number }> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Missing or invalid authorization header. Expected: Authorization: Bearer <token>',
        status: 401
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return {
        success: false,
        error: 'Invalid or expired token',
        status: 401
      };
    }

    // Get project from query params or body
    const { searchParams } = new URL(request.url);
    let project = searchParams.get('project');

    // If not in query params, try to get from request body (for POST/PUT/PATCH)
    if (!project && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH')) {
      try {
        const body = await request.clone().json();
        project = body.project;
      } catch {
        // Body not JSON or empty
      }
    }

    if (requireProject && !project) {
      return {
        success: false,
        error: 'Project parameter is required',
        status: 400
      };
    }

    // Get user's role for this project
    let userRole: UserRole | null = null;

    if (project) {
      const { data: roleData, error: roleError } = await supabaseAdmin
        .from('user_project_roles')
        .select('role')
        .eq('user_id', user.id)
        .or(`project.eq.${project},project.eq.ALL`)
        .single();

      if (!roleError && roleData) {
        userRole = roleData.role as UserRole;
      }
    }

    // Check if user has required role
    if (requiredRoles.length > 0 && !requiredRoles.includes(userRole!)) {
      return {
        success: false,
        error: `Insufficient permissions. Required roles: ${requiredRoles.join(', ')}. Your role: ${userRole || 'None'}`,
        status: 403
      };
    }

    return {
      success: true,
      context: {
        userId: user.id,
        userEmail: user.email || 'unknown',
        role: userRole,
        project: project || ''
      }
    };
  } catch (err) {
    console.error('Authentication error:', err);
    return {
      success: false,
      error: 'Internal server error during authentication',
      status: 500
    };
  }
}

/**
 * Helper to check if role has write permissions
 */
export function canWrite(role: UserRole | null): boolean {
  return role === 'Admin' || role === 'Editor' || role === 'Contributor';
}

/**
 * Helper to check if role has admin permissions
 */
export function isAdmin(role: UserRole | null): boolean {
  return role === 'Admin';
}

/**
 * Helper to check if role has editor permissions
 */
export function isEditorOrAdmin(role: UserRole | null): boolean {
  return role === 'Admin' || role === 'Editor';
}
