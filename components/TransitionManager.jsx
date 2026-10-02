"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

/**
 * TransitionManager — FASE 8: POLISH & PERFORMANCE
 * 
 * Motor de transiciones desacoplado calibrado para 1080p, 1440p y 4K (2160p).
 * 
 * Optimizaciones de rendimiento:
 * - Resolución de canvas acotada a máximo 2560px con escalado CSS en 4K.
 * - Liberación inmediata de memoria al completar la animación.
 * - Eliminación de saltos y frames negros imprevistos.
 * - Sincronización precisa de punto medio con cambio de obra.
 */
const TransitionManager = forwardRef(function TransitionManager(
  { children },
  ref
) {
  const canvasRef = useRef(null);
  const isRunningRef = useRef(false);
  const animFrameRef = useRef(null);
  const tweenRef = useRef(null);

  // Limpieza total al desmontar el componente
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    executeTransition: ({
      type = "fade",
      duration = 1.0,
      accentColor = "#38bdf8",
      onMidpoint,
      onComplete,
    }) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      const canvas = canvasRef.current;
      if (!canvas) {
        if (onMidpoint) onMidpoint();
        if (onComplete) onComplete();
        isRunningRef.current = false;
        return;
      }

      const ctx = canvas.getContext("2d", { alpha: true });

      // Optimización para pantallas 4K (2160p): acotar resolución interna sin pérdida perceptual
      const maxDimension = 2560;
      const aspect = window.innerWidth / (window.innerHeight || 1);
      const width = Math.min(window.innerWidth, maxDimension);
      const height = Math.floor(width / aspect);

      canvas.width = width;
      canvas.height = height;

      // Estado de interpolación
      const state = {
        progress: 0,
        midpointFired: false,
      };

      // Inicializar partículas si corresponde
      let particles = [];
      if (type === "particles") {
        const count = width > 1920 ? 160 : 100;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 8 + 3;
          particles.push({
            x: width * 0.5 + (Math.random() - 0.5) * 180,
            y: height * 0.5 + (Math.random() - 0.5) * 180,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 2.5 + 1,
            alpha: Math.random() * 0.8 + 0.2,
            color: Math.random() > 0.4 ? accentColor : "#ffffff",
          });
        }
      }

      // Parámetros de cortes glitch
      const glitchSlices = [];
      for (let i = 0; i < 12; i++) {
        glitchSlices.push({
          y: Math.random() * height,
          h: Math.random() * 50 + 12,
          offset: (Math.random() - 0.5) * 80,
        });
      }

      // Render loop
      const render = () => {
        const p = state.progress;
        ctx.clearRect(0, 0, width, height);

        // Curva envolvente de intensidad (0 -> 1 en midpoint -> 0)
        const envelope = Math.sin(p * Math.PI);

        switch (type) {
          // 1. FADE
          case "fade": {
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope * 1.0})`;
            ctx.fillRect(0, 0, width, height);
            break;
          }

          // 2. GLITCH
          case "glitch": {
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope * 0.85})`;
            ctx.fillRect(0, 0, width, height);

            if (envelope > 0.05) {
              const sliceCount = Math.floor(envelope * 10) + 2;
              for (let i = 0; i < sliceCount; i++) {
                const slice = glitchSlices[(i + Math.floor(p * 18)) % glitchSlices.length];
                const shift = slice.offset * envelope * (Math.random() > 0.5 ? 1 : -1);

                ctx.fillStyle = Math.random() > 0.5 ? `${accentColor}33` : "rgba(255, 255, 255, 0.12)";
                ctx.fillRect(shift > 0 ? 0 : shift, slice.y, width + Math.abs(shift), slice.h);

                ctx.strokeStyle = Math.random() > 0.6 ? "#ff0055" : "#00ffff";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, slice.y);
                ctx.lineTo(width, slice.y);
                ctx.stroke();
              }

              // Scanlines
              ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
              for (let y = 0; y < height; y += 4) {
                ctx.fillRect(0, y, width, 1.5);
              }
            }
            break;
          }

          // 3. DISPLACEMENT
          case "displacement": {
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope * 0.75})`;
            ctx.fillRect(0, 0, width, height);

            if (envelope > 0.05) {
              const bands = 22;
              const bandH = height / bands;
              const phase = p * 16;

              for (let i = 0; i < bands; i++) {
                const waveShift = Math.sin(i * 0.45 + phase) * 70 * envelope;
                ctx.fillStyle = i % 2 === 0 ? "rgba(0, 0, 0, 0.4)" : `${accentColor}18`;
                ctx.fillRect(waveShift, i * bandH, width, bandH);

                ctx.strokeStyle = `rgba(255, 255, 255, ${envelope * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(waveShift, i * bandH);
                ctx.lineTo(waveShift + width, i * bandH);
                ctx.stroke();
              }
            }
            break;
          }

          // 4. PARTICLES
          case "particles": {
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope * 0.9})`;
            ctx.fillRect(0, 0, width, height);

            if (envelope > 0.02) {
              particles.forEach((pt) => {
                const direction = p < 0.5 ? 1 : -1;
                pt.x += pt.vx * direction * envelope * 2.2;
                pt.y += pt.vy * direction * envelope * 2.2;

                ctx.fillStyle = pt.color;
                ctx.globalAlpha = pt.alpha * envelope;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size * (1 + envelope * 1.8), 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = pt.color;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(pt.x - pt.vx * 2.5 * envelope, pt.y - pt.vy * 2.5 * envelope);
                ctx.stroke();
              });
              ctx.globalAlpha = 1;
            }
            break;
          }

          // 5. DIGITAL NOISE
          case "digital-noise": {
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope * 0.8})`;
            ctx.fillRect(0, 0, width, height);

            if (envelope > 0.05) {
              const blockSize = 32;
              const cols = Math.ceil(width / blockSize);
              const rows = Math.ceil(height / blockSize);
              const density = envelope * 0.55;

              for (let c = 0; c < cols; c++) {
                for (let r = 0; r < rows; r++) {
                  if (Math.random() < density) {
                    const lum = Math.floor(Math.random() * 180 + 30);
                    ctx.fillStyle = Math.random() > 0.85
                      ? accentColor
                      : `rgba(${lum}, ${lum}, ${lum}, ${Math.random() * 0.6 + 0.2})`;
                    ctx.fillRect(c * blockSize, r * blockSize, blockSize, blockSize);
                  }
                }
              }

              const beamY = ((p * 3) % 1) * height;
              ctx.fillStyle = `rgba(255, 255, 255, ${envelope * 0.4})`;
              ctx.fillRect(0, beamY, width, 3);
            }
            break;
          }

          // 6. DISTORTION / WIPE
          case "distortion":
          case "wipe": {
            const wipeX = p * (width + 300) - 150;
            const wipeWidth = 140;

            if (p < 0.5) {
              ctx.fillStyle = `rgba(0, 0, 0, ${p * 2})`;
              ctx.fillRect(0, 0, Math.max(0, wipeX), height);
            } else {
              ctx.fillStyle = `rgba(0, 0, 0, ${(1 - p) * 2})`;
              ctx.fillRect(Math.min(width, wipeX), 0, width - wipeX, height);
            }

            const gradient = ctx.createLinearGradient(wipeX - wipeWidth, 0, wipeX, 0);
            gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
            gradient.addColorStop(0.7, `${accentColor}55`);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");

            ctx.fillStyle = gradient;
            ctx.fillRect(wipeX - wipeWidth, 0, wipeWidth, height);

            ctx.strokeStyle = "#ffffff";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(wipeX, 0);
            ctx.lineTo(wipeX, height);
            ctx.stroke();
            break;
          }

          default:
            ctx.fillStyle = `rgba(0, 0, 0, ${envelope})`;
            ctx.fillRect(0, 0, width, height);
        }

        if (state.progress < 1) {
          animFrameRef.current = requestAnimationFrame(render);
        }
      };

      animFrameRef.current = requestAnimationFrame(render);

      tweenRef.current = gsap.to(state, {
        progress: 1,
        duration: duration,
        ease: "power2.inOut",
        onUpdate: () => {
          // Conmutación en el punto medio de máxima opacidad (cero parpadeo)
          if (state.progress >= 0.5 && !state.midpointFired) {
            state.midpointFired = true;
            if (onMidpoint) onMidpoint();
          }
        },
        onComplete: () => {
          if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
          ctx.clearRect(0, 0, width, height);
          isRunningRef.current = false;
          if (onComplete) onComplete();
        },
      });
    },
    isTransitioning: () => isRunningRef.current,
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Contenido audiovisual (VideoStage) */}
      {children}

      {/* Canvas modular de efectos generativos (acotado a 100% de la ventana) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 w-full h-full object-cover"
        style={{ mixBlendMode: "screen" }}
        aria-hidden="true"
      />
    </div>
  );
});

export default TransitionManager;
