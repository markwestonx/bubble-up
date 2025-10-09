'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle magic link tokens that accidentally end up here
  useEffect(() => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    if (token_hash && type) {
      // Redirect to proper callback route
      router.replace(`/auth/callback?token_hash=${token_hash}&type=${type}`);
    }
  }, [searchParams, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Log failed login attempt
        try {
          console.log('🔐 Logging failed login for:', email);
          const logResponse = await fetch('/api/access-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              eventType: 'login_failure',
              metadata: {
                error: signInError.message,
                timestamp: new Date().toISOString()
              }
            }),
            // Use keepalive to ensure request completes
            keepalive: true
          });

          if (!logResponse.ok) {
            const errorData = await logResponse.json();
            console.error('❌ Failed to log access attempt:', logResponse.status, errorData);
          } else {
            console.log('✅ Failed login logged successfully');
          }
        } catch (logError) {
          console.error('❌ Error calling access-log API:', logError);
        }

        // Generic error message for security
        setError('Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      if (data.session) {
        // Log successful login
        try {
          console.log('🔐 Logging successful login for:', email, 'userId:', data.session.user.id);
          const logResponse = await fetch('/api/access-log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.session.user.id,
              email,
              eventType: 'login_success',
              metadata: {
                timestamp: new Date().toISOString()
              }
            }),
            // Use keepalive to ensure request completes even if page navigates away
            keepalive: true
          });

          if (!logResponse.ok) {
            const errorData = await logResponse.json();
            console.error('❌ Failed to log access attempt:', logResponse.status, errorData);
          } else {
            console.log('✅ Access log created successfully');
          }
        } catch (logError) {
          console.error('❌ Error calling access-log API:', logError);
        }

        // Check if user needs to change password
        const user = data.session.user;
        if (user.user_metadata?.requires_password_change) {
          router.push('/profile?must_change_password=true');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            BubbleUp
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Backlog Management System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Don't have an account? email </span>
          <a
            href="mailto:mark.weston@regulativ.ai?subject=BubbleUp%20user%20access%20request&body=Hi%20Mark%2C%20please%20set%20me%20up%20with%20a%20user%20account%20on%20BubbleUp.%20And%20then%20let%27s%20connect%20on%20which%20projects%20and%20level%20of%20access%20are%20required."
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            mark.weston@regulativ.ai
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center"><div className="text-gray-900 dark:text-gray-100">Loading...</div></div>}>
      <LoginForm />
    </Suspense>
  );
}
