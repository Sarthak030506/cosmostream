'use client';

import { useEffect, useRef } from 'react';

export function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Create star layers for parallax effect
    const createStars = (count: number, speed: number, size: number) => {
      return Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * size + 0.5,
        speed,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    };

    const starLayers = [
      createStars(40, 0.02, 1), // Far stars (slow)
      createStars(30, 0.05, 1.5), // Mid stars
      createStars(20, 0.1, 2), // Near stars (fast)
    ];

    let animationFrame: number;
    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.01;

      // Draw and animate stars
      starLayers.forEach((stars, layerIndex) => {
        stars.forEach((star) => {
          // Drift animation
          star.x -= star.speed;
          if (star.x < 0) star.x = canvas.width;

          // Twinkling effect
          const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
          const currentOpacity = star.opacity * (0.7 + twinkle * 0.3);

          // Draw star
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
          ctx.fill();
        });
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <>
      {/* Canvas starfield */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ willChange: 'transform' }}
      />

      {/* SVG Nebula effect */}
      <svg
        className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="nebula1" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#8892f8" stopOpacity="0.3">
              <animate
                attributeName="stopOpacity"
                values="0.3;0.5;0.3"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nebula2" cx="70%" cy="60%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.2">
              <animate
                attributeName="stopOpacity"
                values="0.2;0.4;0.2"
                dur="12s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="40" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse
          cx="30%"
          cy="30%"
          rx="400"
          ry="300"
          fill="url(#nebula1)"
          filter="url(#glow)"
        >
          <animate
            attributeName="rx"
            values="400;450;400"
            dur="15s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="300;350;300"
            dur="13s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="70%"
          cy="60%"
          rx="350"
          ry="400"
          fill="url(#nebula2)"
          filter="url(#glow)"
        >
          <animate
            attributeName="rx"
            values="350;400;350"
            dur="14s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="ry"
            values="400;450;400"
            dur="16s"
            repeatCount="indefinite"
          />
        </ellipse>
      </svg>

      {/* Cosmic dust particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="cosmic-particle absolute rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              animation: `float ${Math.random() * 20 + 15}s ease-in-out ${Math.random() * 5}s infinite`,
              animationDelay: `${Math.random() * -20}s`,
            }}
          />
        ))}
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          50% {
            transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px)
              scale(${Math.random() * 0.5 + 0.8});
            opacity: 0.5;
          }
          90% {
            opacity: 0.3;
          }
        }
      `}</style>
    </>
  );
}
