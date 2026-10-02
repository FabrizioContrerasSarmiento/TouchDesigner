"use client";

import { useState, useCallback } from "react";
import IntroExperience from "./IntroExperience";
import ArtworkController from "./ArtworkController";

/**
 * ExhibitionExperience — Coordinador de alto nivel
 * 
 * Flujo:
 * INTRO (IntroExperience)
 *  ↓ [Click en ENTER EXPERIENCE]
 * SECUENCIA AUDIOVISUAL (ArtworkController -> TransitionManager -> VideoStage)
 *  ↓ [Escape cuando no está en Fullscreen]
 * Regreso al Archivo / Intro
 */
export default function ExhibitionExperience() {
  const [hasEntered, setHasEntered] = useState(false);

  const handleEnterExperience = useCallback(() => {
    setHasEntered(true);
  }, []);

  const handleReturnToIntro = useCallback(() => {
    setHasEntered(false);
  }, []);

  return (
    <main className="relative w-screen h-screen bg-black overflow-hidden select-none">
      {!hasEntered ? (
        <IntroExperience onEnter={handleEnterExperience} />
      ) : (
        <ArtworkController onReturnToIntro={handleReturnToIntro} />
      )}
    </main>
  );
}
