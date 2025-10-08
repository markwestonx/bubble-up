import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  console.log('Auth callback:', { token_hash: token_hash?.substring(0, 10), type, code: code?.substring(0, 10), next });

  const supabase = await createClient();

  // Handle PKCE flow (code parameter)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    console.log('Code exchanged successfully, redirecting to:', next);
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // Handle legacy token_hash flow
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    console.log('OTP verified successfully, redirecting to:', next);
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // If neither code nor token_hash, return error
  console.error('No code or token_hash in callback');
  return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Invalid authentication link')}`);
}
