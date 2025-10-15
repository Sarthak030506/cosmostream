'use client';

export function NebulaLayers() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* SVG Nebula Layers */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{ mixBlendMode: 'screen' }}
      >
        <defs>
          {/* Nebula gradients with multiple color stops */}
          <radialGradient id="nebula-purple" cx="30%" cy="40%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4">
              <animate
                attributeName="stopOpacity"
                values="0.4;0.6;0.4"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor="#a78bfa" stopOpacity="0.3">
              <animate
                attributeName="stopOpacity"
                values="0.3;0.5;0.3"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor="#c084fc" stopOpacity="0.15">
              <animate
                attributeName="stopOpacity"
                values="0.15;0.25;0.15"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#d8b4fe" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nebula-pink" cx="70%" cy="30%">
            <stop offset="0%" stopColor="#ec4899" stopOpacity="0.35">
              <animate
                attributeName="stopOpacity"
                values="0.35;0.55;0.35"
                dur="9s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor="#f472b6" stopOpacity="0.25">
              <animate
                attributeName="stopOpacity"
                values="0.25;0.4;0.25"
                dur="11s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor="#f9a8d4" stopOpacity="0.12">
              <animate
                attributeName="stopOpacity"
                values="0.12;0.22;0.12"
                dur="13s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#fce7f3" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nebula-blue" cx="50%" cy="70%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3">
              <animate
                attributeName="stopOpacity"
                values="0.3;0.5;0.3"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="30%" stopColor="#60a5fa" stopOpacity="0.2">
              <animate
                attributeName="stopOpacity"
                values="0.2;0.35;0.2"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.1">
              <animate
                attributeName="stopOpacity"
                values="0.1;0.2;0.1"
                dur="14s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="nebula-cyan" cx="20%" cy="80%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25">
              <animate
                attributeName="stopOpacity"
                values="0.25;0.45;0.25"
                dur="11s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.15">
              <animate
                attributeName="stopOpacity"
                values="0.15;0.3;0.15"
                dur="13s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter for nebula */}
          <filter id="nebula-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="60" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Turbulence for organic cloud effect */}
          <filter id="nebula-turbulence">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.005"
              numOctaves="4"
              seed="2"
            >
              <animate
                attributeName="baseFrequency"
                values="0.005;0.008;0.005"
                dur="30s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="80" />
            <feGaussianBlur stdDeviation="30" />
          </filter>
        </defs>

        {/* Purple nebula cloud - upper left */}
        <ellipse
          cx="30%"
          cy="40%"
          rx="500"
          ry="350"
          fill="url(#nebula-purple)"
          filter="url(#nebula-glow)"
          opacity="0.8"
        >
          <animate attributeName="rx" values="500;550;500" dur="20s" repeatCount="indefinite" />
          <animate attributeName="ry" values="350;400;350" dur="18s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 30 40"
            to="360 30 40"
            dur="120s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Pink nebula cloud - upper right */}
        <ellipse
          cx="70%"
          cy="30%"
          rx="450"
          ry="380"
          fill="url(#nebula-pink)"
          filter="url(#nebula-glow)"
          opacity="0.75"
        >
          <animate attributeName="rx" values="450;500;450" dur="22s" repeatCount="indefinite" />
          <animate attributeName="ry" values="380;430;380" dur="20s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 70 30"
            to="-360 70 30"
            dur="150s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Blue nebula cloud - lower center */}
        <ellipse
          cx="50%"
          cy="70%"
          rx="480"
          ry="320"
          fill="url(#nebula-blue)"
          filter="url(#nebula-glow)"
          opacity="0.7"
        >
          <animate attributeName="rx" values="480;530;480" dur="24s" repeatCount="indefinite" />
          <animate attributeName="ry" values="320;370;320" dur="22s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 70"
            to="360 50 70"
            dur="180s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Cyan nebula cloud - lower left */}
        <ellipse
          cx="20%"
          cy="80%"
          rx="400"
          ry="300"
          fill="url(#nebula-cyan)"
          filter="url(#nebula-glow)"
          opacity="0.65"
        >
          <animate attributeName="rx" values="400;450;400" dur="19s" repeatCount="indefinite" />
          <animate attributeName="ry" values="300;350;300" dur="21s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 20 80"
            to="-360 20 80"
            dur="140s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Organic cloud layer with turbulence */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#nebula-purple)"
          filter="url(#nebula-turbulence)"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
