import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/access-log
 * Log a user access event (successful or failed login)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, eventType, metadata } = body;

    if (!email || !eventType) {
      return NextResponse.json(
        { error: 'email and eventType are required' },
        { status: 400 }
      );
    }

    if (!['login_success', 'login_failure'].includes(eventType)) {
      return NextResponse.json(
        { error: 'eventType must be login_success or login_failure' },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Insert access log
    const { data, error } = await supabaseAdmin
      .from('user_access_logs')
      .insert({
        user_id: userId || null,
        email,
        event_type: eventType,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log access event:', error);
      return NextResponse.json(
        { error: 'Failed to log access event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, log: data });
  } catch (err) {
    console.error('Error logging access event:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/access-log?userId=xxx
 * Get access logs for a user (admin only or own logs)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { data, error } = await supabaseAdmin
      .from('user_access_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch access logs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch access logs' },
        { status: 500 }
      );
    }

    return NextResponse.json({ logs: data });
  } catch (err) {
    console.error('Error fetching access logs:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
