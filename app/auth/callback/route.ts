import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Successfully authenticated
    return NextResponse.redirect(`${requestUrl.origin}${next}`);
  }

  // If no token_hash, return error
  return NextResponse.redirect(`${requestUrl.origin}/login?error=${encodeURIComponent('Invalid authentication link')}`);
}
