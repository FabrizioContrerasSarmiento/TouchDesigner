"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Componente modular de reproducción HTML5 Video
 * Diseñado para exhibición en pantallas grandes y proyectores.
 */
export default function VideoPlayer({
  src,
  title,
  number,
  isPlaying,
  isMuted,
  volume = 1,
  fitMode = "contain",
  loop = true,
  accentColor = "#38bdf8",
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onError,
}) {
  const videoRef = useRef(null);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBuffering, setIsBuffering] = useState(true);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Manejo controlado y robusto de reproducción
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsBuffering(false);
        })
        .catch((err) => {
          // Bloqueo de autoplay por políticas del navegador
          if (err.name !== "AbortError") {
            console.warn("Reproducción en espera de interacción:", err.message);
          }
          setIsBuffering(false);
        });
    }
  }, []);

  // Carga de la fuente de video
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    setHasError(false);
    setErrorMessage("");
    setIsBuffering(true);

    video.src = src;
    video.load();

    const handleCanPlay = () => {
      setIsBuffering(false);
      if (isPlayingRef.current) {
        safePlay();
      }
    };

    video.addEventListener("canplay", handleCanPlay, { once: true });

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
    };
  }, [src, safePlay]);

  // Sincronizar estado Play / Pause
  useEffect(() => {
    const video = videoRef.current;
    if (!video || hasError) return;

    if (isPlaying) {
      safePlay();
    } else {
      video.pause();
    }
  }, [isPlaying, hasError, safePlay]);

  // Sincronizar Mute y Volumen
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
    video.volume = volume;
  }, [isMuted, volume]);

  // Sincronizar Loop
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.loop = loop;
  }, [loop]);

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (onTimeUpdate) {
      onTimeUpdate({
        currentTime: video.currentTime,
        duration: video.duration || 0,
        progress: video.duration ? (video.currentTime / video.duration) * 100 : 0,
      });
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setIsBuffering(false);
    if (onLoadedMetadata) {
      onLoadedMetadata({
        duration: video.duration,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
      });
    }
  };

  const handleError = (e) => {
    console.error("Video loading error:", e);
    setHasError(true);
    setErrorMessage(`No se pudo cargar el archivo: ${src}`);
    setIsBuffering(false);
    if (onError) onError(e);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center select-none">
      {/* Elemento de video HTML5 nativo de alto rendimiento */}
      <video
        ref={videoRef}
        className={`w-full h-full transition-all duration-500 ease-out ${
          fitMode === "cover" ? "object-cover" : "object-contain"
        }`}
        playsInline
        muted={isMuted}
        loop={loop}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={onEnded}
        onError={handleError}
      />

      {/* Pantalla de error o archivo no encontrado */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-center p-8 z-20">
          <div
            className="w-16 h-16 rounded-full border border-dashed flex items-center justify-center mb-6 animate-pulse"
            style={{ borderColor: accentColor }}
          >
            <span className="font-mono text-xs text-zinc-400">MP4</span>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
            Obra {number}
          </span>
          <h2 className="text-2xl font-light text-zinc-100 mb-3">{title}</h2>
          <p className="text-sm font-mono text-rose-400 mb-4">{errorMessage}</p>
          <div className="max-w-md bg-zinc-900/80 border border-zinc-800 p-4 rounded text-left text-xs font-mono text-zinc-400 leading-relaxed">
            <p className="text-zinc-300 font-semibold mb-1">Para vincular el archivo de TouchDesigner:</p>
            <p>1. Copia tu video exportado a la carpeta: <span className="text-sky-400">/public/videos/</span></p>
            <p>2. Actualiza la ruta en: <span className="text-sky-400">/data/artworks.js</span></p>
          </div>
        </div>
      )}

      {/* Indicador sutil de carga / buffering */}
      {isBuffering && !hasError && (
        <div className="absolute bottom-16 right-8 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-10 pointer-events-none">
          <div
            className="w-2.5 h-2.5 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-xs font-mono tracking-widest text-zinc-300 uppercase">
            Cargando buffer
          </span>
        </div>
      )}
    </div>
  );
}
