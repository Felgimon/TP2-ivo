// Pestañas de las 8 categorías de componentes (CPU, GPU, RAM, etc.).
// Click en una pestaña cambia la categoría activa en el store, y la UI
// reacciona mostrando los componentes de esa categoría.

"use client";

import { motion } from "framer-motion";
import { useBuildStore } from "@/store/buildStore";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";

export function CategoryTabs() {
  const activeCategory = useBuildStore((s) => s.activeCategory);
  const setActiveCategory = useBuildStore((s) => s.setActiveCategory);
  const build = useBuildStore((s) => s.build);

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_ORDER.map((cat) => {
        const isActive = cat === activeCategory;
        // Si ya hay un componente seleccionado en esa categoría, marcamos
        // visualmente la pestaña con un puntito verde.
        const isFilled = Boolean(build[cat]);

        return (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="relative px-4 py-2 text-sm rounded-full transition-colors cursor-pointer"
          >
            {/* Pill animada que se desliza entre las pestañas activas.
                `layoutId` hace que framer-motion haga la transición
                "shared element" entre el botón anterior y el nuevo. */}
            {isActive && (
              <motion.span
                layoutId="active-tab-pill"
                className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/30"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? "text-white" : "text-white/60 hover:text-white/90"
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </span>
            {/* Indicador de "ya elegiste algo en esta categoría" */}
            {isFilled && (
              <span className="relative z-10 ml-2 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>
        );
      })}
    </div>
  );
}
