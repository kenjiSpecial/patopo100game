import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Particle } from '../types';

export type ParticleLayerHandle = {
  createExplosion: (x: number, y: number, type: 'success' | 'miss') => void;
};

export const ParticleLayer = forwardRef<ParticleLayerHandle, {}>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const particleIdCounter = useRef(0);

  useImperativeHandle(ref, () => ({
    createExplosion: (x: number, y: number, type: 'success' | 'miss') => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const particleCount = type === 'success' ? 30 : 50;

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (type === 'success' ? 5 : 8) + 2;

        particlesRef.current.push({
          id: particleIdCounter.current++,
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color: type === 'success' ?
            (Math.random() > 0.5 ? '#4ade80' : '#ffffff') :
            (Math.random() > 0.5 ? '#ef4444' : '#b91c1c'),
          size: Math.random() * 4 + 2,
          shape: Math.random() > 0.5 ? 'circle' : 'rect'
        });
      }
    }
  }));

  // Canvas描画ループ
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(p => p.life > 0);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // 重力
        p.life -= 0.02;
        p.size *= 0.95;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
        }
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-30 pointer-events-none"
    />
  );
});

ParticleLayer.displayName = 'ParticleLayer';

