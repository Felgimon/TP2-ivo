// Lista de componentes filtrada por la categoría activa.
// Cada componente del catálogo se muestra como una "card" cliqueable.
// Al hacer click, queda seleccionado y se actualiza la escena 3D.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBuildStore } from "@/store/buildStore";
import { getComponentsByCategory } from "@/data/components";

export function ComponentList() {
  const activeCategory = useBuildStore((s) => s.activeCategory);
  const build = useBuildStore((s) => s.build);
  const selectComponent = useBuildStore((s) => s.selectComponent);

  const components = getComponentsByCategory(activeCategory);
  const selectedId = build[activeCategory];

  return (
    <div className="relative">
      {/* AnimatePresence + key hace fade-in/out cuando cambia la categoría.
          Así la lista se siente fluida en lugar de "saltar" abruptamente. */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {components.map((comp) => {
            const isSelected = comp.id === selectedId;
            return (
              <button
                key={comp.id}
                onClick={() =>
                  // Click en el ya seleccionado lo des-selecciona;
                  // click en otro, lo cambia.
                  selectComponent(
                    activeCategory,
                    isSelected ? undefined : comp.id
                  )
                }
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "border-emerald-400/70 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-white/50">
                      {comp.brand}
                    </div>
                    <div className="text-sm font-medium text-white mt-0.5">
                      {comp.name}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-white/90 whitespace-nowrap">
                    ${comp.price}
                  </div>
                </div>
                {/* Specs: si las hay, las mostramos como mini-chips abajo. */}
                {comp.specs && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Object.entries(comp.specs).map(([k, v]) => (
                      <span
                        key={k}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/70"
                      >
                        {k}: {v}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
