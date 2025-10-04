import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project');

    if (!project) {
      return NextResponse.json({ error: 'Project parameter is required' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get users with roles for this project or ALL projects
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('user_project_roles')
      .select('user_id')
      .or(`project.eq.${project},project.eq.ALL`);

    if (rolesError) {
      return NextResponse.json({ error: rolesError.message }, { status: 500 });
    }

    const userIds = [...new Set(roles?.map(r => r.user_id) || [])];

    if (userIds.length === 0) {
      return NextResponse.json({ users: [] });
    }

    // Get user emails
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const users = authData.users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        id: user.id,
        email: user.email
      }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Error fetching project users:', err);
    return NextResponse.json({ error: 'Failed to fetch project users' }, { status: 500 });
  }
}
