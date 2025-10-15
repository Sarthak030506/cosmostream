'use client';

import { useEffect, useRef, useState } from 'react';

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrame: number;
    let galaxyRotation = 0;
    let time = 0;

    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Star particles with depth
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      speed: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
    }

    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      z: Math.random() * 3,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.1 + 0.02,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Galaxy spiral arms
    interface GalaxyParticle {
      angle: number;
      distance: number;
      size: number;
      color: string;
      alpha: number;
      armIndex: number;
    }

    const galaxyParticles: GalaxyParticle[] = [];
    const armCount = 5;
    const particlesPerArm = 80;

    for (let arm = 0; arm < armCount; arm++) {
      for (let i = 0; i < particlesPerArm; i++) {
        const t = i / particlesPerArm;
        const angle = (arm * Math.PI * 2) / armCount + t * Math.PI * 4;
        const distance = t * (Math.min(window.innerWidth, window.innerHeight) * 0.4);
        const colors = ['#8892f8', '#d946ef', '#e879f9', '#a5b8fc', '#f0abfc'];

        galaxyParticles.push({
          angle,
          distance,
          size: (1 - t) * 3 + 1,
          color: colors[arm],
          alpha: (1 - t) * 0.6 + 0.2,
          armIndex: arm,
        });
      }
    }

    // Cosmic dust particles
    interface DustParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      life: number;
      maxLife: number;
    }

    const dustParticles: DustParticle[] = [];

    const createDustParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      return {
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        life: 0,
        maxLife: Math.random() * 300 + 200,
      };
    };

    // Initialize dust
    for (let i = 0; i < 50; i++) {
      dustParticles.push(createDustParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      time += 0.01;
      galaxyRotation += 0.0005;

      // Draw background stars
      stars.forEach((star) => {
        star.x -= star.speed * (star.z + 1);
        if (star.x < 0) star.x = window.innerWidth;

        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
        const currentOpacity = star.opacity * (0.6 + twinkle * 0.4);
        const size = star.size * (1 + star.z * 0.3);

        ctx.beginPath();
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
        ctx.fill();

        // Add glow for larger stars
        if (star.size > 1.5) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 0.1})`;
          ctx.fill();
        }
      });

      // Draw galaxy spiral
      galaxyParticles.forEach((particle) => {
        const rotatedAngle = particle.angle + galaxyRotation * (1 + particle.distance / 1000);
        const x = centerX + Math.cos(rotatedAngle) * particle.distance;
        const y = centerY + Math.sin(rotatedAngle) * particle.distance;

        // Add pulsing effect
        const pulse = Math.sin(time * 2 + particle.distance / 50) * 0.3 + 0.7;
        const size = particle.size * pulse;
        const alpha = particle.alpha * pulse;

        // Draw glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, `${particle.color}${Math.floor(alpha * 100).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw core particle
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw cosmic dust
      dustParticles.forEach((dust, index) => {
        dust.x += dust.vx;
        dust.y += dust.vy;
        dust.life++;

        const lifeRatio = dust.life / dust.maxLife;
        const alpha = lifeRatio < 0.5 ? lifeRatio * 2 : (1 - lifeRatio) * 2;

        if (dust.life >= dust.maxLife) {
          dustParticles[index] = createDustParticle();
          return;
        }

        ctx.beginPath();
        ctx.arc(dust.x, dust.y, dust.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 180, 255, ${alpha * 0.4})`;
        ctx.fill();
      });

      // Draw central glow
      const centralGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200);
      centralGlow.addColorStop(0, 'rgba(136, 146, 248, 0.15)');
      centralGlow.addColorStop(0.5, 'rgba(217, 70, 239, 0.08)');
      centralGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centralGlow;
      ctx.fillRect(centerX - 200, centerY - 200, 400, 400);

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateSize);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ willChange: 'transform' }}
    />
  );
}
