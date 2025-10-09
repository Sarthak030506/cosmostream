import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cosmos-gradient py-20 sm:py-32">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10"></div>
      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Your Gateway to the{' '}
            <span className="bg-gradient-to-r from-nebula-400 to-nebula-600 bg-clip-text text-transparent">
              Cosmos
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-200">
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

        {/* Feature highlights */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nebula-500">
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
            <h3 className="mt-4 text-lg font-semibold text-white">Premium Content</h3>
            <p className="mt-2 text-sm text-gray-200">
              4K streaming of documentaries, lectures, and live space events
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cosmos-500">
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
            <h3 className="mt-4 text-lg font-semibold text-white">Interactive Sky Maps</h3>
            <p className="mt-2 text-sm text-gray-200">
              Real-time celestial visualizations powered by NASA data
            </p>
          </div>

          <div className="rounded-lg bg-white/10 p-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-nebula-500">
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
            <h3 className="mt-4 text-lg font-semibold text-white">Learning Paths</h3>
            <p className="mt-2 text-sm text-gray-200">
              Curated courses from intro astronomy to advanced astrophysics
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
