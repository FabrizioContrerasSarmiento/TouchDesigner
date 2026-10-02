"use client";

import gsap from "gsap";

/**
 * AudioService — FASE: SEPARACIÓN VIDEO + AUDIO
 *
 * Controlador de audio independiente de las pistas de video:
 * - Gestiona la reproducción de los archivos /audio/*.mp3
 * - Doble deck para crossfades cinematográficos sin solapamiento
 * - Silencio absoluto en el punto medio de transición
 * - Desbloqueo inicial al interactuar con ENTER EXPERIENCE
 * - Sincronización con play, pause, seek y loop
 */
class AudioService {
  constructor() {
    this.deckA = null;
    this.deckB = null;
    this.activeDeckId = "A";
    this.isMuted = false;
    this.isPlaying = true;
    this.isUnlocked = false;
    this.currentSrc = "";
  }

  init() {
    if (typeof window === "undefined" || this.deckA) return;

    this.deckA = new Audio();
    this.deckB = new Audio();

    [this.deckA, this.deckB].forEach((audio, idx) => {
      audio.preload = "auto";
      audio.volume = 0;
      audio.muted = false;
      audio.loop = true; // Por defecto la música acompaña la obra en bucle
      audio.onerror = (e) => {
        console.error(
          `[AUDIO LOAD NOTICE] Deck ${idx === 0 ? "A" : "B"}:`,
          audio.src,
          e,
        );
      };
    });
  }

  unlock() {
    this.init();
    this.isUnlocked = true;
  }

  getActiveDeck() {
    this.init();
    return this.activeDeckId === "A" ? this.deckA : this.deckB;
  }

  getInactiveDeck() {
    this.init();
    return this.activeDeckId === "A" ? this.deckB : this.deckA;
  }

  /**
   * Reproducir pista inicial o tras salto directo
   */
  playTrack(src, { time = 0, fadeInDuration = 1.0, isMuted = false } = {}) {
    this.init();
    this.isMuted = isMuted;
    this.currentSrc = src;

    const currentAudio = this.getActiveDeck();
    const otherAudio = this.getInactiveDeck();

    // Detener cualquier otra pista residual
    otherAudio.pause();
    otherAudio.volume = 0;
    otherAudio.muted = true;

    gsap.killTweensOf([this.deckA, this.deckB]);

    if (!src) return;

    currentAudio.src = src;
    currentAudio.currentTime = time;
    currentAudio.load();

    if (this.isMuted) {
      currentAudio.muted = true;
      currentAudio.volume = 0;
      currentAudio.play().catch(() => {});
    } else {
      currentAudio.muted = false;
      currentAudio.volume = 0;
      const playPromise = currentAudio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            gsap.to(currentAudio, {
              volume: 1.0,
              duration: fadeInDuration,
              ease: "power2.out",
            });
          })
          .catch((err) => {
            console.warn("Audio play notice:", err.message);
          });
      }
    }
  }

  /**
   * Crossfade cinematográfico de audio entre dos obras (~1s)
   */
  crossfadeTo(
    newSrc,
    { duration = 1.0, isMuted = false, onMidpoint, onComplete } = {},
  ) {
    this.init();
    this.isMuted = isMuted;

    const currentAudio = this.getActiveDeck();
    const nextAudio = this.getInactiveDeck();
    const nextDeckId = this.activeDeckId === "A" ? "B" : "A";

    gsap.killTweensOf([currentAudio, nextAudio]);

    const fadeOutTime = duration * 0.45;
    const fadeInTime = duration * 0.55;

    // 1. Reducción progresiva del audio saliente
    gsap.to(currentAudio, {
      volume: 0,
      duration: fadeOutTime,
      ease: "power2.in",
      onComplete: () => {
        // 2. PUNTO MEDIO ESTRICTO (silencio absoluto, nunca dos pistas a la vez)
        currentAudio.pause();
        currentAudio.muted = true;
        currentAudio.volume = 0;
        currentAudio.currentTime = 0;

        // Conmutar deck activo
        this.activeDeckId = nextDeckId;
        this.currentSrc = newSrc;

        if (onMidpoint) onMidpoint();

        if (!newSrc) {
          if (onComplete) onComplete();
          return;
        }

        // Cargar y reproducir nueva pista
        nextAudio.src = newSrc;
        nextAudio.currentTime = 0;
        nextAudio.load();

        if (this.isMuted) {
          nextAudio.muted = true;
          nextAudio.volume = 0;
          nextAudio.play().catch(() => {});
          if (onComplete) onComplete();
        } else {
          nextAudio.muted = false;
          nextAudio.volume = 0;
          const p = nextAudio.play();
          if (p !== undefined) {
            p.then(() => {
              gsap.to(nextAudio, {
                volume: 1.0,
                duration: fadeInTime,
                ease: "power2.out",
                onComplete: onComplete,
              });
            }).catch(() => {
              if (onComplete) onComplete();
            });
          } else {
            if (onComplete) onComplete();
          }
        }
      },
    });
  }

  pause() {
    this.isPlaying = false;
    const a = this.getActiveDeck();
    if (a) a.pause();
  }

  resume() {
    this.isPlaying = true;
    const a = this.getActiveDeck();
    if (a && a.src) {
      a.play().catch(() => {});
    }
  }

  seek(time) {
    const a = this.getActiveDeck();
    if (a && isFinite(time)) {
      a.currentTime = time;
    }
  }

  getCurrentTime() {
    const a = this.getActiveDeck();
    return a ? a.currentTime : 0;
  }

  setMuted(muted, syncTime) {
    this.isMuted = muted;
    const a = this.getActiveDeck();
    if (!a) return;

    gsap.killTweensOf(a);

    if (muted) {
      gsap.to(a, {
        volume: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          a.muted = true;
        },
      });
    } else {
      if (syncTime !== undefined && isFinite(syncTime)) {
        a.currentTime = syncTime;
      }
      a.muted = false;
      a.volume = 0;
      a.play().catch(() => {});
      gsap.to(a, {
        volume: 1.0,
        duration: 0.45,
        ease: "power2.out",
      });
    }
  }
}

export const audioService = new AudioService();
export default audioService;
