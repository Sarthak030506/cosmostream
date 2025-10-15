'use client';

export function LightRays() {
  const rayCount = 16;
  const rays = Array.from({ length: rayCount }, (_, i) => ({
    id: i,
    angle: (360 / rayCount) * i,
    delay: i * 0.5,
    duration: 20 + Math.random() * 10,
  }));

  return (
    <div className="pointer-events-none fixed inset-0 z-5 flex items-center justify-center overflow-hidden">
      <div className="relative h-full w-full">
        {/* Central light source */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-32 w-32 animate-pulse-slow rounded-full bg-gradient-radial from-cosmos-400/30 via-nebula-500/20 to-transparent blur-3xl" />
        </div>

        {/* Radial light rays */}
        <svg className="h-full w-full" style={{ mixBlendMode: 'screen' }}>
          <defs>
            {rays.map((ray) => (
              <linearGradient
                key={`gradient-${ray.id}`}
                id={`ray-gradient-${ray.id}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(136, 146, 248, 0.15)">
                  <animate
                    attributeName="stop-opacity"
                    values="0.05;0.25;0.05"
                    dur={`${ray.duration}s`}
                    begin={`${ray.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="30%" stopColor="rgba(217, 70, 239, 0.1)">
                  <animate
                    attributeName="stop-opacity"
                    values="0.03;0.18;0.03"
                    dur={`${ray.duration}s`}
                    begin={`${ray.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="70%" stopColor="rgba(232, 121, 249, 0.05)">
                  <animate
                    attributeName="stop-opacity"
                    values="0.02;0.12;0.02"
                    dur={`${ray.duration}s`}
                    begin={`${ray.delay}s`}
                    repeatCount="indefinite"
                  />
                </stop>
                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
              </linearGradient>
            ))}

            {/* Glow filter */}
            <filter id="ray-glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Draw rays */}
          {rays.map((ray) => {
            const centerX = 50;
            const centerY = 50;
            const length = 100;
            const width = 0.8;

            const angleRad = (ray.angle * Math.PI) / 180;
            const endX = centerX + Math.cos(angleRad) * length;
            const endY = centerY + Math.sin(angleRad) * length;

            // Calculate perpendicular for width
            const perpAngle = angleRad + Math.PI / 2;
            const halfWidth = width / 2;

            const x1 = centerX + Math.cos(perpAngle) * halfWidth;
            const y1 = centerY + Math.sin(perpAngle) * halfWidth;
            const x2 = centerX - Math.cos(perpAngle) * halfWidth;
            const y2 = centerY - Math.sin(perpAngle) * halfWidth;

            const endX1 = endX + Math.cos(perpAngle) * (halfWidth * 3);
            const endY1 = endY + Math.sin(perpAngle) * (halfWidth * 3);
            const endX2 = endX - Math.cos(perpAngle) * (halfWidth * 3);
            const endY2 = endY - Math.sin(perpAngle) * (halfWidth * 3);

            return (
              <polygon
                key={ray.id}
                points={`${x1},${y1} ${x2},${y2} ${endX2},${endY2} ${endX1},${endY1}`}
                fill={`url(#ray-gradient-${ray.id})`}
                filter="url(#ray-glow)"
                opacity="0.6"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${centerX} ${centerY}`}
                  to={`360 ${centerX} ${centerY}`}
                  dur="200s"
                  repeatCount="indefinite"
                />
              </polygon>
            );
          })}
        </svg>

        {/* Rotating gradient overlay for extra depth */}
        <div className="absolute inset-0 animate-spin-slow">
          <div
            className="h-full w-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0%, rgba(136, 146, 248, 0.1) 10%, transparent 20%, rgba(217, 70, 239, 0.08) 30%, transparent 40%, rgba(136, 146, 248, 0.12) 50%, transparent 60%, rgba(217, 70, 239, 0.1) 70%, transparent 80%, rgba(136, 146, 248, 0.08) 90%, transparent 100%)',
              mixBlendMode: 'screen',
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 180s linear infinite;
        }
      `}</style>
    </div>
  );
}
