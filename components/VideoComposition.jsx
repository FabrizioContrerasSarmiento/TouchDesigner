"use client";

import {
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import gsap from "gsap";

/**
 * VideoComposition — FASE: SEPARACIÓN VIDEO + AUDIO & VIDEO WALL
 * 
 * - Reproduce los archivos originales .mov exportados desde TouchDesigner.
 * - Todos los elementos <video> están estrictamente silenciados (muted={true})
 *   porque la pista musical se gestiona de forma independiente por audioService.
 * - Conserva resolución nativa en la obra principal sin reescalados forzados.
 * - Distingue con precisión entre estados: loading, loaded, canplay y error real.
 * - En caso de error real, registra detalles en consola (URL, code, message).
 */
const VideoComposition = forwardRef(function VideoComposition(
  {
    artwork,
    isPlaying = true,
    isMuted = false,
    onEnded,
    onTimeUpdate,
    onLoadedMetadata,
    onCanPlay,
    onError,
    className = "",
  },
  ref
) {
  const containerRef = useRef(null);
  const masterVideoRef = useRef(null);
  const slaveCanvasesRef = useRef(new Map());
  const instanceWrappersRef = useRef(new Map());

  const [nativeDims, setNativeDims] = useState({
    width: artwork?.nativeWidth || 1280,
    height: artwork?.nativeHeight || 720,
  });

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Instancias configuradas para la obra
  const instances = artwork?.instances && artwork.instances.length > 0
    ? artwork.instances
    : [
        {
          id: "main",
          isMain: true,
          x: "0vw",
          y: "0vh",
          scale: 1.0,
          rotation: 0,
          opacity: 1.0,
          zIndex: 10,
          fit: "contain",
        },
      ];

  // ==========================================================
  // ARQUITECTURA 1 SOLO DECODER -> MÚLTIPLES REPRESENTACIONES
  // Dibuja el frame del master en los satélites vía Canvas 2D acelerado por hardware
  // ==========================================================
  const drawCanvases = useCallback(() => {
    const master = masterVideoRef.current;
    if (!master || master.readyState < 2) return;
    const w = master.videoWidth || nativeDims.width;
    const h = master.videoHeight || nativeDims.height;
    if (!w || !h) return;

    slaveCanvasesRef.current.forEach((canvas) => {
      if (!canvas) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
      if (ctx) {
        ctx.drawImage(master, 0, 0, w, h);
      }
    });
  }, [nativeDims.width, nativeDims.height]);

  const videoSrc = artwork?.video || artwork?.file;

  // Bucle de renderizado de fotogramas sincronizado al decodificador de video
  useEffect(() => {
    const master = masterVideoRef.current;
    if (!master) return;

    let isMounted = true;
    let rvfcHandle = null;
    let rafHandle = null;

    const renderLoop = () => {
      if (!isMounted) return;
      drawCanvases();
      if ("requestVideoFrameCallback" in master) {
        rvfcHandle = master.requestVideoFrameCallback(renderLoop);
      } else {
        rafHandle = requestAnimationFrame(renderLoop);
      }
    };

    if ("requestVideoFrameCallback" in master) {
      rvfcHandle = master.requestVideoFrameCallback(renderLoop);
    } else {
      rafHandle = requestAnimationFrame(renderLoop);
    }

    return () => {
      isMounted = false;
      if (rvfcHandle !== null && "cancelVideoFrameCallback" in master) {
        master.cancelVideoFrameCallback(rvfcHandle);
      }
      if (rafHandle !== null) {
        cancelAnimationFrame(rafHandle);
      }
    };
  }, [drawCanvases, artwork?.id, videoSrc]);

  // Reproducción segura
  const safePlayAll = useCallback(() => {
    const master = masterVideoRef.current;
    if (master) {
      master.play().catch((err) => {
        if (err.name !== "AbortError") {
          console.warn("VideoComposition Master play notice:", err.message);
        }
      });
    }
  }, []);

  const pauseAll = useCallback(() => {
    if (masterVideoRef.current) masterVideoRef.current.pause();
  }, []);

  // Sincronizar cambios en isPlaying
  useEffect(() => {
    if (isPlaying) {
      safePlayAll();
    } else {
      pauseAll();
    }
  }, [isPlaying, safePlayAll, pauseAll]);

  // Manejo de eventos del master
  const handleMasterPlay = () => {
    drawCanvases();
  };

  const handleMasterPause = () => {
    drawCanvases();
  };

  const handleMasterSeeking = () => {
    drawCanvases();
  };

  const handleMasterTimeUpdate = (e) => {
    const master = e.currentTarget;
    drawCanvases();
    if (onTimeUpdate) {
      onTimeUpdate({
        currentTime: master.currentTime,
        duration: master.duration || 0,
        progress: master.duration ? (master.currentTime / master.duration) * 100 : 0,
      });
    }
  };

  const handleMasterLoadedMetadata = (e) => {
    const master = e.currentTarget;
    const w = master.videoWidth || artwork?.nativeWidth || 1280;
    const h = master.videoHeight || artwork?.nativeHeight || 720;

    setNativeDims({ width: w, height: h });
    setHasError(false);
    setIsLoading(false);

    if (onLoadedMetadata) {
      onLoadedMetadata({
        videoWidth: w,
        videoHeight: h,
        duration: master.duration || 0,
      });
    }
  };

  const handleMasterCanPlay = () => {
    setHasError(false);
    setIsLoading(false);
    if (onCanPlay) onCanPlay();
  };

  const handleError = (e) => {
    const v = e.currentTarget;
    const err = v.error;
    console.error("[VIDEO PLAYBACK ERROR]", {
      src: v.currentSrc || v.src || artwork?.video || artwork?.file,
      networkState: v.networkState,
      readyState: v.readyState,
      errorCode: err ? err.code : null,
      errorMessage: err ? err.message : null,
      mediaError: err ? {
        code: err.code,
        message: err.message
      } : null,
      artwork: artwork?.title,
    });
    setHasError(true);
    setIsLoading(false);
    if (onError) onError(e);
  };

  // Posicionar cada elemento en su estado de reposo exacto
  const elementsToRestState = useCallback(() => {
    instanceWrappersRef.current.forEach((el, id) => {
      if (!el) return;
      const inst = instances.find((i) => i.id === id);
      if (!inst) return;

      if (inst.isMain) {
        // Obra principal: NINGUNA transformación en reposo (píxel 1:1 nativo nítido)
        gsap.set(el, {
          clearProps: "transform,willChange",
          opacity: 1.0,
        });
      } else {
        // Satélites secundarios: posicionamiento compositivo libre
        gsap.set(el, {
          opacity: inst.opacity ?? 0.7,
          scale: inst.scale || 1.0,
          x: inst.x || "0vw",
          y: inst.y || "0vh",
          rotation: inst.rotation || 0,
        });
      }
    });
  }, [instances]);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    elementsToRestState();
  }, [elementsToRestState, artwork?.id, videoSrc]);

  // ==========================================================
  // API IMPERATIVA EXPUESTA AL REPRODUCTOR Y CONTROLADOR
  // ==========================================================
  useImperativeHandle(ref, () => ({
    getMasterVideo: () => masterVideoRef.current,
    getCurrentTime: () => masterVideoRef.current?.currentTime || 0,
    getDuration: () => masterVideoRef.current?.duration || 0,
    getNativeDimensions: () => nativeDims,

    seek: (time) => {
      if (masterVideoRef.current) {
        masterVideoRef.current.currentTime = time;
        drawCanvases();
      }
    },

    play: () => safePlayAll(),
    pause: () => pauseAll(),

    // Animación de salida durante la transición
    animateCompositionOut: (duration = 0.55, onComplete) => {
      const elements = Array.from(instanceWrappersRef.current.values()).filter(Boolean);
      if (elements.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      gsap.killTweensOf(elements);
      gsap.to(elements, {
        scale: (i) => {
          const inst = instances[i] || {};
          return (inst.scale || 1.0) * 0.85;
        },
        opacity: 0,
        y: (i) => (i % 2 === 0 ? "-5vh" : "5vh"),
        duration: duration,
        ease: "power2.in",
        stagger: 0.03,
        onComplete: onComplete,
      });
    },

    // Animación de entrada hacia las posiciones de descanso
    animateCompositionIn: (duration = 0.65, onComplete) => {
      const elements = Array.from(instanceWrappersRef.current.values()).filter(Boolean);
      if (elements.length === 0) {
        if (onComplete) onComplete();
        return;
      }

      gsap.killTweensOf(elements);
      elements.forEach((el, i) => {
        const inst = instances[i] || {};
        gsap.fromTo(
          el,
          {
            opacity: 0,
            scale: (inst.scale || 1.0) * 1.12,
            y: i % 2 === 0 ? "6vh" : "-6vh",
          },
          {
            opacity: inst.opacity ?? 1.0,
            scale: inst.scale || 1.0,
            y: inst.y || "0vh",
            duration: duration,
            ease: "power3.out",
            delay: i * 0.03,
            onComplete: () => {
              if (inst.isMain) {
                gsap.set(el, { clearProps: "transform,willChange", opacity: 1 });
              }
              if (i === elements.length - 1 && onComplete) onComplete();
            },
          }
        );
      });
    },

    resetLayout: () => {
      elementsToRestState();
    },
  }));

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full bg-black overflow-hidden select-none pointer-events-none ${className}`}
    >
      {instances.map((inst, index) => {
        const isMain = inst.isMain || index === 0;

        if (isMain) {
          // ========================================================
          // INSTANCIA PRINCIPAL (HERO)
          // - Resolución nativa respetada sin upscale innecesario
          // - En reposo: cero transforms, cero will-change, overlay puro
          // ========================================================
          return (
            <div
              key={inst.id || "main"}
              ref={(el) => {
                if (el) instanceWrappersRef.current.set(inst.id, el);
                else instanceWrappersRef.current.delete(inst.id);
              }}
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                zIndex: inst.zIndex || 10,
              }}
            >
              <div
                className="relative flex items-center justify-center pointer-events-none overflow-hidden"
                style={{
                  maxWidth: `min(100vw, ${nativeDims.width}px)`,
                  maxHeight: `min(100vh, ${nativeDims.height}px)`,
                  width: "100%",
                  height: "100%",
                }}
              >
                <video
                  ref={(el) => {
                    masterVideoRef.current = el;
                  }}
                  src={videoSrc}
                  className="w-full h-full pointer-events-none select-none object-contain"
                  style={{
                    imageRendering: "high-quality",
                  }}
                  playsInline
                  preload="auto"
                  muted={true}
                  controls={false}
                  disablePictureInPicture
                  disableRemotePlayback
                  onPlay={handleMasterPlay}
                  onPause={handleMasterPause}
                  onSeeking={handleMasterSeeking}
                  onTimeUpdate={handleMasterTimeUpdate}
                  onLoadedMetadata={handleMasterLoadedMetadata}
                  onCanPlay={handleMasterCanPlay}
                  onEnded={onEnded}
                  onError={handleError}
                />
              </div>
            </div>
          );
        }

        // ========================================================
        // INSTANCIAS SECUNDARIAS (SATÉLITES COMPOSITIVOS)
        // - Llenan la pantalla, desbordan bordes y generan volumen
        // - 1 SOLO DECODER: proyectadas vía Canvas 2D desde el master
        // ========================================================
        return (
          <div
            key={inst.id || `inst-${index}`}
            ref={(el) => {
              if (el) instanceWrappersRef.current.set(inst.id, el);
              else instanceWrappersRef.current.delete(inst.id);
            }}
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none will-change-transform"
            style={{
              zIndex: inst.zIndex || 2,
              transform: `translate3d(${inst.x || "0vw"}, ${inst.y || "0vh"}, 0) scale(${inst.scale || 1.0}) rotate(${inst.rotation || 0}deg)`,
              opacity: inst.opacity ?? 0.7,
            }}
          >
            <canvas
              ref={(el) => {
                if (el) slaveCanvasesRef.current.set(inst.id, el);
                else slaveCanvasesRef.current.delete(inst.id);
              }}
              className={`w-full h-full pointer-events-none select-none ${
                inst.fit === "cover" ? "object-cover" : "object-contain"
              }`}
              aria-hidden={true}
            />
          </div>
        );
      })}

      {/* Cartel sutil únicamente si el elemento <video> dispara un error real de reproducción */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 text-center p-8 z-30 font-mono pointer-events-auto">
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-2">
            [ ARCHIVO AUDIOVISUAL NO DISPONIBLE ]
          </p>
          <p className="text-zinc-300 text-sm">{artwork?.title}</p>
        </div>
      )}
    </div>
  );
});

export default VideoComposition;
