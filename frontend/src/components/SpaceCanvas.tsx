import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  twinkleSpeed: number;
}

interface AsteroidTrack {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tail: Array<{ x: number; y: number; alpha: number }>;
  color: string;
}

export const SpaceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const stars: Particle[] = Array.from({ length: 140 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.4,
      speedX: (Math.random() - 0.5) * 0.04,
      speedY: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
    }));

    // Near-Earth Asteroid trajectories
    const asteroids: AsteroidTrack[] = [
      { x: width * 0.2, y: height * 0.3, vx: 0.6, vy: 0.25, radius: 2.2, tail: [], color: '#38bdf8' },
      { x: width * 0.7, y: height * 0.8, vx: -0.45, vy: -0.3, radius: 3.0, tail: [], color: '#f43f5e' }, // Hazardous
      { x: width * 0.85, y: height * 0.2, vx: -0.3, vy: 0.4, radius: 1.8, tail: [], color: '#34d399' },
    ];

    let radarAngle = 0;

    const render = () => {
      ctx.fillStyle = '#070a13';
      ctx.fillRect(0, 0, width, height);

      // Subtle background nebula glows
      const grad1 = ctx.createRadialGradient(width * 0.8, height * 0.2, 50, width * 0.8, height * 0.2, 550);
      grad1.addColorStop(0, 'rgba(14, 165, 233, 0.07)');
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(width * 0.15, height * 0.75, 40, width * 0.15, height * 0.75, 480);
      grad2.addColorStop(0, 'rgba(244, 63, 94, 0.04)');
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Stars rendering
      stars.forEach((star) => {
        star.opacity += Math.sin(Date.now() * star.twinkleSpeed) * 0.01;
        star.opacity = Math.max(0.2, Math.min(0.9, star.opacity));
        star.x += star.speedX;
        star.y += star.speedY;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 232, 240, ${star.opacity})`;
        ctx.fill();
      });

      // Orbital guide rings
      const centerX = width * 0.5;
      const centerY = height * 0.45;
      const earthOrbitR = Math.min(width, height) * 0.38;

      ctx.strokeStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, earthOrbitR, earthOrbitR * 0.65, 0.15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(244, 63, 94, 0.05)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, earthOrbitR * 1.35, earthOrbitR * 0.75, -0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moving asteroids with ion tails
      asteroids.forEach((ast) => {
        ast.x += ast.vx;
        ast.y += ast.vy;

        if (ast.x > width + 50) ast.x = -50;
        if (ast.x < -50) ast.x = width + 50;
        if (ast.y > height + 50) ast.y = -50;
        if (ast.y < -50) ast.y = height + 50;

        ast.tail.push({ x: ast.x, y: ast.y, alpha: 0.5 });
        if (ast.tail.length > 22) ast.tail.shift();

        // Draw tail
        for (let i = 0; i < ast.tail.length; i++) {
          const t = ast.tail[i];
          const alpha = (i / ast.tail.length) * 0.3;
          ctx.beginPath();
          ctx.arc(t.x, t.y, ast.radius * (i / ast.tail.length), 0, Math.PI * 2);
          ctx.fillStyle = ast.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }

        // Draw asteroid core
        ctx.beginPath();
        ctx.arc(ast.x, ast.y, ast.radius, 0, Math.PI * 2);
        ctx.fillStyle = ast.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = ast.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Radar scan beam on corner
      radarAngle += 0.012;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
