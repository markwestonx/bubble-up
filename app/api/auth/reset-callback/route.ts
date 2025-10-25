import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    // No code, redirect to login with error
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  // Create server-side Supabase client
  const supabase = await createClient();

  // Exchange the code for a session (server-side, no PKCE verifier needed for recovery)
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error);
    return NextResponse.redirect(new URL('/login?error=invalid_code', request.url));
  }

  // Session is now established via cookies
  // Redirect to reset password page
  return NextResponse.redirect(new URL('/reset-password', request.url));
}
