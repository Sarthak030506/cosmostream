'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { Navigation } from '@/components/layout/Navigation';

// Bright stars data (simplified - in production would use full star catalog)
const BRIGHT_STARS = [
  { name: 'Sirius', ra: 101.2875, dec: -16.7161, mag: -1.46, constellation: 'Canis Major' },
  { name: 'Canopus', ra: 95.9875, dec: -52.6958, mag: -0.74, constellation: 'Carina' },
  { name: 'Arcturus', ra: 213.9153, dec: 19.1824, mag: -0.05, constellation: 'Boötes' },
  { name: 'Vega', ra: 279.2347, dec: 38.7836, mag: 0.03, constellation: 'Lyra' },
  { name: 'Capella', ra: 79.1722, dec: 45.9981, mag: 0.08, constellation: 'Auriga' },
  { name: 'Rigel', ra: 78.6345, dec: -8.2017, mag: 0.13, constellation: 'Orion' },
  { name: 'Procyon', ra: 114.8253, dec: 5.2247, mag: 0.34, constellation: 'Canis Minor' },
  { name: 'Betelgeuse', ra: 88.7929, dec: 7.4070, mag: 0.50, constellation: 'Orion' },
  { name: 'Altair', ra: 297.6958, dec: 8.8683, mag: 0.77, constellation: 'Aquila' },
  { name: 'Aldebaran', ra: 68.9801, dec: 16.5093, mag: 0.85, constellation: 'Taurus' },
  { name: 'Spica', ra: 201.2983, dec: -11.1614, mag: 0.97, constellation: 'Virgo' },
  { name: 'Antares', ra: 247.3519, dec: -26.4320, mag: 1.09, constellation: 'Scorpius' },
  { name: 'Pollux', ra: 116.3289, dec: 28.0261, mag: 1.14, constellation: 'Gemini' },
  { name: 'Fomalhaut', ra: 344.4127, dec: -29.6219, mag: 1.16, constellation: 'Piscis Austrinus' },
  { name: 'Deneb', ra: 310.3580, dec: 45.2803, mag: 1.25, constellation: 'Cygnus' },
  { name: 'Regulus', ra: 152.0930, dec: 11.9672, mag: 1.35, constellation: 'Leo' },
];

// Convert celestial coordinates to 3D position
function celestialTo3D(ra: number, dec: number, distance: number = 50) {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;

  const x = distance * Math.cos(decRad) * Math.cos(raRad);
  const y = distance * Math.sin(decRad);
  const z = -distance * Math.cos(decRad) * Math.sin(raRad);

  return [x, y, z] as [number, number, number];
}

// Star component
function Star({ star, onClick }: any) {
  const position = celestialTo3D(star.ra, star.dec);
  const size = Math.max(0.3, 1.5 - star.mag * 0.2); // Brighter stars are larger

  return (
    <mesh position={position} onClick={() => onClick(star)}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={getMagnitudeColor(star.mag)} />
    </mesh>
  );
}

// Get color based on star magnitude
function getStarColor(temp: number = 5778) {
  if (temp > 10000) return '#9BB0FF'; // Blue
  if (temp > 7500) return '#CAD7FF';  // Blue-white
  if (temp > 6000) return '#F8F7FF';  // White
  if (temp > 5200) return '#FFF4E8';  // Yellow-white
  if (temp > 3700) return '#FFD2A1';  // Orange
  return '#FFB380';                    // Red
}

function getMagnitudeColor(mag: number) {
  // Brighter stars (lower magnitude) appear white/blue, dimmer ones yellow/red
  if (mag < 0) return '#FFFFFF';
  if (mag < 0.5) return '#E3F2FF';
  if (mag < 1.0) return '#FFF8E7';
  if (mag < 1.5) return '#FFE4B5';
  return '#FFD7A8';
}

