"use client";

import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; base: number; speed: number; phase: number; hue: string };
type Meteor = { x: number; y: number; dx: number; dy: number; life: number; max: number };

const HUES = ["255,255,255", "255,224,138", "147,197,253", "196,181,253"];

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let stars: Star[] = [];
    let meteors: Meteor[] = [];
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nextMeteor = performance.now() + 2500;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(190, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        base: Math.random() * 0.5 + 0.25,
        speed: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
        hue: HUES[Math.floor(Math.random() * HUES.length)],
      }));
    };

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);

      for (const s of stars) {
        const tw = s.base + Math.sin(t / 1000 * s.speed + s.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.hue},${Math.max(0.05, tw)})`;
        ctx.fill();
      }

      if (t > nextMeteor) {
        const startX = Math.random() * w * 0.7 + w * 0.15;
        meteors.push({ x: startX, y: -20, dx: -(2.4 + Math.random() * 2), dy: 3 + Math.random() * 2.2, life: 0, max: 90 });
        nextMeteor = t + 3500 + Math.random() * 5000;
      }

      meteors = meteors.filter((m) => m.life < m.max);
      for (const m of meteors) {
        const fade = 1 - m.life / m.max;
        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.dx * 16, m.y - m.dy * 16);
        grad.addColorStop(0, `rgba(255,224,138,${0.8 * fade})`);
        grad.addColorStop(1, "rgba(255,224,138,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.dx * 16, m.y - m.dy * 16);
        ctx.stroke();
        m.x += m.dx;
        m.y += m.dy;
        m.life += 1;
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
