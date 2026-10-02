"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * ContextualInterface — FASE: ADAPTACIÓN DE ASPECT RATIO Y PRESENTACIÓN CINEMATOGRÁFICA
 * 
 * - Si la obra es vertical o cuadrada: sitúa la información preferentemente en las zonas laterales
 *   libres sobre el fondo ambiental, sin tapar la obra principal.
 * - Si la obra es horizontal: utiliza un layout etéreo con transparencias sutiles.
 * - Desaparece por completo durante la contemplación.
 */
export default function ContextualInterface({
  artwork,
  currentIndex,
  totalArtworks,
  isVisible,
  isMuted = false,
  isExhibitionMode = true,
  aspectData = null,
  onToggleSound,
  onToggleExhibitionMode,
  onPrev,
  onNext,
}) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const titleRef = useRef(null);
  const metaRef = useRef(null);
  const navPrevRef = useRef(null);
  const soundBtnRef = useRef(null);
  const navNextRef = useRef(null);
  const lineLeftRef = useRef(null);
  const lineRightRef = useRef(null);
  const modeBadgeRef = useRef(null);

  const currentFormatted = String(currentIndex + 1).padStart(2, "0");
  const totalFormatted = String(totalArtworks).padStart(2, "0");

  const isMulti = artwork?.layout === "multi";
  const instanceCount = artwork?.instanceCount || (artwork?.instances?.length ?? 1);

  useEffect(() => {
    const elements = [
      counterRef.current,
      titleRef.current,
      metaRef.current,
      navPrevRef.current,
      soundBtnRef.current,
      navNextRef.current,
      lineLeftRef.current,
      lineRightRef.current,
      modeBadgeRef.current,
    ].filter(Boolean);

    if (isVisible) {
      gsap.killTweensOf(elements);
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        counterRef.current,
        { opacity: 0, y: -6 },
        { opacity: 0.85, y: 0, duration: 0.8 }
      )
        .fromTo(
          titleRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.9 },
          "-=0.6"
        )
        .fromTo(
          metaRef.current,
          { opacity: 0, y: 6 },
          { opacity: 0.75, y: 0, duration: 0.8 },
          "-=0.6"
        )
        .fromTo(
          [navPrevRef.current, lineLeftRef.current, soundBtnRef.current, lineRightRef.current, navNextRef.current, modeBadgeRef.current],
          { opacity: 0 },
          { opacity: 0.85, duration: 0.9, stagger: 0.06 },
          "-=0.5"
        );
    } else {
      gsap.killTweensOf(elements);
      gsap.to(elements, {
        opacity: 0,
        y: (i) => (i < 3 ? -4 : 4),
        duration: 0.8,
        ease: "power2.inOut",
        stagger: 0.03,
      });
    }
  }, [isVisible, currentIndex]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none select-none z-30 transition-all duration-700 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* ========================================================
          CÉDULA TIPOGRÁFICA DE SALA
          Composición minimalista de museo contemporáneo
         ======================================================== */}
      <div className="absolute top-10 left-10 md:top-14 md:left-16 max-w-xl flex flex-col items-start transition-all duration-500 z-30 pointer-events-none">
        {/* 1. Contador: 01 / 05 y etiqueta de composición */}
        <div ref={counterRef} className="opacity-0 flex items-center gap-3">
          <span className="font-mono text-xs md:text-sm tracking-[0.35em] text-zinc-400 font-light">
            {currentFormatted} <span className="text-zinc-600">/</span> {totalFormatted}
          </span>
          {isMulti && (
            <span className="text-[10px] font-mono tracking-[0.25em] text-zinc-500 uppercase px-2 py-0.5 rounded border border-white/10 bg-black/40 backdrop-blur-sm">
              COMPOSITION // {instanceCount}X
            </span>
          )}
        </div>

        {/* Línea fina divisoria de museo */}
        <div className="w-8 h-[1px] bg-white/20 my-3.5" />

        {/* 2. TÍTULO DE LA OBRA */}
        <div ref={titleRef} className="opacity-0">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extralight tracking-[0.2em] uppercase text-zinc-100 leading-tight">
            {artwork?.title}
          </h2>
        </div>

        {/* 3. GENERATIVE AUDIOVISUAL \n TOUCHDESIGNER · 2026 */}
        <div ref={metaRef} className="opacity-0 mt-3 flex flex-col gap-1">
          <span className="font-mono text-[11px] md:text-xs tracking-[0.3em] uppercase text-zinc-400 font-light">
            {artwork?.technique || "GENERATIVE AUDIOVISUAL"}
          </span>
          <span className="font-mono text-[11px] md:text-xs tracking-[0.3em] uppercase text-zinc-500 font-light">
            {artwork?.software || "TOUCHDESIGNER"} · {artwork?.year || "2026"}
          </span>
        </div>
      </div>

      {/* Insignia discreta de Modo Exposición en esquina superior derecha */}
      <div
        ref={modeBadgeRef}
        className="absolute top-10 right-10 md:top-14 md:right-16 opacity-0 pointer-events-auto"
      >
        <button
          onClick={onToggleExhibitionMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 text-[10px] font-mono tracking-widest text-zinc-400 hover:text-zinc-200 uppercase transition-all backdrop-blur-sm"
          title="Alternar Modo Exposición (Tecla E)"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isExhibitionMode ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span>{isExhibitionMode ? "EXHIBITION LOOP" : "MANUAL"}</span>
        </button>
      </div>

      {/* ========================================================
          NAVEGACIÓN CONTEXTUAL INFERIOR
          ← PREVIOUS                         SOUND                         NEXT →
         ======================================================== */}
      <footer className="absolute bottom-10 inset-x-10 md:bottom-14 md:inset-x-16 flex items-center justify-between pointer-events-auto">
        {/* Control PREVIOUS */}
        <button
          ref={navPrevRef}
          onClick={onPrev}
          className="group opacity-0 flex items-center gap-3 font-mono text-xs md:text-sm tracking-[0.35em] uppercase text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer focus:outline-none"
          title="Obra anterior (←)"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1.5 text-zinc-500 group-hover:text-white">
            ←
          </span>
          <span>PREVIOUS</span>
        </button>

        {/* Línea izquierda de espacio negativo */}
        <div
          ref={lineLeftRef}
          className="opacity-0 hidden sm:block flex-1 mx-6 md:mx-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        {/* Control central SOUND */}
        <button
          ref={soundBtnRef}
          onClick={onToggleSound}
          className="opacity-0 flex items-center gap-2.5 px-4 py-2 font-mono text-xs md:text-sm tracking-[0.35em] uppercase transition-all duration-300 cursor-pointer focus:outline-none text-zinc-300 hover:text-white group"
          title={isMuted ? "Activar sonido (M)" : "Silenciar sonido (M)"}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              !isMuted ? "bg-sky-400 animate-pulse" : "bg-zinc-600"
            }`}
          />
          <span className="group-hover:tracking-[0.4em] transition-all">SOUND</span>
          <span className="text-[10px] font-mono text-zinc-500">
            [{!isMuted ? "ON" : "OFF"}]
          </span>
        </button>

        {/* Línea derecha de espacio negativo */}
        <div
          ref={lineRightRef}
          className="opacity-0 hidden sm:block flex-1 mx-6 md:mx-10 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />

        {/* Control NEXT */}
        <button
          ref={navNextRef}
          onClick={onNext}
          className="group opacity-0 flex items-center gap-3 font-mono text-xs md:text-sm tracking-[0.35em] uppercase text-zinc-400 hover:text-white transition-all duration-300 cursor-pointer focus:outline-none"
          title="Obra siguiente (→)"
        >
          <span>NEXT</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1.5 text-zinc-500 group-hover:text-white">
            →
          </span>
        </button>
      </footer>
    </div>
  );
}
