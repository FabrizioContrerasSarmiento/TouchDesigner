/**
 * Catálogo Central de Obras Audiovisuales para la Exhibición "SECUENCIA"
 * 
 * FASE: SEPARACIÓN VIDEO + AUDIO
 * - Video original exportado desde TouchDesigner (.mov)
 * - Pista de audio independiente (.mp3)
 * - Reproducción y sincronización desacopladas
 */

export const ARTWORKS = [
  {
    id: 1,
    number: "01",
    title: "COLORS",
    video: "/videos/Colors.mp4",
    file: "/videos/Colors.mp4",
    audio: "/audio/ColorsMusica.mp3",
    nativeWidth: 1000,
    nativeHeight: 1000,
    technique: "GENERATIVE AUDIOVISUAL",
    software: "TOUCHDESIGNER",
    year: "2026",
    layout: "multi",
    instanceCount: 4,
    instances: [
      {
        id: "main",
        isMain: true,
        x: "0vw",
        y: "0vh",
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        fit: "contain"
      },
      {
        id: "left-satellite",
        isMain: false,
        x: "-30vw",
        y: "-2vh",
        scale: 0.84,
        rotation: -3.5,
        opacity: 0.72,
        zIndex: 4,
        fit: "contain"
      },
      {
        id: "right-satellite",
        isMain: false,
        x: "30vw",
        y: "2vh",
        scale: 0.86,
        rotation: 2.8,
        opacity: 0.75,
        zIndex: 5,
        fit: "contain"
      },
      {
        id: "backdrop-aura",
        isMain: false,
        x: "0vw",
        y: "0vh",
        scale: 1.42,
        rotation: 0,
        opacity: 0.22,
        zIndex: 1,
        fit: "cover"
      }
    ],
    transition: "particles",
    transitionDuration: 1.2,
    accentColor: "#f43f5e",
    description: "Estudio cromático generativo sobre modulación de frecuencias y síntesis espectral visual."
  },
  {
    id: 2,
    number: "02",
    title: "CUADRADOS",
    video: "/videos/Cuadrados.mp4",
    file: "/videos/Cuadrados.mp4",
    audio: "/audio/CuadradosMusica.mp3",
    nativeWidth: 1280,
    nativeHeight: 720,
    technique: "GENERATIVE AUDIOVISUAL",
    software: "TOUCHDESIGNER",
    year: "2026",
    layout: "single",
    instanceCount: 1,
    instances: [
      {
        id: "main",
        isMain: true,
        x: "0vw",
        y: "0vh",
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        fit: "contain"
      }
    ],
    transition: "displacement",
    transitionDuration: 1.1,
    accentColor: "#38bdf8",
    description: "Estructuras ortogonales recursivas en resonancia con patrones rítmicos percusivos."
  },
  {
    id: 3,
    number: "03",
    title: "INFINITO",
    video: "/videos/Infinito.mp4",
    file: "/videos/Infinito.mp4",
    audio: "/audio/InfinitoMusica.mp3",
    nativeWidth: 1000,
    nativeHeight: 1000,
    technique: "GENERATIVE AUDIOVISUAL",
    software: "TOUCHDESIGNER",
    year: "2026",
    layout: "multi",
    instanceCount: 4,
    instances: [
      {
        id: "main",
        isMain: true,
        x: "0vw",
        y: "0vh",
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        fit: "contain"
      },
      {
        id: "portal-left",
        isMain: false,
        x: "-28vw",
        y: "-5vh",
        scale: 0.76,
        rotation: -2.0,
        opacity: 0.62,
        zIndex: 4,
        fit: "contain"
      },
      {
        id: "portal-right",
        isMain: false,
        x: "28vw",
        y: "5vh",
        scale: 0.76,
        rotation: 2.0,
        opacity: 0.62,
        zIndex: 4,
        fit: "contain"
      },
      {
        id: "cosmic-depth",
        isMain: false,
        x: "0vw",
        y: "0vh",
        scale: 1.35,
        rotation: 0,
        opacity: 0.18,
        zIndex: 1,
        fit: "cover"
      }
    ],
    transition: "glitch",
    transitionDuration: 1.0,
    accentColor: "#a855f7",
    description: "Bucles de retroalimentación infinita y transformaciones topológicas en tiempo real."
  },
  {
    id: 4,
    number: "04",
    title: "MATRIX",
    video: "/videos/Matrix.mp4",
    file: "/videos/Matrix.mp4",
    audio: "/audio/MatrixMusica.mp3",
    nativeWidth: 1280,
    nativeHeight: 720,
    technique: "GENERATIVE AUDIOVISUAL",
    software: "TOUCHDESIGNER",
    year: "2026",
    layout: "multi",
    instanceCount: 3,
    instances: [
      {
        id: "main",
        isMain: true,
        x: "0vw",
        y: "0vh",
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        fit: "contain"
      },
      {
        id: "stream-left",
        isMain: false,
        x: "-30vw",
        y: "5vh",
        scale: 0.80,
        rotation: -1.5,
        opacity: 0.65,
        zIndex: 4,
        fit: "contain"
      },
      {
        id: "stream-right",
        isMain: false,
        x: "30vw",
        y: "-6vh",
        scale: 0.76,
        rotation: 1.2,
        opacity: 0.52,
        zIndex: 2,
        fit: "contain"
      }
    ],
    transition: "digital-noise",
    transitionDuration: 1.1,
    accentColor: "#10b981",
    description: "Deconstrucción algorítmica de campos vectoriales y flujos de datos audiovisuales densos."
  },
  {
    id: 5,
    number: "05",
    title: "OLAS",
    video: "/videos/Olas.mp4",
    file: "/videos/Olas.mp4",
    audio: "/audio/OlasMusica.mp3",
    nativeWidth: 1280,
    nativeHeight: 720,
    technique: "GENERATIVE AUDIOVISUAL",
    software: "TOUCHDESIGNER",
    year: "2026",
    layout: "multi",
    instanceCount: 4,
    instances: [
      {
        id: "main",
        isMain: true,
        x: "0vw",
        y: "0vh",
        scale: 1.0,
        rotation: 0,
        opacity: 1.0,
        zIndex: 10,
        fit: "contain"
      },
      {
        id: "wave-left",
        isMain: false,
        x: "-26vw",
        y: "-7vh",
        scale: 0.80,
        rotation: -2.2,
        opacity: 0.65,
        zIndex: 3,
        fit: "contain"
      },
      {
        id: "wave-right",
        isMain: false,
        x: "26vw",
        y: "7vh",
        scale: 0.80,
        rotation: 2.2,
        opacity: 0.65,
        zIndex: 3,
        fit: "contain"
      },
      {
        id: "atmospheric-base",
        isMain: false,
        x: "0vw",
        y: "0vh",
        scale: 1.38,
        rotation: 0,
        opacity: 0.18,
        zIndex: 1,
        fit: "cover"
      }
    ],
    transition: "distortion",
    transitionDuration: 1.2,
    accentColor: "#06b6d4",
    description: "Ondas armónicas y dispersión de partículas moduladas por frecuencias de audio graves."
  }
];

