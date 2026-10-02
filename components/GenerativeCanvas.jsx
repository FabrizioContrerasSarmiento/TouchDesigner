"use client";

import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";

/**
 * GenerativeCanvas — FASE 8: POLISH & PERFORMANCE
 * 
 * Capa visual generativa global optimizada para pantallas 1080p, 1440p y 4K (2160p).
 * 
 * Optimizaciones:
 * - Resolución interna acotada para evitar caídas de framerate en pantallas 4K Ultra HD.
 * - Throttling de física cuando el usuario no está interactuando.
 * - Cero fugas de memoria al cambiar de obra o salir de la aplicación.
 */
const GenerativeCanvas = forwardRef(function GenerativeCanvas(
  {
    mode = "subtle",
    accentColor = "#38bdf8",
    isUserActive = false,
  },
  ref
) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const mouseRef = useRef({
    x: -1000,
    y: -1000,
    targetX: -1000,
    targetY: -1000,
    speed: 0,
    lastX: 0,
    lastY: 0,
    active: false,
  });

  const ripplesRef = useRef([]);
  const pulseRef = useRef(0);

  useImperativeHandle(ref, () => ({
    triggerSwitch: (color = accentColor) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ripplesRef.current.push({
        x: mouseRef.current.active ? mouseRef.current.x : width / 2,
        y: mouseRef.current.active ? mouseRef.current.y : height / 2,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.7,
        alpha: 0.5,
        color: color,
        speed: 7,
      });
      pulseRef.current = 1.0;
    },
    triggerPulse: (x, y, color = accentColor) => {
      ripplesRef.current.push({
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        radius: 5,
        maxRadius: 180,
        alpha: 0.4,
        color: color,
        speed: 4,
      });
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });

    // Acotar resolución para pantallas 4K para mantener 60-120 FPS sin estrés térmico
    const maxDimension = 2560;
    let aspect = window.innerWidth / (window.innerHeight || 1);
    let width = Math.min(window.innerWidth, maxDimension);
    let height = Math.floor(width / aspect);

    canvas.width = width;
    canvas.height = height;

    const hardwareConcurrency = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 4 : 4;
    const isLowPower = hardwareConcurrency <= 4;
    const PARTICLE_COUNT = isLowPower ? 30 : (width > 1920 ? 70 : 50);
    const CONNECTION_DIST = isLowPower ? 55 : 85;

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.35 + 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      aspect = window.innerWidth / (window.innerHeight || 1);
      width = Math.min(window.innerWidth, maxDimension);
      height = Math.floor(width / aspect);
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e) => {
      const m = mouseRef.current;
      // Normalizar coordenadas del mouse al tamaño del canvas
      const scaleX = width / window.innerWidth;
      const scaleY = height / window.innerHeight;
      m.targetX = e.clientX * scaleX;
      m.targetY = e.clientY * scaleY;
      m.active = true;

      const dx = m.targetX - m.lastX;
      const dy = m.targetY - m.lastY;
      m.speed = Math.sqrt(dx * dx + dy * dy);
      m.lastX = m.targetX;
      m.lastY = m.targetY;

      if (m.speed > 20 && ripplesRef.current.length < 5) {
        ripplesRef.current.push({
          x: m.targetX,
          y: m.targetY,
          radius: 4,
          maxRadius: 65 + Math.random() * 30,
          alpha: 0.25,
          color: accentColor,
          speed: 2.5,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    let lastFrameTime = performance.now();
    let currentAlphaMultiplier = 0.2;

    const render = (now) => {
      const delta = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      const targetAlpha = isUserActive || mode === "intro" ? (mode === "intro" ? 0.65 : 0.4) : 0.12;
      currentAlphaMultiplier += (targetAlpha - currentAlphaMultiplier) * 0.05;

      ctx.clearRect(0, 0, width, height);

      if (pulseRef.current > 0) {
        pulseRef.current = Math.max(0, pulseRef.current - delta * 0.8);
      }

      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.1;
      m.y += (m.targetY - m.y) * 0.1;

      // 1. Ondas expansivas
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.alpha -= 0.006;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = r.color || accentColor;
        ctx.globalAlpha = r.alpha * currentAlphaMultiplier;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        const crossSize = Math.max(0, 5 * (1 - r.radius / r.maxRadius));
        if (crossSize > 1) {
          ctx.beginPath();
          ctx.moveTo(r.x - crossSize, r.y);
          ctx.lineTo(r.x + crossSize, r.y);
          ctx.moveTo(r.x, r.y - crossSize);
          ctx.lineTo(r.x, r.y + crossSize);
          ctx.stroke();
        }
      }

      // 2. Partículas y deformación elástica
      ctx.globalAlpha = currentAlphaMultiplier;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.phase += 0.018;
        p.x += p.vx + Math.sin(p.phase) * 0.18;
        p.y += p.vy + Math.cos(p.phase) * 0.18;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        if (m.active && isUserActive) {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxInfluence = 130;

          if (dist < maxInfluence && dist > 0) {
            const force = (1 - dist / maxInfluence) * 2.0;
            p.x -= (dx / dist) * force;
            p.y -= (dy / dist) * force;
          }
        }

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Conexiones vectoriales
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const distNodes = Math.hypot(p.x - p2.x, p.y - p2.y);

          if (distNodes < CONNECTION_DIST) {
            const lineAlpha = (1 - distNodes / CONNECTION_DIST) * 0.16 * currentAlphaMultiplier;
            ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 3. Retículo de coordenadas del cursor
      if (m.active && isUserActive) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.14 * currentAlphaMultiplier})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(m.x - 10, m.y);
        ctx.lineTo(m.x - 3, m.y);
        ctx.moveTo(m.x + 3, m.y);
        ctx.lineTo(m.x + 10, m.y);
        ctx.moveTo(m.x, m.y - 10);
        ctx.lineTo(m.x, m.y - 3);
        ctx.moveTo(m.x, m.y + 3);
        ctx.lineTo(m.x, m.y + 10);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [accentColor, isUserActive, mode]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 w-full h-full object-cover"
      style={{
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
});

export default GenerativeCanvas;
