'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function Navigation() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cosmos-gradient">
              <span className="text-xl font-bold">C</span>
            </div>
            <span className="text-xl font-bold">CosmoStream</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            <Link href="/browse" className="text-sm hover:text-cosmos-400">
              Browse
            </Link>
            <Link href="/discover" className="text-sm hover:text-cosmos-400">
              Discover
            </Link>
            <Link href="/categories" className="text-sm hover:text-cosmos-400">
              Categories
            </Link>
            <Link href="/sky-map" className="text-sm hover:text-cosmos-400">
              Sky Map
            </Link>
            <Link href="/missions" className="text-sm hover:text-cosmos-400">
              Live Missions
            </Link>
            <Link href="/learn" className="text-sm hover:text-cosmos-400">
              Learn
            </Link>
            <Link href="/forums" className="text-sm hover:text-cosmos-400">
              Forums
            </Link>
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden items-center space-x-4 md:flex">
            {user ? (
              <>
                {/* Upload Button (Creators only) */}
                {user.role === 'CREATOR' && (
                  <Link
                    href="/upload"
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white text-sm font-semibold rounded-lg transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 hover:text-cosmos-400 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cosmos-500 to-nebula-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm">{user.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-lg shadow-xl py-2">
                      <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">
                        Profile
                      </Link>
                      {user.role === 'CREATOR' && (
                        <>
                          <Link href="/dashboard/videos" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">
                            My Videos
                          </Link>
                          <Link href="/analytics" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">
                            Analytics
                          </Link>
                        </>
                      )}
                      <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-gray-800 transition">
                        Settings
                      </Link>
                      <hr className="my-2 border-gray-800" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-800 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm hover:text-cosmos-400">
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-800 py-4 md:hidden">
            <div className="flex flex-col space-y-4">
              <Link href="/browse" className="text-sm hover:text-cosmos-400">
                Browse
              </Link>
              <Link href="/discover" className="text-sm hover:text-cosmos-400">
                Discover
              </Link>
              <Link href="/categories" className="text-sm hover:text-cosmos-400">
                Categories
              </Link>
              <Link href="/sky-map" className="text-sm hover:text-cosmos-400">
                Sky Map
              </Link>
              <Link href="/missions" className="text-sm hover:text-cosmos-400">
                Live Missions
              </Link>
              <Link href="/learn" className="text-sm hover:text-cosmos-400">
                Learn
              </Link>
              <Link href="/forums" className="text-sm hover:text-cosmos-400">
                Forums
              </Link>
              <div className="border-t border-gray-800 pt-4">
                <Link href="/login" className="block text-sm hover:text-cosmos-400">
                  Sign In
                </Link>
                <Link href="/signup" className="mt-2 block btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