export const EXHIBITION_CONFIG = {
  title: "SECUENCIA",
  subtitle: "Experiencia Audiovisual Interactiva",
  curatorNote: "Obras audiovisuales generativas creadas en TouchDesigner",
  autoAdvanceOnEnd: true,
  initialMuted: false,       // Al presionar ENTER EXPERIENCE se desbloquea el sonido
  audioCrossfadeDuration: 1.0, // 1 segundo de crossfade cinematográfico
  idleHideDelay: 3200,       // Tiempo para ocultar la interfaz contextual
  kioskReturnTimeout: 30000, // Retorno autónomo a sala tras 30s sin interacción
  introAutostartTimeout: 20000,
  defaultExhibitionMode: true,
};

export const TRANSITION_TYPES = [
  "fade",
  "glitch",
  "displacement",
  "particles",
  "digital-noise",
  "distortion"
];

/**
 * Obtener una obra por su ID
 * @param {string|number} id
 * @returns {object|undefined}
 */
export function getArtworkById(id) {
  return ARTWORKS.find((item) => item.id === id || item.id === Number(id));
}

/**
 * Obtener la siguiente obra en el ciclo
 * @param {number} currentIndex
 * @returns {{ artwork: object, index: number }}
 */
export function getNextArtwork(currentIndex) {
  const nextIndex = (currentIndex + 1) % ARTWORKS.length;
  return { artwork: ARTWORKS[nextIndex], index: nextIndex };
}

/**
 * Obtener la obra anterior en el ciclo
 * @param {number} currentIndex
 * @returns {{ artwork: object, index: number }}
 */
export function getPrevArtwork(currentIndex) {
  const prevIndex = (currentIndex - 1 + ARTWORKS.length) % ARTWORKS.length;
  return { artwork: ARTWORKS[prevIndex], index: prevIndex };
}
