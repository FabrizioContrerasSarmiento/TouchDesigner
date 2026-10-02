"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { EXHIBITION_CONFIG } from "@/data/artworks";

/**
 * FASE 2 & 7 — INTRO & EXHIBITION ENTRY
 *
 * Experiencia de entrada minimalista para instalación audiovisual.
 * Cuenta con temporizador de inicio autónomo para salas de exposición sin supervisión.
 */
export default function IntroExperience({ onEnter }) {
  const containerRef = useRef(null);
  const titleLine1Ref = useRef(null);
  const titleLine2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const buttonRef = useRef(null);
  const canvasRef = useRef(null);
  const metaRef = useRef(null);

  const [isEntering, setIsEntering] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Transición al hacer click en ENTER EXPERIENCE o activar EXHIBITION MODE
  const handleEnterClick = useCallback(() => {
    if (isEntering) return;
    setIsEntering(true);

    const tl = gsap.timeline({
      onComplete: () => {
        if (onEnter) onEnter();
      },
    });

    // Desvanecimiento elegante y expansivo hacia la obra
    tl.to(
      [
        buttonRef.current,
        subtitleRef.current,
        titleLine2Ref.current,
        titleLine1Ref.current,
      ],
      {
        opacity: 0,
        y: -25,
        stagger: 0.08,
        duration: 0.7,
        ease: "power2.in",
      },
    )
      .to(
        metaRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        "-=0.4",
      )
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.9,
          ease: "power2.inOut",
        },
        "-=0.3",
      );
  }, [isEntering, onEnter]);

  // FASE 7: Inicio autónomo en sala de exhibición si nadie interactúa
  useEffect(() => {
    const timer = setTimeout(() => {
      handleEnterClick();
    }, EXHIBITION_CONFIG.introAutostartTimeout || 20000);

    return () => clearTimeout(timer);
  }, [handleEnterClick]);

  // Atajos de teclado en Intro (Espacio, Enter o E para iniciar)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["Space", "Enter", "KeyE"].includes(e.code)) {
        e.preventDefault();
        handleEnterClick();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEnterClick]);

  // Animación de entrada con GSAP para los textos
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      metaRef.current?.children || [],
      { opacity: 0 },
      { opacity: 0.6, duration: 1.2, stagger: 0.1, delay: 0.2 },
    )
      .fromTo(
        [titleLine1Ref.current, titleLine2Ref.current],
        { opacity: 0, y: 30, letterSpacing: "0.25em" },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0.15em",
          duration: 1.4,
          stagger: 0.15,
        },
        "-=0.8",
      )
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 15 },
        { opacity: 0.7, y: 0, duration: 1.2 },
        "-=0.9",
      )
      .fromTo(
        buttonRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1 },
        "-=0.7",
      );

    const pulseAnim = gsap.to(buttonRef.current, {
      opacity: 0.75,
      repeat: -1,
      yoyo: true,
      duration: 2.2,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
      pulseAnim.kill();
    };
  }, []);

  // Reacciones visuales sutiles del cursor
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 120,
      active: false,
    };

    const ripples = [];
    const particles = [];
    const PARTICLE_COUNT = 45;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        originX: Math.random() * width,
        originY: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.25 + 0.05,
      });
    }

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;

      if (Math.random() > 0.85 && ripples.length < 8) {
        ripples.push({
          x: e.clientX,
          y: e.clientY,
          radius: 5,
          maxRadius: 80 + Math.random() * 40,
          alpha: 0.25,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      if (mouse.active) {
        const gradient = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          mouse.radius,
        );
        gradient.addColorStop(0, "rgba(56, 189, 248, 0.04)");
        gradient.addColorStop(0.5, "rgba(168, 85, 247, 0.015)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mouse.x - 8, mouse.y);
        ctx.lineTo(mouse.x + 8, mouse.y);
        ctx.moveTo(mouse.x, mouse.y - 8);
        ctx.lineTo(mouse.x, mouse.y + 8);
        ctx.stroke();
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 0.8;
        r.alpha -= 0.003;

        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.4})`;
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && mouse.active) {
          const force = (1 - dist / mouse.radius) * 1.5;
          p.x -= (dx / dist) * force;
          p.y -= (dy / dist) * force;
        }

        ctx.fillStyle = `rgba(240, 240, 245, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-8 md:p-12 overflow-hidden select-none cursor-default"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* Marcas de registro perimetrales */}
      <div
        ref={metaRef}
        className="relative z-10 w-full flex items-start justify-between text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none"
      >
        <div className="flex items-center gap-3">
          <span className="text-zinc-600">+</span>
          <span>ARCHIVE // 001</span>
        </div>
        <div className="flex items-center gap-3 text-right">
          <span>TOUCHDESIGNER ENGINE</span>
          <span className="text-zinc-600">+</span>
        </div>
      </div>

      {/* Composición tipográfica central */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center px-4">
        <h1 className="flex flex-col items-center font-light leading-tight">
          <span
            ref={titleLine1Ref}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.18em] font-extralight text-zinc-100 uppercase"
          >
            EXPERIMENTAL
          </span>
          <span
            ref={titleLine2Ref}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-[0.18em] font-extralight text-zinc-400 uppercase mt-1 md:mt-2"
          >
            VISUAL ARCHIVE
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 md:mt-8 text-xs sm:text-sm font-mono tracking-[0.3em] uppercase text-zinc-400 font-light"
        >
          TOUCHDESIGNER / AUDIOVISUAL STUDIES
        </p>

        {/* Disparador de entrada minimalista y modo exposición */}
        <div className="mt-12 md:mt-16 flex flex-col items-center gap-5">
          <button
            ref={buttonRef}
            onClick={handleEnterClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={isEntering}
            className="group relative inline-flex items-center gap-4 px-6 py-3 font-mono text-xs sm:text-sm tracking-[0.35em] uppercase text-zinc-200 transition-all duration-300 cursor-pointer focus:outline-none"
            aria-label="Enter Experience"
          >
            <span
              className={`h-[1px] bg-zinc-600 transition-all duration-500 ${
                isHovered ? "w-10 bg-white" : "w-4"
              }`}
            />
            <span className="relative">
              ENTER EXPERIENCE
              <span
                className={`absolute inset-0 blur-sm transition-opacity duration-300 pointer-events-none ${
                  isHovered ? "opacity-70 text-white" : "opacity-0"
                }`}
              >
                ENTER EXPERIENCE
              </span>
            </span>
            <span
              className={`h-[1px] bg-zinc-600 transition-all duration-500 ${
                isHovered ? "w-10 bg-white" : "w-4"
              }`}
            />
          </button>

          {/* Acceso directo a Modo Exposición */}
          <button
            onClick={handleEnterClick}
            className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 hover:text-zinc-300 uppercase transition-colors"
          >
            [ EXHIBITION MODE — TECLA E ]
          </button>
        </div>
      </div>

      {/* Pie perimetral */}
      <div className="relative z-10 w-full flex items-end justify-between text-[11px] font-mono tracking-widest text-zinc-500 uppercase pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="text-zinc-600">+</span>
          <span>SEC. AUDIOVISUAL LAB // 2026</span>
        </div>
        <div className="flex items-center gap-3 text-right">
          <span className="hidden sm:inline">AUTORUN IN SALA HABILITADO</span>
          <span className="text-zinc-600">+</span>
        </div>
      </div>
    </section>
  );
}
