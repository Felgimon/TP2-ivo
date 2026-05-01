// Resumen del build: lista las categorías y muestra qué componente
// eligió el usuario en cada una, más el precio total. También tiene
// el botón para resetear todo.

"use client";

import { motion } from "framer-motion";
import { useBuildStore } from "@/store/buildStore";
import { getComponentById } from "@/data/components";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";

export function BuildSummary() {
  const build = useBuildStore((s) => s.build);
  const resetBuild = useBuildStore((s) => s.resetBuild);
  const setActiveCategory = useBuildStore((s) => s.setActiveCategory);
  const getTotalPrice = useBuildStore((s) => s.getTotalPrice);

  const total = getTotalPrice();

  // Cuántas categorías ya tienen algo elegido (para mostrar progreso).
  const filledCount = CATEGORY_ORDER.filter((c) => build[c]).length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm uppercase tracking-wider text-white/60">
          Tu build
        </h2>
        <span className="text-xs text-white/40">
          {filledCount} / {CATEGORY_ORDER.length}
        </span>
      </div>

      {/* Lista de slots: una fila por categoría */}
      <ul className="flex-1 space-y-1.5 overflow-y-auto">
        {CATEGORY_ORDER.map((cat) => {
          const comp = getComponentById(build[cat]);
          return (
            <li key={cat}>
              <button
                // Click en una fila lleva a la pestaña de esa categoría
                // (como un atajo para ir a editarla rápido).
                onClick={() => setActiveCategory(cat)}
                className="w-full text-left flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="text-xs text-white/50 w-24 shrink-0">
                  {CATEGORY_LABELS[cat]}
                </span>
                <span
                  className={`text-sm flex-1 truncate ${
                    comp ? "text-white" : "text-white/30 italic"
                  }`}
                >
                  {comp?.name ?? "no elegido"}
                </span>
                {comp && (
                  <span className="text-xs text-white/60 whitespace-nowrap">
                    ${comp.price}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Total + reset */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <motion.div
          // Animamos el número del total cuando cambia, para que se note.
          key={total}
          initial={{ scale: 0.95, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="flex items-baseline justify-between mb-3"
        >
          <span className="text-sm text-white/60">Total</span>
          <span className="text-2xl font-semibold text-white">
            ${total.toLocaleString()}
          </span>
        </motion.div>

        <button
          onClick={resetBuild}
          disabled={filledCount === 0}
          className="w-full text-xs py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
