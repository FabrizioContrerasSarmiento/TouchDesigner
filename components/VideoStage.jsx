"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import VideoComposition from "./VideoComposition";

/**
 * VideoStage — FASE: SEPARACIÓN VIDEO + AUDIO & VIDEO WALL
 * 
 * Gestiona el escenario audiovisual con arquitectura Doble Deck (Deck A y Deck B):
 * - Cada deck aloja un componente `VideoComposition` completo.
 * - Orquesta la transición y morphing entre composiciones de obras:
 *   las instancias de la obra saliente se desplazan/reducen mientras las instancias
 *   de la obra entrante se despliegan y ocupan el espacio.
 * - Los videos son exclusivamente visuales y permanecen silenciados.
 * - La pista sonora es gestionada por el AudioService independiente.
 */
const VideoStage = forwardRef(function VideoStage(
  {
    currentArtwork,
    nextArtwork,
    isPlaying = true,
    isMuted = false,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onError,
  },
  ref
) {
  // Referencias a los dos decks de composición
  const compARef = useRef(null);
  const compBRef = useRef(null);

  // Deck activo: "A" o "B"
  const [activeDeck, setActiveDeck] = useState("A");

  // Obras asignadas a cada deck
  const [deckAArtwork, setDeckAArtwork] = useState(currentArtwork);
  const [deckBArtwork, setDeckBArtwork] = useState(nextArtwork);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Acceso a la composición activa e inactiva
  const getActiveComp = useCallback(() => {
    return activeDeck === "A" ? compARef.current : compBRef.current;
  }, [activeDeck]);

  const getInactiveComp = useCallback(() => {
    return activeDeck === "A" ? compBRef.current : compARef.current;
  }, [activeDeck]);

  // Actualizar obras en decks cuando no hay transición activa
  useEffect(() => {
    if (activeDeck === "A") {
      setDeckAArtwork(currentArtwork);
      if (nextArtwork && nextArtwork.id !== deckBArtwork?.id) {
        setDeckBArtwork(nextArtwork);
      }
    } else {
      setDeckBArtwork(currentArtwork);
      if (nextArtwork && nextArtwork.id !== deckAArtwork?.id) {
        setDeckAArtwork(nextArtwork);
      }
    }
  }, [currentArtwork, nextArtwork, activeDeck, deckAArtwork?.id, deckBArtwork?.id]);

  // ==========================================================
  // API IMPERATIVA EXPUESTA AL CONTROLADOR PRINCIPAL
  // ==========================================================
  useImperativeHandle(ref, () => ({
    getVideoElement: () => getActiveComp()?.getMasterVideo(),
    getCurrentTime: () => getActiveComp()?.getCurrentTime() || 0,
    getDuration: () => getActiveComp()?.getDuration() || 0,
    
    seek: (time) => {
      getActiveComp()?.seek(time);
    },

    /**
     * Transición y morphing visual entre composiciones
     */
    executeCrossfade: ({
      incomingArtwork,
      duration = 1.1,
      onMidpoint,
      onComplete,
    }) => {
      const currentComp = getActiveComp();
      const nextComp = getInactiveComp();
      const nextDeckId = activeDeck === "A" ? "B" : "A";

      // Asignar la obra entrante al deck inactivo
      if (nextDeckId === "A") {
        setDeckAArtwork(incomingArtwork);
      } else {
        setDeckBArtwork(incomingArtwork);
      }

      if (!currentComp) {
        setActiveDeck(nextDeckId);
        if (onMidpoint) onMidpoint();
        if (onComplete) onComplete();
        return;
      }

      const fadeOutTime = duration * 0.45;
      const fadeInTime = duration * 0.55;

      // 1. Animar salida de las instancias de la composición actual
      currentComp.animateCompositionOut(fadeOutTime, () => {
        // PUNTO MEDIO ESTRICTO (Conmutación limpia)
        currentComp.pause();

        // Conmutar deck activo
        setActiveDeck(nextDeckId);

        if (onMidpoint) onMidpoint();

        requestAnimationFrame(() => {
          const freshNextComp = nextDeckId === "A" ? compARef.current : compBRef.current;
          freshNextComp?.seek(0);
          freshNextComp?.play();

          // 2. Animar entrada de las instancias de la nueva composición hacia sus posiciones de reposo
          freshNextComp?.animateCompositionIn(fadeInTime, () => {
            currentComp.resetLayout();
            if (onComplete) onComplete();
          });
        });
      });
    },
  }));

  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden select-none">
      {/* ========================================================
          DECK A: COMPOSICIÓN MULTI-INSTANCIA
         ======================================================== */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none ${
          activeDeck === "A" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        <VideoComposition
          ref={compARef}
          artwork={deckAArtwork}
          isPlaying={isPlaying && activeDeck === "A"}
          isMuted={true}
          onEnded={activeDeck === "A" ? onEnded : undefined}
          onTimeUpdate={activeDeck === "A" ? onTimeUpdate : undefined}
          onLoadedMetadata={activeDeck === "A" ? onLoadedMetadata : undefined}
          onError={activeDeck === "A" ? onError : undefined}
        />
      </div>

      {/* ========================================================
          DECK B: COMPOSICIÓN MULTI-INSTANCIA
         ======================================================== */}
      <div
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 pointer-events-none ${
          activeDeck === "B" ? "opacity-100 z-10" : "opacity-0 z-0"
        }`}
      >
        <VideoComposition
          ref={compBRef}
          artwork={deckBArtwork}
          isPlaying={isPlaying && activeDeck === "B"}
          isMuted={true}
          onEnded={activeDeck === "B" ? onEnded : undefined}
          onTimeUpdate={activeDeck === "B" ? onTimeUpdate : undefined}
          onLoadedMetadata={activeDeck === "B" ? onLoadedMetadata : undefined}
          onError={activeDeck === "B" ? onError : undefined}
        />
      </div>
    </div>
  );
});

export default VideoStage;
