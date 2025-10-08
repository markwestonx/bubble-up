import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, project, projects } = body;

    // Support both single project and multiple projects
    const projectList = projects && Array.isArray(projects) && projects.length > 0
      ? projects
      : (project ? [project] : []);

    if (!email || !role || projectList.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: email, role, and at least one project' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Generate secure temporary password
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const tempPassword = `Welcome2024${randomPart}!`;

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        requires_password_change: true,
        temp_password_created_at: new Date().toISOString()
      }
    });

    if (createError) {
      return NextResponse.json(
        { error: `Failed to create user: ${createError.message}` },
        { status: 500 }
      );
    }

    // Assign roles for all selected projects
    const roleInserts = projectList.map(proj => ({
      user_id: newUser.user.id,
      project: proj,
      role
    }));

    const { error: roleError } = await supabaseAdmin
      .from('user_project_roles')
      .insert(roleInserts);

    if (roleError) {
      console.error('Failed to assign roles:', roleError);
    }

    // Return success with temporary password (for now, we'll display it in the UI)
    // TODO: Send email with temporary password once SMTP is configured
    console.log('User created with temporary password:', email);

    return NextResponse.json({
      message: `User created successfully! Temporary password: ${tempPassword}`,
      userId: newUser.user.id,
      email,
      tempPassword, // Include in response so admin can share it
      warning: 'Please share the temporary password with the user. They must change it on first login.'
    });
  } catch (err) {
    console.error('Error inviting user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
