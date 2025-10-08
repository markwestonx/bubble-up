import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

// GET: Get all user project roles or roles for specific user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let query = supabaseAdmin
      .from('user_project_roles')
      .select('*')
      .order('project', { ascending: true });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ roles: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch user roles' }, { status: 500 });
  }
}

// POST: Assign role to user for a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, project, role } = body;

    if (!userId || !project || !role) {
      return NextResponse.json(
        { error: 'userId, project, and role are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'editor', 'contributor', 'read_only'].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be admin, editor, contributor, or read_only' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Upsert: update if exists, insert if not
    const { data, error } = await supabaseAdmin
      .from('user_project_roles')
      .upsert({
        user_id: userId,
        project,
        role,
      }, {
        onConflict: 'user_id,project'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ role: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
  }
}

// DELETE: Remove user's role from a project
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const project = searchParams.get('project');

    if (!userId || !project) {
      return NextResponse.json(
        { error: 'userId and project are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Delete the role
    const { error } = await supabaseAdmin
      .from('user_project_roles')
      .delete()
      .eq('user_id', userId)
      .eq('project', project);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if user has any remaining roles
    const { data: remainingRoles, error: checkError } = await supabaseAdmin
      .from('user_project_roles')
      .select('id')
      .eq('user_id', userId);

    if (checkError) {
      console.error('Failed to check remaining roles:', checkError);
    }

    // If user has no more roles, delete them from Supabase Auth
    if (!remainingRoles || remainingRoles.length === 0) {
      const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteUserError) {
        console.error('Failed to delete user from auth:', deleteUserError);
        return NextResponse.json({
          success: true,
          warning: 'Role deleted but failed to remove user from auth system'
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to remove role' }, { status: 500 });
  }
}
