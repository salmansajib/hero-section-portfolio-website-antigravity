'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
}

export default function DotAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let mouseX = -1000;
    let mouseY = -1000;

    let time = 0;

    const points: Point[][] = [];
    const spacing = 40;
    const influenceRadius = 200;
    const maxDisplacement = 40;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initGrid();
    };

    const initGrid = () => {
      points.length = 0;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        points[i] = [];
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          points[i][j] = { x, y, originX: x, originY: y };
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const isDark = resolvedTheme === 'dark';
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isDark) {
        gradient.addColorStop(0, '#60a5fa'); // blue-400
        gradient.addColorStop(1, '#9333ea'); // purple-600
      } else {
        gradient.addColorStop(0, '#3b82f6'); // blue-500
        gradient.addColorStop(1, '#7e22ce'); // purple-700
      }

      // Update points
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          
          // Automatic wave animation (always active)
          // Create unpredictable wave using multiple sine/cosine layers
          const wave1 = Math.sin(time * 0.8 + point.originX * 0.015 + point.originY * 0.01) * 8;
          const wave2 = Math.cos(time * 1.2 + point.originY * 0.02 - point.originX * 0.008) * 6;
          const wave3 = Math.sin(time * 0.5 + (point.originX + point.originY) * 0.012) * 10;
          const wave4 = Math.cos(time * 1.5 - point.originX * 0.018 + point.originY * 0.015) * 5;
          
          // Combine waves for unpredictable motion
          const waveX = wave1 + wave3 + Math.sin(time * 0.3 + point.originY * 0.025) * 4;
          const waveY = wave2 + wave4 + Math.cos(time * 0.4 + point.originX * 0.02) * 7;
          
          // Mouse interaction
          const dx = mouseX - point.originX;
          const dy = mouseY - point.originY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let targetX = point.originX + waveX;
          let targetY = point.originY + waveY;

          if (distance < influenceRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (influenceRadius - distance) / influenceRadius;
            // Ease out cubic for smoother feel
            const ease = force * force * force; 
            const displacement = ease * maxDisplacement;
            
            targetX -= Math.cos(angle) * displacement;
            targetY -= Math.sin(angle) * displacement;

            // Add lively swirl animation
            const swirlAmount = 15 * ease; // Scale swirl with proximity
            targetX += Math.sin(time + point.originY * 0.05) * swirlAmount;
            targetY += Math.cos(time + point.originX * 0.05) * swirlAmount;
          }

          point.x += (targetX - point.x) * 0.1;
          point.y += (targetY - point.y) * 0.1;
        }
      }

      // Draw base dots (low opacity)
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          ctx.beginPath();
          ctx.arc(point.x, point.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw active/highlighted dots
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          const dx = mouseX - point.x;
          const dy = mouseY - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only draw highlighted elements near mouse
          if (distance < influenceRadius) {
            const opacity = 1 - (distance / influenceRadius);
            
            ctx.globalAlpha = opacity;
            ctx.fillStyle = gradient;

            // Draw dot
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.globalAlpha = 1.0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [resolvedTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}
