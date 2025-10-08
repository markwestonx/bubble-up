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

    // Create user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'A1!';

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true
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

    // Send password reset email to the new user
    console.log('Sending password reset email to:', email);

    const { data: resetData, error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(email);

    if (resetError) {
      console.error('Failed to send invite email:', resetError);
      return NextResponse.json({
        error: `User created but email failed: ${resetError.message}`,
        userId: newUser.user.id,
        email,
        message: 'User created successfully but failed to send invite email. Please use "Reset Password" button.'
      }, { status: 500 });
    }

    console.log('Password reset email sent successfully:', resetData);

    return NextResponse.json({
      message: 'User invited successfully! They will receive an email to set their password.',
      userId: newUser.user.id,
      email
    });
  } catch (err) {
    console.error('Error inviting user:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
