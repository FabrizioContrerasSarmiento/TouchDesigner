"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Info,
  List,
  Repeat,
  RotateCw,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";

/**
 * HUD minimalista de control para sala de exhibición / proyector
 */
export default function ExhibitionHUD({
  artwork,
  currentIndex,
  totalArtworks,
  isPlaying,
  isMuted,
  fitMode,
  isLoopSingle,
  progress,
  currentTimeFormatted,
  durationFormatted,
  showHUD,
  showInfo,
  showDrawer,
  showShortcuts,
  isFullscreen,
  onTogglePlay,
  onPrev,
  onNext,
  onToggleMute,
  onToggleFitMode,
  onToggleLoopMode,
  onToggleInfo,
  onToggleDrawer,
  onToggleShortcuts,
  onToggleFullscreen,
  onSeek,
}) {
  const accentColor = artwork?.accentColor || "#38bdf8";

  return (
    <div
      className={`fixed inset-0 pointer-events-none transition-opacity duration-700 select-none z-30 ${
        showHUD ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* ========================================================
          BARRA SUPERIOR (HEADER DE SALA)
         ======================================================== */}
      <header className="absolute top-0 inset-x-0 p-6 md:p-8 flex items-start justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Identificador de muestra */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
            <span className="font-mono text-xs tracking-[0.25em] uppercase text-zinc-400">
              SECUENCIA // MUESTRA AUDIOVISUAL
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="font-mono text-xl md:text-2xl font-bold tracking-tight"
              style={{ color: accentColor }}
            >
              {artwork?.number}
            </span>
            <span className="text-zinc-500 font-light">—</span>
            <h1 className="text-lg md:text-xl font-medium tracking-wide text-zinc-100">
              {artwork?.title}
            </h1>
            <span className="hidden sm:inline-block text-xs font-mono text-zinc-500 px-2 py-0.5 rounded border border-zinc-800">
              {artwork?.year}
            </span>
          </div>
        </div>

        {/* Acciones superiores derechas */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Botón Catálogo de Obras */}
          <button
            onClick={onToggleDrawer}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono tracking-wider transition-colors ${
              showDrawer
                ? "bg-zinc-800 border-zinc-600 text-white"
                : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
            } backdrop-blur-md`}
            title="Abrir catálogo de obras (1-9)"
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden md:inline">OBRAS</span>
            <span className="text-[10px] text-zinc-500">
              [{currentIndex + 1}/{totalArtworks}]
            </span>
          </button>

          {/* Botón Ficha Técnica */}
          <button
            onClick={onToggleInfo}
            className={`p-2 rounded-lg border transition-colors ${
              showInfo
                ? "bg-zinc-800 border-zinc-600 text-white"
                : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
            } backdrop-blur-md`}
            title="Ver ficha técnica de la obra (I)"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Botón Atajos de Teclado */}
          <button
            onClick={onToggleShortcuts}
            className={`p-2 rounded-lg border transition-colors ${
              showShortcuts
                ? "bg-zinc-800 border-zinc-600 text-white"
                : "bg-black/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
            } backdrop-blur-md`}
            title="Atajos de teclado / Ayuda (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ========================================================
          CÉDULA DE SALA (INFO / MEMORIA DESCRIPTIVA)
         ======================================================== */}
      {showInfo && (
        <aside className="absolute top-24 left-6 md:left-8 max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-5 pointer-events-auto transition-all duration-300 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-mono text-[11px] tracking-widest uppercase text-zinc-400">
              FICHA TÉCNICA // TD EXPORT
            </span>
            <span
              className="text-xs font-mono font-medium px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${accentColor}20`,
                color: accentColor,
              }}
            >
              Nº {artwork?.number}
            </span>
          </div>

          <p className="mt-3 text-xs md:text-sm text-zinc-300 leading-relaxed font-light">
            {artwork?.description}
          </p>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-1.5">
            {artwork?.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Archivo: {artwork?.video?.split("/").pop()}</span>
            <span>{durationFormatted}</span>
          </div>
        </aside>
      )}

      {/* ========================================================
          BARRA DE CONTROL INFERIOR
         ======================================================== */}
      <footer className="absolute bottom-0 inset-x-0 p-6 md:p-8 flex flex-col gap-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        {/* Barra de progreso interactiva (Scrubber) */}
        <div className="w-full flex items-center gap-3 pointer-events-auto">
          <span className="text-[11px] font-mono text-zinc-400 min-w-10 text-right">
            {currentTimeFormatted}
          </span>
          <div
            onClick={onSeek}
            className="relative flex-1 h-1.5 bg-zinc-800 hover:h-2.5 transition-all rounded-full cursor-pointer group"
          >
            {/* Relleno de progreso */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
              style={{
                width: `${progress}%`,
                backgroundColor: accentColor,
              }}
            />
            {/* Cursor selector */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-md transition-opacity pointer-events-none"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-[11px] font-mono text-zinc-500 min-w-10">
            {durationFormatted}
          </span>
        </div>

        {/* Botonera de reproducción y ajustes de sala */}
        <div className="flex items-center justify-between pointer-events-auto">
          {/* Navegación y reproducción */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Obra Anterior */}
            <button
              onClick={onPrev}
              className="p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Obra anterior (←)"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {/* Play / Pausa */}
            <button
              onClick={onTogglePlay}
              className="p-3.5 rounded-full text-black font-bold transition-transform active:scale-95 shadow-lg"
              style={{ backgroundColor: accentColor }}
              title={isPlaying ? "Pausar (Espacio)" : "Reproducir (Espacio)"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-black stroke-black" />
              ) : (
                <Play className="w-5 h-5 fill-black stroke-black ml-0.5" />
              )}
            </button>

            {/* Obra Siguiente */}
            <button
              onClick={onNext}
              className="p-2.5 rounded-full bg-zinc-900/80 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Obra siguiente (→)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Ajustes de proyección y audio */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Modo Loop: Obra individual vs Secuencia completa */}
            <button
              onClick={onToggleLoopMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                isLoopSingle
                  ? "bg-zinc-900/90 border-white/20 text-zinc-200"
                  : "bg-zinc-900/90 border-sky-500/50 text-sky-400"
              }`}
              title="Alternar bucle de obra o avance continuo (L)"
            >
              {isLoopSingle ? (
                <>
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">LOOP OBRA</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SECUENCIA AUTO</span>
                </>
              )}
            </button>

            {/* Modo Ajuste de Pantalla: Proporción nativa (contain) vs Pantalla completa (cover) */}
            <button
              onClick={onToggleFitMode}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-zinc-900/80 text-xs font-mono text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
              title="Alternar modo de aspecto (C)"
            >
              {fitMode === "cover" ? "LLENAR" : "AJUSTAR"}
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={onToggleMute}
              className="p-2.5 rounded-lg border border-white/10 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
              title={isMuted ? "Activar audio (M)" : "Silenciar audio (M)"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              ) : (
                <Volume2 className="w-4 h-4" style={{ color: accentColor }} />
              )}
            </button>

            {/* Pantalla Completa (Proyector) */}
            <button
              onClick={onToggleFullscreen}
              className="p-2.5 rounded-lg border border-white/10 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-white/30 transition-colors"
              title="Pantalla completa (F)"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
