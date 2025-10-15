'use client';

import { GalaxyBackground } from './GalaxyBackground';
import { NebulaLayers } from './NebulaLayers';
import { GlassShards } from './GlassShards';
import { LightRays } from './LightRays';

/**
 * Full-page fixed galaxy background that stays visible during scroll
 */
export function GalaxyBackgroundWrapper() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      {/* Deep space gradient backdrop - lighter */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      <div className="absolute inset-0 bg-gradient-radial from-gray-900/20 via-black/60 to-black/80" />

      {/* Animated galaxy spiral - balanced opacity */}
      <div className="opacity-70">
        <GalaxyBackground />
      </div>

      {/* Nebula clouds - enhanced visibility */}
      <div className="opacity-50">
        <NebulaLayers />
      </div>

      {/* Light rays - subtle but visible */}
      <div className="opacity-35">
        <LightRays />
      </div>

      {/* Glass shards - balanced */}
      <div className="opacity-40">
        <GlassShards />
      </div>

      {/* Subtle vignette overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/10 to-black/40" />
    </div>
  );
}
