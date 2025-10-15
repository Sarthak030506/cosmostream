import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden py-20 sm:py-32">
      {/* Content */}
      <div className="container relative z-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-2xl sm:text-6xl" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8)' }}>
            Your Gateway to the{' '}
            <span className="bg-gradient-to-r from-nebula-400 to-nebula-600 bg-clip-text text-transparent drop-shadow-2xl" style={{ textShadow: '0 4px 20px rgba(217, 70, 239, 0.6)' }}>
              Cosmos
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-100 drop-shadow-lg" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 4px rgba(0, 0, 0, 0.8)' }}>
            Stream high-quality space, astronomy, and astrophysics content. Explore interactive
            sky maps, track live missions, and learn from expert creators.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup" className="btn-primary text-base px-6 py-3">
              Start Exploring
            </Link>
            <Link
              href="/browse"
              className="text-base font-semibold leading-7 text-white hover:text-nebula-300"
            >
              Browse Videos <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        {/* Feature highlights with premium glassmorphism */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.08] hover:border-nebula-400/70 hover:from-gray-900/95 hover:to-gray-950/95 hover:shadow-nebula-500/50">
            {/* Animated gradient orb */}
            <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse rounded-full bg-gradient-radial from-nebula-500/30 via-nebula-600/15 to-transparent blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:from-nebula-500/40" />

            {/* Dark background for better readability */}
            <div className="pointer-events-none absolute inset-0 bg-black/20" />

            {/* Glass reflection effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nebula-400 to-nebula-600 shadow-lg shadow-nebula-500/50 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white drop-shadow-md">Premium Content</h3>
              <p className="mt-2 text-sm text-gray-100 drop-shadow-sm">
                4K streaming of documentaries, lectures, and live space events
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.08] hover:border-cosmos-400/70 hover:from-gray-900/95 hover:to-gray-950/95 hover:shadow-cosmos-500/50">
            {/* Animated gradient orb */}
            <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse rounded-full bg-gradient-radial from-cosmos-500/30 via-cosmos-600/15 to-transparent blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:from-cosmos-500/40" />

            {/* Dark background for better readability */}
            <div className="pointer-events-none absolute inset-0 bg-black/20" />

            {/* Glass reflection effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cosmos-400 to-cosmos-600 shadow-lg shadow-cosmos-500/50 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white drop-shadow-md">Interactive Sky Maps</h3>
              <p className="mt-2 text-sm text-gray-100 drop-shadow-sm">
                Real-time celestial visualizations powered by NASA data
              </p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-500 hover:scale-[1.08] hover:border-nebula-400/70 hover:from-gray-900/95 hover:to-gray-950/95 hover:shadow-nebula-500/50">
            {/* Animated gradient orb */}
            <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse rounded-full bg-gradient-radial from-nebula-500/30 via-nebula-600/15 to-transparent blur-3xl transition-all duration-700 group-hover:scale-125 group-hover:from-nebula-500/40" />

            {/* Dark background for better readability */}
            <div className="pointer-events-none absolute inset-0 bg-black/20" />

            {/* Glass reflection effect */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="relative z-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-nebula-400 to-nebula-600 shadow-lg shadow-nebula-500/50 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white drop-shadow-md">Learning Paths</h3>
              <p className="mt-2 text-sm text-gray-100 drop-shadow-sm">
                Curated courses from intro astronomy to advanced astrophysics
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
