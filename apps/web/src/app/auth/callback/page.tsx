'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      console.error('OAuth error:', error);
      router.push('/login?error=' + error);
      return;
    }

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user info and store it
      fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query Me {
              me {
                id
                email
                name
                role
              }
            }
          `,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.data?.me) {
            localStorage.setItem('user', JSON.stringify(data.data.me));
            // Force full page reload to refresh navigation state
            window.location.href = '/';
          } else {
            window.location.href = '/login?error=failed_to_get_user';
          }
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error);
          window.location.href = '/login?error=failed_to_get_user';
        });
    } else {
      // No tokens found, redirect to login
      router.push('/login?error=no_tokens');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-cosmos-950 to-gray-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cosmos-400 to-nebula-400 bg-clip-text text-transparent">
              CosmoStream
            </h1>
          </Link>
        </div>

        {/* Loading State */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cosmos-500/20 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmos-500"></div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Completing Sign In...</h2>
          <p className="text-gray-400 text-sm">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-950 via-cosmos-950 to-gray-950 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cosmos-500/20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cosmos-500"></div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
