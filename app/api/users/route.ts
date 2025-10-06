import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const { error: authError, user } = await requireAuth();
    if (authError) return authError;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({
        error: 'Server configuration error',
        users: []
      }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Supabase error listing users:', error);
      return NextResponse.json({ error: error.message, users: [] }, { status: 500 });
    }

    const users = data.users.map(user => ({
      id: user.id,
      email: user.email
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    return NextResponse.json({
      error: 'Failed to fetch users',
      details: err instanceof Error ? err.message : String(err),
      users: []
    }, { status: 500 });
  }
}
