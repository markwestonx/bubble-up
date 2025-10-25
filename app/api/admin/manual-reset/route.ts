import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Generate secure temporary password
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const tempPassword = `Reset${new Date().getFullYear()}${randomPart}!`;

    // Get the user by email
    const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();

    if (getUserError) {
      return NextResponse.json(
        { error: `Failed to find user: ${getUserError.message}` },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's password and set flag to require change
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      {
        password: tempPassword,
        user_metadata: {
          requires_password_change: true,
          temp_password_created_at: new Date().toISOString()
        }
      }
    );

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to reset password: ${updateError.message}` },
        { status: 500 }
      );
    }

    console.log('Password manually reset for:', email);

    return NextResponse.json({
      message: 'Password reset successfully',
      email,
      tempPassword,
      warning: 'Share this temporary password securely with the user. They must change it on first login.'
    });
  } catch (err) {
    console.error('Error in manual password reset:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
