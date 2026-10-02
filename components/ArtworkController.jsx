"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import VideoStage from "./VideoStage";
import TransitionManager from "./TransitionManager";
import ContextualInterface from "./ContextualInterface";
import GenerativeCanvas from "./GenerativeCanvas";
import { audioService } from "@/services/audioService";
import { ARTWORKS, EXHIBITION_CONFIG } from "@/data/artworks";

/**
 * ArtworkController — FASE: SEPARACIÓN VIDEO + AUDIO & VIDEO WALL
 * 
 * - Video y Audio 100% desacoplados:
 *   - Video: /videos/*.mov (Directo desde TouchDesigner, resolución nativa, silenciado)
 *   - Audio: /audio/*Musica.mp3 (Gestionado independientemente por audioService)
 * - Crossfade cinematográfico de audio (~1s) sincronizado con el morphing de video.
 * - Desbloqueo de audio tras la interacción en ENTER EXPERIENCE.
 * - Sincronización estricta de reinicio, pausas y activación de sonido.
 * - Cero paneles de diagnóstico visibles.
 */
export default function ArtworkController({ onReturnToIntro }) {
  const transitionRef = useRef(null);
  const videoStageRef = useRef(null);
  const generativeRef = useRef(null);
  const idleTimerRef = useRef(null);
  const kioskReturnTimerRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Estados de la secuencia
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(EXHIBITION_CONFIG.initialMuted ?? false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Modo Exposición Autónomo
  const [isExhibitionMode, setIsExhibitionMode] = useState(
    EXHIBITION_CONFIG.defaultExhibitionMode ?? true
  );

  // Visibilidad contextual por inactividad
  const [isContextVisible, setIsContextVisible] = useState(true);

  // Toast efímero de estado del sistema
  const [toastMessage, setToastMessage] = useState("");
  const toastTimeoutRef = useRef(null);

  const totalArtworks = ARTWORKS.length;
  const currentArtwork = ARTWORKS[currentIndex] || ARTWORKS[0];
  const nextArtwork = ARTWORKS[(currentIndex + 1) % totalArtworks] || ARTWORKS[0];

  const showToast = useCallback((msg) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(""), 2200);
  }, []);

  // Inicialización y desbloqueo de audio independiente al entrar
  useEffect(() => {
    audioService.unlock();
    audioService.playTrack(currentArtwork.audio, {
      time: 0,
      fadeInDuration: 1.0,
      isMuted: isMuted,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Screen Wake Lock para prevenir suspensión en pantallas de sala
  useEffect(() => {
    const requestWakeLock = async () => {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator && isExhibitionMode) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.warn("Wake Lock no disponible:", err.message);
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isExhibitionMode) {
        requestWakeLock();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };
  }, [isExhibitionMode]);

  // Temporizadores de inactividad de usuario
  const handleUserActivity = useCallback(() => {
    setIsContextVisible(true);

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      setIsContextVisible(false);
    }, EXHIBITION_CONFIG.idleHideDelay || 3200);

    if (kioskReturnTimerRef.current) clearTimeout(kioskReturnTimerRef.current);
    kioskReturnTimerRef.current = setTimeout(() => {
      setIsExhibitionMode(true);
      setIsPlaying(true);
      audioService.resume();
      setIsContextVisible(false);
      showToast("RETORNO AUTOMÁTICO A MODO EXPOSICIÓN");
    }, EXHIBITION_CONFIG.kioskReturnTimeout || 30000);
  }, [showToast]);

  useEffect(() => {
    const onMove = () => handleUserActivity();
    const onTouch = () => handleUserActivity();

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchstart", onTouch);

    handleUserActivity();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchstart", onTouch);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (kioskReturnTimerRef.current) clearTimeout(kioskReturnTimerRef.current);
    };
  }, [handleUserActivity]);

  // Transición audiovisual completa (Video Morphing + Audio Crossfade)
  const navigateToArtwork = useCallback(
    (targetIndex) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      handleUserActivity();

      const nextIdx = (targetIndex + totalArtworks) % totalArtworks;
      const outgoingArtwork = ARTWORKS[currentIndex];
      const incomingArtwork = ARTWORKS[nextIdx];
      const transitionType = outgoingArtwork.transition || "fade";
      const duration = outgoingArtwork.transitionDuration || 1.1;

      // Disparar pulso generativo de sincronización
      generativeRef.current?.triggerSwitch(outgoingArtwork.accentColor);

      // 1. Crossfade de video morphing (Doble deck visual)
      videoStageRef.current?.executeCrossfade({
        incomingArtwork: incomingArtwork,
        duration: duration,
        onMidpoint: () => {
          setCurrentIndex(nextIdx);
        },
        onComplete: () => {
          setIsTransitioning(false);
        },
      });

      // 2. Crossfade de audio independiente (~1s con silencio en midpoint)
      audioService.crossfadeTo(incomingArtwork.audio, {
        duration: duration,
        isMuted: isMuted,
      });

      // 3. Capa de transición visual generativa
      transitionRef.current?.executeTransition({
        type: transitionType,
        duration: duration,
        accentColor: outgoingArtwork.accentColor || "#38bdf8",
      });
    },
    [isTransitioning, currentIndex, totalArtworks, handleUserActivity, isMuted]
  );

  const handleNext = useCallback(() => {
    navigateToArtwork(currentIndex + 1);
  }, [currentIndex, navigateToArtwork]);

  const handlePrev = useCallback(() => {
    navigateToArtwork(currentIndex - 1);
  }, [currentIndex, navigateToArtwork]);

  // Al finalizar la obra (video y música vuelven a comenzar desde 0 o avanzan)
  const handleVideoEnded = useCallback(() => {
    videoStageRef.current?.seek(0);
    audioService.seek(0);

    if (isExhibitionMode || EXHIBITION_CONFIG.autoAdvanceOnEnd) {
      handleNext();
    }
  }, [isExhibitionMode, handleNext]);

  // Watchdog de sala: garantiza avance sin interrupción ante anomalías
  useEffect(() => {
    if (!isExhibitionMode) return;

    const watchdog = setInterval(() => {
      const video = videoStageRef.current?.getVideoElement();
      if (video && isPlaying && !isTransitioning) {
        if (video.ended) {
          handleNext();
        }
      }
    }, 8000);

    return () => clearInterval(watchdog);
  }, [isExhibitionMode, isPlaying, isTransitioning, handleNext]);

  // Click en pantalla: emitir onda generativa
  const handleContainerClick = (e) => {
    handleUserActivity();
    generativeRef.current?.triggerPulse(e.clientX, e.clientY, currentArtwork.accentColor);
  };

  // Controles de reproducción y audio
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        audioService.resume();
      } else {
        audioService.pause();
      }
      showToast(next ? "Reproduciendo" : "Pausa");
      return next;
    });
    handleUserActivity();
  }, [handleUserActivity, showToast]);

  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const vTime = videoStageRef.current?.getCurrentTime() || 0;
      audioService.setMuted(next, vTime);
      showToast(next ? "SOUND [MUTED]" : "SOUND [ACTIVE]");
      return next;
    });
    handleUserActivity();
  }, [handleUserActivity, showToast]);

  const toggleFullscreen = useCallback(() => {
    handleUserActivity();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      showToast("Pantalla Completa Activada");
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        showToast("Pantalla Completa Desactivada");
      }
    }
  }, [handleUserActivity, showToast]);

  const toggleExhibitionMode = useCallback(() => {
    setIsExhibitionMode((prev) => {
      const next = !prev;
      if (next) {
        setIsPlaying(true);
        audioService.resume();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        showToast("EXHIBITION MODE // BUCLE AUTÓNOMO");
      } else {
        showToast("MODO MANUAL");
      }
      return next;
    });
    handleUserActivity();
  }, [handleUserActivity, showToast]);

  // Atajos de teclado (D removido del diagnóstico)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["input", "textarea"].includes(e.target.tagName?.toLowerCase())) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "KeyM":
          e.preventDefault();
          toggleSound();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyE":
          e.preventDefault();
          toggleExhibitionMode();
          break;
        case "Escape":
          if (!document.fullscreenElement && onReturnToIntro) {
            e.preventDefault();
            audioService.pause();
            onReturnToIntro();
          }
          break;
        default:
          if (e.key >= "1" && e.key <= String(totalArtworks)) {
            const target = parseInt(e.key, 10) - 1;
            if (target !== currentIndex) {
              navigateToArtwork(target);
            }
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleNext,
    handlePrev,
    togglePlay,
    toggleSound,
    toggleFullscreen,
    toggleExhibitionMode,
    currentIndex,
    totalArtworks,
    navigateToArtwork,
    onReturnToIntro,
  ]);

  return (
    <section
      className="relative w-screen h-screen bg-black overflow-hidden select-none transition-[cursor] duration-500"
      style={{
        cursor: isContextVisible ? "default" : "none",
      }}
      onClick={handleContainerClick}
    >
      {/* 1. Capa de Video (VideoStage) con Arquitectura de Composición Multi-instancia y Morphing */}
      <TransitionManager ref={transitionRef}>
        <VideoStage
          ref={videoStageRef}
          currentArtwork={currentArtwork}
          nextArtwork={nextArtwork}
          isPlaying={isPlaying}
          isMuted={true}
          onEnded={handleVideoEnded}
        />
      </TransitionManager>

      {/* 2. Capa visual generativa interactiva */}
      <GenerativeCanvas
        ref={generativeRef}
        accentColor={currentArtwork.accentColor || "#38bdf8"}
        isUserActive={isContextVisible}
        mode={isTransitioning ? "transition" : "subtle"}
      />

      {/* 3. Interfaz contextual museográfica adaptativa */}
      <ContextualInterface
        artwork={currentArtwork}
        currentIndex={currentIndex}
        totalArtworks={totalArtworks}
        isVisible={isContextVisible}
        isMuted={isMuted}
        isExhibitionMode={isExhibitionMode}
        onToggleSound={toggleSound}
        onToggleExhibitionMode={toggleExhibitionMode}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* 4. Notificación efímera en pantalla */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all">
          <div className="bg-black/90 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full text-[11px] font-mono tracking-widest text-zinc-200 shadow-2xl flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: currentArtwork.accentColor || "#38bdf8" }}
            />
            {toastMessage}
          </div>
        </div>
      )}
    </section>
  );
}
