'use client';

import { useState } from 'react';

interface Shard {
  id: number;
  left: string;
  top: string;
  delay: number;
  duration: number;
  rotation: number;
  scale: number;
  path: string;
}

export function GlassShards() {
  // Generate random glass shard positions and properties
  const shards: Shard[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 10,
    rotation: Math.random() * 360,
    scale: 0.6 + Math.random() * 0.8,
    path: `
      M ${20 + Math.random() * 10} ${5 + Math.random() * 5}
      L ${40 + Math.random() * 15} ${10 + Math.random() * 10}
      L ${45 + Math.random() * 10} ${35 + Math.random() * 15}
      L ${30 + Math.random() * 10} ${50 + Math.random() * 10}
      L ${10 + Math.random() * 10} ${40 + Math.random() * 10}
      L ${5 + Math.random() * 5} ${20 + Math.random() * 10}
      Z
    `,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {shards.map((shard) => (
        <div
          key={shard.id}
          className="glass-shard absolute"
          style={{
            left: shard.left,
            top: shard.top,
            animation: `float-shard ${shard.duration}s ease-in-out ${shard.delay}s infinite`,
            transform: `rotate(${shard.rotation}deg) scale(${shard.scale})`,
            willChange: 'transform',
          }}
        >
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            className="drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(136, 146, 248, 0.4))',
            }}
          >
            <defs>
              {/* Glass gradient with reflections */}
              <linearGradient id={`glass-gradient-${shard.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
                <stop offset="30%" stopColor="rgba(136, 146, 248, 0.15)" />
                <stop offset="70%" stopColor="rgba(217, 70, 239, 0.15)" />
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
              </linearGradient>

              {/* Shimmer effect */}
              <linearGradient id={`shimmer-${shard.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0)">
                  <animate
                    attributeName="stop-opacity"
                    values="0;0.6;0"
                    dur="3s"
                    begin={`${shard.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="50%" stopColor="rgba(255, 255, 255, 0.4)">
                  <animate
                    attributeName="stop-opacity"
                    values="0;0.8;0"
                    dur="3s"
                    begin={`${shard.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)">
                  <animate
                    attributeName="stop-opacity"
                    values="0;0.6;0"
                    dur="3s"
                    begin={`${shard.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
              </linearGradient>

              {/* Blur filter for depth */}
              <filter id={`blur-${shard.id}`}>
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
            </defs>

            {/* Glass shard shape */}
            <path
              d={shard.path}
              fill={`url(#glass-gradient-${shard.id})`}
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="0.5"
              filter={`url(#blur-${shard.id})`}
            />

            {/* Shimmer overlay */}
            <path d={shard.path} fill={`url(#shimmer-${shard.id})`} opacity="0.5" />

            {/* Edge highlights */}
            <path
              d={shard.path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.6)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        </div>
      ))}

      <style jsx>{`
        @keyframes float-shard {
          0%,
          100% {
            transform: translate(0, 0) rotate(var(--rotation, 0deg)) scale(var(--scale, 1));
            opacity: 0.3;
          }
          25% {
            transform: translate(15px, -20px) rotate(calc(var(--rotation, 0deg) + 5deg))
              scale(calc(var(--scale, 1) * 1.05));
            opacity: 0.6;
          }
          50% {
            transform: translate(-10px, 15px) rotate(calc(var(--rotation, 0deg) - 3deg))
              scale(var(--scale, 1));
            opacity: 0.8;
          }
          75% {
            transform: translate(20px, 10px) rotate(calc(var(--rotation, 0deg) + 7deg))
              scale(calc(var(--scale, 1) * 0.95));
            opacity: 0.5;
          }
        }

        .glass-shard {
          --rotation: ${shards[0]?.rotation || 0}deg;
          --scale: ${shards[0]?.scale || 1};
        }
      `}</style>
    </div>
  );
}
