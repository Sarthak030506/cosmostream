'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';

export default function SkyMapPage() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };
    checkMobile();

    // Check if we've already asked for permission
    const savedPermission = localStorage.getItem('skymap-location-permission');

    if (savedPermission === 'granted') {
      // Get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
            setPermissionStatus('granted');
          },
          () => {
            // Permission was granted before but now failed - use default
            setLocation({ lat: 0, lng: 0 });
            setPermissionStatus('denied');
          }
        );
      }
    } else if (savedPermission === 'denied') {
      // Previously denied - use default location
      setLocation({ lat: 0, lng: 0 });
      setPermissionStatus('denied');
    } else {
      // First visit - show permission prompt
      setShowPermissionPrompt(true);
    }
  }, []);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setPermissionStatus('granted');
          localStorage.setItem('skymap-location-permission', 'granted');
          setShowPermissionPrompt(false);
        },
        () => {
          // Permission denied
          setLocation({ lat: 0, lng: 0 });
          setPermissionStatus('denied');
          localStorage.setItem('skymap-location-permission', 'denied');
          setShowPermissionPrompt(false);
        }
      );
    } else {
      // Geolocation not supported
      setLocation({ lat: 0, lng: 0 });
      setPermissionStatus('denied');
      localStorage.setItem('skymap-location-permission', 'denied');
      setShowPermissionPrompt(false);
    }
  };

  const denyLocation = () => {
    setLocation({ lat: 0, lng: 0 });
    setPermissionStatus('denied');
    localStorage.setItem('skymap-location-permission', 'denied');
    setShowPermissionPrompt(false);
  };

  // Generate Stellarium embed URL - Use desktop version
  const getStellariumURL = () => {
    // Use the full desktop interface bypassing mobile redirect
    const baseUrl = 'https://stellarium-web.org';

    if (!location) return baseUrl;

    const now = new Date();
    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      lon: location.lng.toString(), // Stellarium uses 'lon' too
      fov: '80',
      date: now.toISOString(),
      show_atmosphere: '1',
      show_landscape: '1',
      show_constellations: '1',
      show_constellation_lines: '1',
      show_constellation_labels: '1',
    });

    // Force desktop mode by using the full app URL structure
    return `${baseUrl}/#${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Location Permission Prompt */}
      {showPermissionPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-2xl font-bold text-white mb-2">Enable Location</h2>
              <p className="text-gray-400">
                Allow CosmoStream to access your location to show you an accurate view of the night sky from your position.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={requestLocation}
                className="w-full px-6 py-3 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white rounded-lg font-semibold transition"
              >
                Enable Location
              </button>
              <button
                onClick={denyLocation}
                className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition"
              >
                Use Default Location
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-4 text-center">
              Your location is only used to customize the sky view and is never stored on our servers.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="min-h-screen pt-20 pb-4 px-2 sm:px-4">
        <div className="max-w-[1920px] mx-auto flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:h-[calc(100vh-6rem)]">
          {/* Stellarium Embed - Full Height */}
          <div className="lg:col-span-3 order-1" style={{ height: 'calc(100vh - 10rem)' }}>
            <div className="h-full w-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              {location ? (
                <>
                  {isMobile ? (
                    // Mobile: Show branded illustration and app links
                    <div className="flex-1 w-full flex items-center justify-center p-6">
                      <div className="text-center max-w-lg">
                        {/* CosmoStream Branded Illustration */}
                        <div className="mb-6 relative">
                          <div className="text-8xl mb-4 animate-pulse">🌌</div>
                          <div className="flex justify-center gap-3 text-4xl mb-2">
                            <span className="animate-bounce" style={{ animationDelay: '0ms' }}>⭐</span>
                            <span className="animate-bounce" style={{ animationDelay: '150ms' }}>🪐</span>
                            <span className="animate-bounce" style={{ animationDelay: '300ms' }}>🌙</span>
                          </div>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-3">Interactive Sky Map</h3>
                        <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                          Explore the night sky with Stellarium Web's professional-grade planetarium.
                          View stars, planets, constellations, and more in real-time.
                        </p>

                        {/* Open Full Sky Map Button */}
                        <a
                          href="https://stellarium-web.org/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cosmos-600 to-nebula-600 hover:from-cosmos-500 hover:to-nebula-500 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:shadow-cosmos-500/50 mb-6 text-base"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Open Full Sky Map
                        </a>

                        {/* Mobile App Links */}
                        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-4">
                          <p className="text-xs text-gray-400 mb-3">
                            💡 For the best mobile experience, download the Stellarium Mobile app:
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <a
                              href="https://apps.apple.com/app/stellarium-mobile-sky-map/id1458716890"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                              </svg>
                              App Store
                            </a>
                            <a
                              href="https://play.google.com/store/apps/details?id=com.noctuasoftware.stellarium_free"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition text-sm font-medium"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626c.591.342.591 1.156 0 1.498l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                              </svg>
                              Google Play
                            </a>
                          </div>
                        </div>

                        {/* Alternative Tip */}
                        <p className="text-xs text-gray-600">
                          Or open the sky map in your desktop browser for the embedded experience
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Desktop/Tablet: Show embedded iframe
                    <div className="flex-1 w-full relative" style={{ minHeight: '400px' }}>
                      <iframe
                        src={getStellariumURL()}
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 'none' }}
                        allow="geolocation"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        referrerPolicy="no-referrer"
                        title="Stellarium Web - Interactive Sky Map"
                      />
                    </div>
                  )}
                  {/* Attribution Footer */}
                  <div className="flex-shrink-0 bg-gray-950/90 backdrop-blur-sm border-t border-gray-800 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-500">
                      <span className="text-[10px] sm:text-xs">Sky map powered by</span>
                      <a
                        href="https://stellarium-web.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cosmos-400 hover:text-cosmos-300 font-semibold text-[10px] sm:text-xs"
                      >
                        Stellarium Web
                      </a>
                    </div>
                    <a
                      href={`https://stellarium-web.org/?lat=${location.lat}&lng=${location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 sm:px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs whitespace-nowrap"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="hidden xs:inline">Full Sky Map</span>
                      <span className="xs:hidden">Expand</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cosmos-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading sky map...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Links Sidebar */}
          <div className="lg:col-span-1 lg:h-full overflow-y-auto space-y-3 sm:space-y-4 order-2">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Explore More</h2>

            {/* Astronomy Videos */}
            <Link
              href="/browse?category=Astronomy"
              className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-cosmos-500 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/20 group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🎬</div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-cosmos-400 transition">
                Astronomy Videos
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Watch educational content about the night sky and celestial objects
              </p>
            </Link>

            {/* Live Missions */}
            <Link
              href="/live-missions"
              className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-nebula-500 transition-all duration-300 hover:shadow-lg hover:shadow-nebula-500/20 group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">🚀</div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-nebula-400 transition">
                Live Space Missions
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Track active space missions and satellite positions in real-time
              </p>
            </Link>

            {/* Learning Resources */}
            <Link
              href="/discover?type=Tutorials"
              className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-cosmos-500 transition-all duration-300 hover:shadow-lg hover:shadow-cosmos-500/20 group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📚</div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-cosmos-400 transition">
                Learning Resources
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Access tutorials and guides to understand astronomy concepts
              </p>
            </Link>

            {/* Upload Observation */}
            <Link
              href="/upload"
              className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-nebula-500 transition-all duration-300 hover:shadow-lg hover:shadow-nebula-500/20 group"
            >
              <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">📸</div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1 group-hover:text-nebula-400 transition">
                Share Your Observations
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Upload your astrophotography and observations to share with the community
              </p>
            </Link>

            {/* How to Use */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="text-xl sm:text-2xl mb-1 sm:mb-2">💡</div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-2 sm:mb-3">How to Use</h3>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cosmos-400 mt-0.5">•</span>
                  <span>Click and drag to rotate the sky view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmos-400 mt-0.5">•</span>
                  <span>Use scroll wheel to zoom in/out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmos-400 mt-0.5">•</span>
                  <span>Search for celestial objects using the search bar</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmos-400 mt-0.5">•</span>
                  <span>Click on stars and planets for detailed information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cosmos-400 mt-0.5">•</span>
                  <span>Use time controls to simulate different dates and times</span>
                </li>
              </ul>
            </div>

            {/* Location Info */}
            {location && permissionStatus === 'granted' && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <div className="flex items-center gap-2 text-green-400 mb-1 sm:mb-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-semibold text-xs sm:text-sm">Your Location Active</span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-400">
                  Showing sky view from {Math.abs(location.lat).toFixed(2)}°{location.lat >= 0 ? 'N' : 'S'}, {Math.abs(location.lng).toFixed(2)}°{location.lng >= 0 ? 'E' : 'W'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
