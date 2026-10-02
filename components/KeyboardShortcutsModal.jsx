"use client";

import { X, Command } from "lucide-react";

/**
 * Modal informativo con la guía de atajos de teclado para el operador de sala
 */
export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: "Espacio / K", action: "Reproducir / Pausar video" },
    { key: "→ / N / AvPág", action: "Siguiente obra en catálogo" },
    { key: "← / P / RePág", action: "Obra anterior en catálogo" },
    { key: "F", action: "Alternar Pantalla Completa (Proyector)" },
    { key: "M", action: "Silenciar / Activar sonido" },
    { key: "I", action: "Mostrar / Ocultar ficha técnica (cédula)" },
    { key: "H", action: "Mostrar / Ocultar controles (HUD)" },
    { key: "C", action: "Alternar modo de ajuste (Ajustar / Llenar pantalla)" },
    { key: "L", action: "Alternar bucle (Loop Obra / Secuencia Continua)" },
    { key: "1 - 9", action: "Saltar directamente a la obra por número" },
    { key: "Esc", action: "Cerrar paneles emergentes" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      {/* Fondo clicable */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-white/10">
              <Command className="w-4 h-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-zinc-100">
                Atajos de Teclado de Sala
              </h2>
              <p className="text-xs text-zinc-400">
                Control de la experiencia audiovisual sin ratón
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map(({ key, action }) => (
            <div
              key={key}
              className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 border border-white/5"
            >
              <span className="text-xs text-zinc-300 font-light">{action}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold bg-zinc-800 border border-zinc-700 rounded text-zinc-200 shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500 font-mono">
          <span>Diseñado para exhibiciones continuas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
