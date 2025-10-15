import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Hero } from '@/components/home/Hero';
import { FeaturedVideos } from '@/components/home/FeaturedVideos';
import { Features } from '@/components/home/Features';
import { GalaxyBackgroundWrapper } from '@/components/home/GalaxyBackgroundWrapper';

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      {/* Fixed galaxy background for entire page */}
      <GalaxyBackgroundWrapper />

      {/* Content layers */}
      <div className="relative z-10">
        <Navigation />
        <main>
          <Hero />
          <FeaturedVideos />
          <Features />
        </main>
      </div>
      <footer className="relative border-t border-gray-800/50 bg-black/70 py-12 backdrop-blur-md">
        <div className="container relative z-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white drop-shadow-md">CosmoStream</h3>
              <p className="text-sm text-gray-300 drop-shadow-sm">
                Your gateway to space, astronomy, and astrophysics content.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white drop-shadow-md">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-300 drop-shadow-sm">
                <li>
                  <Link href="/browse" className="transition-colors hover:text-cosmos-400">
                    Browse Videos
                  </Link>
                </li>
                <li>
                  <Link href="/sky-map" className="transition-colors hover:text-cosmos-400">
                    Sky Map
                  </Link>
                </li>
                <li>
                  <Link href="/missions" className="transition-colors hover:text-cosmos-400">
                    Live Missions
                  </Link>
                </li>
                <li>
                  <Link href="/learn" className="transition-colors hover:text-cosmos-400">
                    Learning Paths
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white drop-shadow-md">Community</h4>
              <ul className="space-y-2 text-sm text-gray-300 drop-shadow-sm">
                <li>
                  <Link href="/forums" className="transition-colors hover:text-cosmos-400">
                    Forums
                  </Link>
                </li>
                <li>
                  <Link href="/creators" className="transition-colors hover:text-cosmos-400">
                    Become a Creator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold text-white drop-shadow-md">Company</h4>
              <ul className="space-y-2 text-sm text-gray-300 drop-shadow-sm">
                <li>
                  <Link href="/about" className="transition-colors hover:text-cosmos-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="transition-colors hover:text-cosmos-400">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="transition-colors hover:text-cosmos-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800/50 pt-8 text-center text-sm text-gray-400 drop-shadow-sm">
            &copy; {new Date().getFullYear()} CosmoStream. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
