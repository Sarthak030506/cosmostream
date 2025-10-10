'use client';

import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';

// ISS Position type
interface ISSPosition {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: number;
}

// Mission type
interface Mission {
  id: string;
  name: string;
  agency: string;
  type: 'manned' | 'cargo' | 'probe' | 'satellite';
  status: 'active' | 'planned' | 'completed';
  launch_date: string;
  description: string;
  spacecraft: string;
}

// Sample missions data
const SAMPLE_MISSIONS: Mission[] = [
  {
    id: '1',
    name: 'Artemis II',
    agency: 'NASA',
    type: 'manned',
    status: 'planned',
    launch_date: '2025-09-01',
    description: 'First crewed mission to orbit the Moon since Apollo 17',
    spacecraft: 'Orion',
  },
  {
    id: '2',
    name: 'ISS Expedition 72',
    agency: 'NASA/Roscosmos',
    type: 'manned',
    status: 'active',
    launch_date: '2024-09-11',
    description: 'Current International Space Station crew rotation',
    spacecraft: 'Soyuz MS-26',
  },
  {
    id: '3',
    name: 'Europa Clipper',
    agency: 'NASA',
    type: 'probe',
    status: 'active',
    launch_date: '2024-10-10',
    description: 'Mission to study Jupiter\'s moon Europa',
    spacecraft: 'Europa Clipper',
  },
  {
    id: '4',
    name: 'Starship IFT-7',
    agency: 'SpaceX',
    type: 'cargo',
    status: 'planned',
    launch_date: '2025-11-15',
    description: 'Seventh integrated flight test of Starship',
    spacecraft: 'Starship',
  },
  {
    id: '5',
    name: 'JWST Operations',
    agency: 'NASA/ESA',
    type: 'probe',
    status: 'active',
    launch_date: '2021-12-25',
    description: 'James Webb Space Telescope scientific observations',
    spacecraft: 'James Webb',
  },
  {
    id: '6',
    name: 'Psyche',
    agency: 'NASA',
    type: 'probe',
    status: 'active',
    launch_date: '2023-10-13',
    description: 'Mission to explore the metal-rich asteroid Psyche',
    spacecraft: 'Psyche',
  },
];

// Upcoming launches (sample data - in production would use Launch Library API)
const UPCOMING_LAUNCHES = [
  {
    id: '1',
    name: 'Starlink Group 6-72',
    agency: 'SpaceX',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    site: 'Kennedy Space Center, FL',
    vehicle: 'Falcon 9 Block 5',
  },
  {
    id: '2',
    name: 'Crew-10',
    agency: 'SpaceX/NASA',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    site: 'Kennedy Space Center, FL',
    vehicle: 'Falcon 9 Block 5 | Crew Dragon',
  },
  {
    id: '3',
    name: 'Ariane 6 Flight VA264',
    agency: 'Arianespace',
    date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    site: 'Kourou, French Guiana',
    vehicle: 'Ariane 6',
  },
];

function getMissionTypeColor(type: string) {
  switch (type) {
    case 'manned':
      return 'bg-green-500/20 text-green-400';
    case 'cargo':
      return 'bg-blue-500/20 text-blue-400';
    case 'probe':
      return 'bg-purple-500/20 text-purple-400';
    case 'satellite':
      return 'bg-yellow-500/20 text-yellow-400';
    default:
      return 'bg-gray-500/20 text-gray-400';
  }
}

function getMissionStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400 border-green-500/50';
    case 'planned':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'completed':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
  }
}

// Countdown timer component
function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft('Launched!');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return <span className="font-mono">{timeLeft}</span>;
}

