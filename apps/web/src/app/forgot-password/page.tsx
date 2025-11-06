'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import Link from 'next/link';

const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email) {
      success
      message
    }
  }
`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: (_data) => {
      setSubmitted(true);
      setError('');
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    await requestReset({ variables: { email } });
  };

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
          <p className="mt-2 text-gray-400">Reset your password</p>
        </div>

        {/* Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl shadow-xl p-8">
          {!submitted ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-sm mb-6">
                No worries! Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cosmos-500 focus:border-transparent transition"
                    placeholder="astronaut@example.com"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              {/* Back to Login Link */}
              <div className="mt-6 text-center text-sm text-gray-400">
                Remember your password?{' '}
                <Link href="/login" className="text-cosmos-400 hover:text-cosmos-300 font-semibold transition">
                  Sign in
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
                <p className="text-gray-400 text-sm mb-6">
                  We've sent a password reset link to <span className="text-white font-medium">{email}</span>
                </p>
                <div className="bg-cosmos-500/10 border border-cosmos-500/30 rounded-lg p-4 text-left mb-6">
                  <p className="text-sm text-gray-300 mb-2">📧 Next steps:</p>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>• Check your inbox for the reset link</li>
                    <li>• Click the link to create a new password</li>
                    <li>• Link expires in 1 hour</li>
                    <li>• Check spam folder if you don't see it</li>
                  </ul>
                </div>

                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-cosmos-400 hover:text-cosmos-300 transition"
                >
                  Didn't receive the email? Try again
                </button>
              </div>

              <div className="mt-6 text-center text-sm text-gray-400">
                <Link href="/login" className="text-cosmos-400 hover:text-cosmos-300 font-semibold transition">
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-400 transition">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
