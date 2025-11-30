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
      time += 0.015; // Slowed down for calmer wave motion

      const isDark = resolvedTheme === 'dark';
      
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isDark) {
        gradient.addColorStop(0, '#93c5fd'); // blue-300 (lighter for dark mode)
        gradient.addColorStop(1, '#c084fc'); // purple-400 (lighter for dark mode)
      } else {
        gradient.addColorStop(0, '#2563eb'); // blue-600 (darker for light mode)
        gradient.addColorStop(1, '#6b21a8'); // purple-800 (darker for light mode)
      }

      // Update points
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          
          // Automatic wave animation (always active)
          // Create unpredictable wave using multiple sine/cosine layers (slowed down)
          const wave1 = Math.sin(time * 0.4 + point.originX * 0.015 + point.originY * 0.01) * 8;
          const wave2 = Math.cos(time * 0.6 + point.originY * 0.02 - point.originX * 0.008) * 6;
          const wave3 = Math.sin(time * 0.25 + (point.originX + point.originY) * 0.012) * 10;
          const wave4 = Math.cos(time * 0.75 - point.originX * 0.018 + point.originY * 0.015) * 5;
          
          // Combine waves for unpredictable motion
          const waveX = wave1 + wave3 + Math.sin(time * 0.15 + point.originY * 0.025) * 4;
          const waveY = wave2 + wave4 + Math.cos(time * 0.2 + point.originX * 0.02) * 7;
          
          // Calculate wave intensity for dynamic sizing
          const waveIntensity = Math.sqrt(waveX * waveX + waveY * waveY) / 20; // Normalize
          
          // Mouse interaction - Magnetic Attraction
          const dx = mouseX - point.originX;
          const dy = mouseY - point.originY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          let targetX = point.originX + waveX;
          let targetY = point.originY + waveY;

          if (distance < influenceRadius) {
            const angle = Math.atan2(dy, dx);
            const force = (influenceRadius - distance) / influenceRadius;
            // Ease out for smooth magnetic pull
            const ease = 1 - Math.pow(1 - force, 3); // Ease out cubic
            const pullStrength = ease * 30; // Magnetic pull distance
            
            // Pull dots TOWARD the cursor (positive direction)
            targetX += Math.cos(angle) * pullStrength;
            targetY += Math.sin(angle) * pullStrength;

            // Add subtle orbital rotation for visual interest
            const orbitalAngle = angle + Math.PI / 2; // Perpendicular to attraction
            const orbitalAmount = ease * 8; // Subtle rotation
            targetX += Math.cos(orbitalAngle) * orbitalAmount * Math.sin(time * 2);
            targetY += Math.sin(orbitalAngle) * orbitalAmount * Math.sin(time * 2);
          }

          point.x += (targetX - point.x) * 0.1;
          point.y += (targetY - point.y) * 0.1;
          
          // Store wave intensity for dot sizing
          (point as any).waveIntensity = waveIntensity;
        }
      }

      // Breathing effect - slow pulsing that affects all dots
      const breathingPhase = Math.sin(time * 0.8) * 0.5 + 0.5; // 0 to 1
      const breathingScale = 0.7 + breathingPhase * 0.3; // 0.7 to 1.0
      const breathingOpacity = 0.85 + breathingPhase * 0.15; // 0.85 to 1.0

      // Draw base dots with dynamic sizing and glowing colors
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          const intensity = (point as any).waveIntensity || 0;
          // Base size 1.2, grows up to 2.7 based on wave intensity, modulated by breathing
          const dotSize = (1.2 + intensity * 1.5) * breathingScale;
          
          // Blend between base color and gradient based on wave intensity
          // Low intensity = subtle gray, high intensity = vibrant gradient color
          if (intensity > 0.1) {
            // Use gradient color with opacity based on intensity (toned down) and breathing
            ctx.globalAlpha = (0.15 + intensity * 0.3) * breathingOpacity;
            ctx.fillStyle = gradient;
          } else {
            // Very low intensity dots remain subtle, with breathing opacity
            ctx.globalAlpha = breathingOpacity;
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)';
          }
          
          ctx.beginPath();
          ctx.arc(point.x, point.y, dotSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0; // Reset alpha
        }
      }

      // Draw active/highlighted dots with dynamic sizing
      for (let i = 0; i < points.length; i++) {
        for (let j = 0; j < points[i].length; j++) {
          const point = points[i][j];
          const dx = mouseX - point.x;
          const dy = mouseY - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Only draw highlighted elements near mouse
          if (distance < influenceRadius) {
            const opacity = 1 - (distance / influenceRadius);
            const intensity = (point as any).waveIntensity || 0;
            
            ctx.globalAlpha = opacity * breathingOpacity;
            ctx.fillStyle = gradient;

            // Draw dot with dynamic size (base 2.5, grows up to 4 with wave), modulated by breathing
            const highlightSize = (2.5 + intensity * 1.5) * breathingScale;
            ctx.beginPath();
            ctx.arc(point.x, point.y, highlightSize, 0, Math.PI * 2);
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
