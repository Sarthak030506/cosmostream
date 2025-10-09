'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

          {/* Auth Buttons */}
          <div className="hidden items-center space-x-4 md:flex">
            <Link href="/login" className="text-sm hover:text-cosmos-400">
              Sign In
            </Link>
            <Link href="/signup" className="btn-primary">
              Get Started
            </Link>
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