// ISS Tracker Component
function ISSTracker() {
  const [issPosition, setIssPosition] = useState<ISSPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchISSPosition = async () => {
      try {
        const response = await fetch('http://api.open-notify.org/iss-now.json');
        const data = await response.json();

        if (data.message === 'success') {
          setIssPosition({
            latitude: parseFloat(data.iss_position.latitude),
            longitude: parseFloat(data.iss_position.longitude),
            altitude: 408, // Average ISS altitude in km
            velocity: 27600, // Average ISS velocity in km/h
            timestamp: data.timestamp,
          });
          setError('');
        }
      } catch (err) {
        setError('Unable to fetch ISS position');
        // Set default position if API fails
        setIssPosition({
          latitude: 0,
          longitude: 0,
          altitude: 408,
          velocity: 27600,
          timestamp: Date.now() / 1000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchISSPosition();
    const interval = setInterval(fetchISSPosition, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded w-1/3 mb-4"></div>
          <div className="h-20 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">International Space Station</h3>
          <p className="text-sm text-gray-400">Live Position Tracker</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
          <div className="w-6 h-6 rounded-full bg-green-500"></div>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-yellow-400">
          ⚠️ Using simulated data - API unavailable
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-400 mb-1">Latitude</div>
          <div className="text-lg font-mono font-bold text-white">
            {issPosition?.latitude.toFixed(4)}°
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Longitude</div>
          <div className="text-lg font-mono font-bold text-white">
            {issPosition?.longitude.toFixed(4)}°
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Altitude</div>
          <div className="text-lg font-mono font-bold text-white">
            {issPosition?.altitude} km
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400 mb-1">Velocity</div>
          <div className="text-lg font-mono font-bold text-white">
            {issPosition?.velocity.toLocaleString()} km/h
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-sm text-gray-300">
          The ISS orbits Earth every ~90 minutes at an average altitude of 408 km, traveling at approximately 27,600 km/h.
        </p>
      </div>
    </div>
  );
}

export default function MissionsPage() {
  const [filter, setFilter] = useState<'all' | 'active' | 'planned'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'manned' | 'cargo' | 'probe' | 'satellite'>('all');

  const filteredMissions = SAMPLE_MISSIONS.filter((mission) => {
    const matchesStatus = filter === 'all' || mission.status === filter;
    const matchesType = typeFilter === 'all' || mission.type === typeFilter;
    return matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Live Mission Tracking</h1>
          <p className="text-gray-400">Real-time updates on active space missions and upcoming launches</p>
        </div>

        {/* ISS Tracker */}
        <div className="mb-8">
          <ISSTracker />
        </div>

        {/* Upcoming Launches */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Upcoming Launches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {UPCOMING_LAUNCHES.map((launch) => (
              <div
                key={launch.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-nebula-500 rounded-xl p-6 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{launch.name}</h3>
                    <p className="text-sm text-gray-400">{launch.agency}</p>
                  </div>
                  <div className="text-2xl">🚀</div>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-1">Countdown</div>
                  <div className="text-2xl font-bold text-nebula-400">
                    <Countdown targetDate={launch.date} />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="text-gray-300">{launch.site}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-gray-300">{launch.vehicle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Missions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Active & Planned Missions</h2>
            <div className="text-sm text-gray-400">
              {filteredMissions.length} {filteredMissions.length === 1 ? 'mission' : 'missions'}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'active', 'planned'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                        filter === status
                          ? 'bg-cosmos-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mission Type</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'manned', 'cargo', 'probe', 'satellite'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                        typeFilter === type
                          ? 'bg-nebula-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-cosmos-500 rounded-xl p-6 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{mission.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{mission.description}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full border ${getMissionStatusColor(mission.status)}`}>
                    {mission.status}
                  </span>
                  <span className={`px-3 py-1 text-xs rounded-full ${getMissionTypeColor(mission.type)}`}>
                    {mission.type}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Agency</div>
                    <div className="text-sm font-semibold text-white">{mission.agency}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Spacecraft</div>
                    <div className="text-sm font-semibold text-white">{mission.spacecraft}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 mb-1">Launch Date</div>
                    <div className="text-sm font-semibold text-white">
                      {new Date(mission.launch_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
