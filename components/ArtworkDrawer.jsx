"use client";

import { X, Play, Film } from "lucide-react";

/**
 * Panel lateral / drawer para navegar entre las obras de la muestra
 */
export default function ArtworkDrawer({
  artworks,
  currentArtworkId,
  isOpen,
  onSelectArtwork,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md flex justify-end">
      {/* Fondo clicable para cerrar */}
      <div className="flex-1" onClick={onClose} />

      {/* Contenedor del Drawer */}
      <div className="w-full max-w-md bg-zinc-950/95 border-l border-white/10 h-full p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Encabezado */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
                CATÁLOGO DE SALA
              </span>
              <h2 className="text-xl font-light text-zinc-100 tracking-wide mt-1">
                Obras Seleccionadas
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Lista de obras */}
          <div className="mt-6 flex flex-col gap-3">
            {artworks.map((item, index) => {
              const isActive = item.id === currentArtworkId;
              const accentColor = item.accentColor || "#38bdf8";

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectArtwork(index);
                    onClose();
                  }}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 group flex items-start justify-between gap-4 ${
                    isActive
                      ? "bg-zinc-900 border-white/20 shadow-lg"
                      : "bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/80"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Número de obra */}
                    <span
                      className="font-mono text-lg font-bold"
                      style={{ color: isActive ? accentColor : "#71717a" }}
                    >
                      {item.number}
                    </span>

                    {/* Metadata de obra */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`font-medium text-base tracking-wide transition-colors ${
                            isActive
                              ? "text-white"
                              : "text-zinc-300 group-hover:text-white"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <span className="text-[10px] font-mono text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
                          {item.year}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed font-light">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Film className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-mono text-zinc-500">
                          {item.video.split("/").pop()}
                        </span>
                        {item.duration && (
                          <span className="text-[10px] font-mono text-zinc-500">
                            · {item.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Icono de reproducción / estado */}
                  <div className="pt-1">
                    {isActive ? (
                      <div
                        className="w-2.5 h-2.5 rounded-full animate-pulse"
                        style={{ backgroundColor: accentColor }}
                      />
                    ) : (
                      <Play className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pie del catálogo */}
        <div className="pt-6 border-t border-white/10 text-xs font-mono text-zinc-500 flex justify-between items-center">
          <span>Total: {artworks.length} obras</span>
          <span className="text-zinc-600">
            Presiona 1-{artworks.length} para salto directo
          </span>
        </div>
      </div>
    </div>
  );
}
