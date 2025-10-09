import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Hero } from '@/components/home/Hero';
import { FeaturedVideos } from '@/components/home/FeaturedVideos';
import { Features } from '@/components/home/Features';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <FeaturedVideos />
        <Features />
      </main>
      <footer className="border-t border-gray-800 bg-gray-950 py-12">
        <div className="container">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">CosmoStream</h3>
              <p className="text-sm text-gray-400">
                Your gateway to space, astronomy, and astrophysics content.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/browse" className="hover:text-cosmos-400">
                    Browse Videos
                  </Link>
                </li>
                <li>
                  <Link href="/sky-map" className="hover:text-cosmos-400">
                    Sky Map
                  </Link>
                </li>
                <li>
                  <Link href="/missions" className="hover:text-cosmos-400">
                    Live Missions
                  </Link>
                </li>
                <li>
                  <Link href="/learn" className="hover:text-cosmos-400">
                    Learning Paths
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Community</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/forums" className="hover:text-cosmos-400">
                    Forums
                  </Link>
                </li>
                <li>
                  <Link href="/creators" className="hover:text-cosmos-400">
                    Become a Creator
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-cosmos-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-cosmos-400">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-cosmos-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} CosmoStream. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
