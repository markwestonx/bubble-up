'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const error_param = searchParams.get('error');
      const error_description = searchParams.get('error_description');
      const next = searchParams.get('next') || '/reset-password';

      // Handle errors from Supabase
      if (error_param) {
        const errorMsg = error_description || error_param;
        setError(decodeURIComponent(errorMsg));
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      const supabase = createClient();

      // Handle PKCE flow (code parameter)
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error('Error exchanging code:', exchangeError);
          setError(exchangeError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Successfully authenticated
        router.push(next);
        return;
      }

      // Handle token_hash flow (recovery links)
      if (token_hash && type) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: type as any,
          token_hash,
        });

        if (verifyError) {
          console.error('Error verifying token:', verifyError);
          setError(verifyError.message);
          setTimeout(() => router.push('/login'), 2000);
          return;
        }

        // Successfully authenticated
        router.push(next);
        return;
      }

      // No auth parameters found
      setError('No authentication code found');
      setTimeout(() => router.push('/login'), 2000);
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-700 dark:text-gray-300">Authenticating...</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