// Sky sphere scene
function SkyScene({ onStarClick }: { onStarClick: (star: any) => void }) {
  return (
    <>
      {/* Ambient light */}
      <ambientLight intensity={0.5} />

      {/* Stars background */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />

      {/* Bright named stars */}
      {BRIGHT_STARS.map((star) => (
        <Star key={star.name} star={star} onClick={onStarClick} />
      ))}

      {/* Celestial sphere wireframe */}
      <mesh>
        <sphereGeometry args={[60, 32, 32]} />
        <meshBasicMaterial color="#1a1a3e" wireframe opacity={0.1} transparent />
      </mesh>

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        minDistance={20}
        maxDistance={80}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function SkyMapPage() {
  const [selectedStar, setSelectedStar] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'sky' | 'constellations'>('sky');
  const [time, setTime] = useState(new Date());

  const handleStarClick = (star: any) => {
    setSelectedStar(star);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Interactive Sky Map</h1>
          <p className="text-gray-400">Explore the cosmos in 3D - Click and drag to navigate</p>
        </div>

        {/* Controls */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* View Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">View Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('sky')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'sky'
                      ? 'bg-cosmos-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Stars
                </button>
                <button
                  onClick={() => setViewMode('constellations')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    viewMode === 'constellations'
                      ? 'bg-cosmos-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  Constellations
                </button>
              </div>
            </div>

            {/* Time Control */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time: {time.toLocaleTimeString()}
              </label>
              <input
                type="range"
                min="0"
                max="24"
                step="0.5"
                value={time.getHours() + time.getMinutes() / 60}
                onChange={(e) => {
                  const hours = Math.floor(parseFloat(e.target.value));
                  const minutes = (parseFloat(e.target.value) % 1) * 60;
                  const newTime = new Date();
                  newTime.setHours(hours, minutes);
                  setTime(newTime);
                }}
                className="w-full"
              />
            </div>

            {/* Info */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm text-gray-400">Visible Stars</div>
                <div className="text-2xl font-bold text-cosmos-400">{BRIGHT_STARS.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="bg-black rounded-xl overflow-hidden border border-gray-800" style={{ height: '600px' }}>
          <Canvas camera={{ position: [0, 0, 40], fov: 75 }}>
            <Suspense fallback={null}>
              <SkyScene onStarClick={handleStarClick} />
            </Suspense>
          </Canvas>
        </div>

        {/* Star Info Panel */}
        {selectedStar && (
          <div className="mt-6 bg-gradient-to-r from-cosmos-900/50 to-nebula-900/50 backdrop-blur-sm border border-cosmos-500/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{selectedStar.name}</h3>
                <p className="text-cosmos-300">{selectedStar.constellation}</p>
              </div>
              <button
                onClick={() => setSelectedStar(null)}
                className="text-gray-400 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">Magnitude</div>
                <div className="text-lg font-semibold text-white">{selectedStar.mag.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Right Ascension</div>
                <div className="text-lg font-semibold text-white">{selectedStar.ra.toFixed(2)}°</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Declination</div>
                <div className="text-lg font-semibold text-white">{selectedStar.dec.toFixed(2)}°</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Brightness</div>
                <div className="text-lg font-semibold text-white">
                  {selectedStar.mag < 0 ? 'Very Bright' : selectedStar.mag < 1 ? 'Bright' : 'Visible'}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-300 text-sm">
                <span className="font-semibold text-white">{selectedStar.name}</span> is one of the brightest stars
                visible from Earth. It is part of the <span className="text-cosmos-400">{selectedStar.constellation}</span> constellation
                and has an apparent magnitude of <span className="text-nebula-400">{selectedStar.mag}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmos-500/20 flex items-center justify-center flex-shrink-0">
                🖱️
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Rotate</div>
                <div className="text-gray-400">Click and drag to rotate the sky</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmos-500/20 flex items-center justify-center flex-shrink-0">
                🔍
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Zoom</div>
                <div className="text-gray-400">Scroll to zoom in and out</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cosmos-500/20 flex items-center justify-center flex-shrink-0">
                ⭐
              </div>
              <div>
                <div className="font-semibold text-white mb-1">Select</div>
                <div className="text-gray-400">Click on stars to see information</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
