'use client';

import { useState } from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

function FloatingCard({ icon, title, description, delay, position }: CardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="floating-card absolute hidden lg:block"
      style={{
        ...position,
        animation: `float-drift 20s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        willChange: 'transform',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`glass-card group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 ${
          isHovered ? 'scale-105 shadow-2xl shadow-nebula-500/30' : ''
        }`}
        style={{
          transform: isHovered ? 'perspective(1000px) rotateX(5deg) rotateY(5deg)' : 'none',
        }}
      >
        {/* Shimmer effect on hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-700 ${
            isHovered ? 'animate-shimmer opacity-100' : ''
          }`}
          style={{
            backgroundSize: '200% 200%',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cosmos-400 to-nebula-500 shadow-lg shadow-cosmos-500/50">
            {icon}
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </div>

        {/* Glass reflection effect */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      </div>

      <style jsx>{`
        @keyframes float-drift {
          0%,
          100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(10px, -15px) rotate(1deg);
          }
          50% {
            transform: translate(-8px, 10px) rotate(-1deg);
          }
          75% {
            transform: translate(12px, 5px) rotate(0.5deg);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% -200%;
          }
          100% {
            background-position: 200% 200%;
          }
        }

        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export function FloatingGlassCards() {
  const cards = [
    {
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      ),
      title: 'Discovery',
      description: 'Explore the latest space discoveries',
      delay: 0,
      position: { top: '15%', left: '8%' },
    },
    {
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: 'Sky Maps',
      description: 'Interactive celestial navigation',
      delay: 2,
      position: { top: '25%', right: '10%' },
    },
    {
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      title: '4K Streaming',
      description: 'Ultra HD space content',
      delay: 4,
      position: { bottom: '20%', left: '12%' },
    },
    {
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
      title: 'Live Missions',
      description: 'Real-time space mission tracking',
      delay: 1,
      position: { bottom: '25%', right: '15%' },
    },
    {
      icon: (
        <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      title: 'Learn',
      description: 'Expert-led astronomy courses',
      delay: 3,
      position: { top: '50%', right: '8%' },
    },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {cards.map((card, index) => (
        <div key={index} className="pointer-events-auto">
          <FloatingCard {...card} />
        </div>
      ))}
    </div>
  );
}
