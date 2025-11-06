'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { GalaxyBackgroundWrapper } from '@/components/home/GalaxyBackgroundWrapper';

export default function AboutPage() {
  const features = [
    {
      icon: '🎯',
      title: '370+ Specialized Categories',
      description: 'Content organized from beginner to expert level, covering every aspect of space exploration and astronomy.',
    },
    {
      icon: '✨',
      title: 'Curated Quality Content',
      description: 'Only high-quality space and astronomy videos from verified sources and trusted creators.',
    },
    {
      icon: '🌌',
      title: 'Interactive Tools',
      description: 'Access sky maps, live mission tracking, and real-time astronomical events all in one place.',
    },
    {
      icon: '🌍',
      title: 'Global Community',
      description: 'Connect with space enthusiasts, educators, and researchers from around the world.',
    },
    {
      icon: '🚫',
      title: 'Ad-Free Experience',
      description: 'Focus on learning and discovery without distractions. Pure content, pure exploration.',
    },
  ];

  const values = [
    {
      icon: '📚',
      title: 'Knowledge for All',
      description: 'Education and discovery should be accessible to everyone, regardless of background or experience level.',
    },
    {
      icon: '🤝',
      title: 'Community Driven',
      description: 'Built by and for space enthusiasts, with features shaped by our community\'s needs.',
    },
    {
      icon: '⭐',
      title: 'Quality First',
      description: 'We prioritize curated, verified, high-quality content over quantity.',
    },
    {
      icon: '🔍',
      title: 'Transparency',
      description: 'Open about our mission, funding, and roadmap. Your trust is our foundation.',
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'Continuously improving tools and features to enhance your cosmic journey.',
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* Galaxy Background */}
      <GalaxyBackgroundWrapper />

      {/* Content Layer */}
      <div className="relative z-10">
        <Navigation />

        <main className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
          {/* Hero Section */}
          <div className="mx-auto max-w-3xl text-center mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)' }}>
              Explore the Universe with{' '}
              <span className="bg-gradient-to-r from-cosmos-400 to-nebula-500 bg-clip-text text-transparent">
                CosmoStream
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
              The world's first social video platform dedicated to space, astronomy, and astrophysics
            </p>
          </div>

          {/* Mission Section */}
          <section className="mb-20">
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
                {/* Animated gradient orb */}
                <div className="absolute -right-12 -top-12 h-48 w-48 animate-pulse rounded-full bg-gradient-radial from-cosmos-500/30 via-cosmos-600/15 to-transparent blur-3xl" />

                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">Our Mission</h2>
                  <p className="text-lg text-gray-100 leading-relaxed text-center">
                    We believe everyone deserves access to high-quality space education and discovery.
                    CosmoStream connects space enthusiasts, educators, researchers, and curious minds through
                    curated content, interactive tools, and a thriving community dedicated to exploring the cosmos.
                    From your first glimpse of the night sky to advanced astrophysics research, we're here to
                    fuel your curiosity and expand your understanding of the universe.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What Makes Us Different */}
          <section className="mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)' }}>
              What Makes CosmoStream Different
            </h2>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
              More than just a video platform—your complete gateway to the cosmos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-2xl transition-all duration-500 hover:scale-105 hover:border-nebula-400/70"
                >
                  {/* Animated gradient orb */}
                  <div className="absolute -right-8 -top-8 h-32 w-32 animate-pulse rounded-full bg-gradient-radial from-nebula-500/30 via-nebula-600/15 to-transparent blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Dark background for readability */}
                  <div className="pointer-events-none absolute inset-0 bg-black/20" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cosmos-400 to-nebula-600 text-3xl mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Vision Section */}
          <section className="mb-20">
            <div className="mx-auto max-w-4xl">
              <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
                {/* Animated gradient orb */}
                <div className="absolute -left-12 -bottom-12 h-48 w-48 animate-pulse rounded-full bg-gradient-radial from-nebula-500/30 via-nebula-600/15 to-transparent blur-3xl" />

                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center">Our Vision</h2>
                  <p className="text-lg text-gray-100 leading-relaxed text-center">
                    We envision a world where knowledge about space and the universe is accessible to everyone—from
                    curious children taking their first look at the night sky to professional astronomers pushing
                    the boundaries of our understanding. CosmoStream is building that world, one video, one conversation,
                    one discovery at a time. Together, we're creating a future where the wonders of the cosmos inspire
                    and unite humanity.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Core Values */}
          <section className="mb-20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-4" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)' }}>
              Our Core Values
            </h2>
            <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
              The principles that guide everything we do
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-gray-900/90 to-gray-950/90 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-cosmos-400/70"
                >
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-4xl mb-3">{value.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{value.title}</h3>
                    <p className="text-sm text-gray-200 leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mb-20">
            <div className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-br from-cosmos-600/20 via-nebula-600/20 to-transparent p-12 sm:p-16 backdrop-blur-xl text-center">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-cosmos-600/10 to-nebula-600/10 animate-pulse" />

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.9)' }}>
                  Ready to Explore the Universe?
                </h2>
                <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.8)' }}>
                  Join our community of space enthusiasts and start your cosmic journey today
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/browse"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span>Start Exploring</span>
                  </Link>

                  <Link
                    href="/sky-map"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span>View Sky Map</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative border-t border-gray-800/50 bg-black/70 py-12 backdrop-blur-md">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              {/* CosmoStream Description */}
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">🌌</div>
                  <span className="text-xl font-bold text-white">CosmoStream</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your gateway to space, astronomy, and astrophysics content. Explore the cosmos with our community.
                </p>
              </div>

              {/* Platform Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Platform</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/browse" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Browse Videos
                    </Link>
                  </li>
                  <li>
                    <Link href="/sky-map" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Sky Map
                    </Link>
                  </li>
                  <li>
                    <Link href="/missions" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Live Missions
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Space News
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Community Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Community</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/forums" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Forums
                    </Link>
                  </li>
                  <li>
                    <Link href="/discover" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Discover Creators
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-300">Company</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/about" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="transition-colors text-gray-400 hover:text-cosmos-400">
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-12 border-t border-gray-800 pt-8 text-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} CosmoStream. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
