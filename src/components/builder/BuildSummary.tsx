// Resumen del build: lista las categorías y muestra qué componente
// eligió el usuario en cada una, más el precio total. Tiene también
// los botones para Guardar (favoritos) y Empezar de nuevo.

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBuildStore } from "@/store/buildStore";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/useHydrated";
import { getComponentById } from "@/data/components";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";
import { SaveBuildModal } from "./SaveBuildModal";

export function BuildSummary() {
  const build = useBuildStore((s) => s.build);
  const resetBuild = useBuildStore((s) => s.resetBuild);
  const setActiveCategory = useBuildStore((s) => s.setActiveCategory);
  const getTotalPrice = useBuildStore((s) => s.getTotalPrice);

  // Para saber si el usuario está logueado y habilitar "Guardar".
  const hydrated = useHydrated();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const isLoggedIn = hydrated && Boolean(currentUserId);

  const [saveOpen, setSaveOpen] = useState(false);

  const total = getTotalPrice();
  const filledCount = CATEGORY_ORDER.filter((c) => build[c]).length;
  const hasAnything = filledCount > 0;

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

      {/* Total + acciones */}
      <div className="border-t border-white/10 pt-4 mt-4">
        <motion.div
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

        {/* Acciones: Guardar (si logueado y con piezas) + Resetear */}
        <div className="flex gap-2">
          <button
            onClick={() => setSaveOpen(true)}
            // Deshabilitado si no hay nada que guardar O si no hay sesión.
            // Si no hay sesión, el título explica por qué no se puede.
            disabled={!hasAnything || !isLoggedIn}
            title={
              !isLoggedIn
                ? "Iniciá sesión para guardar tu build"
                : !hasAnything
                ? "Elegí al menos un componente"
                : "Guardar este build en favoritos"
            }
            className="flex-1 text-xs py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Guardar
          </button>
          <button
            onClick={resetBuild}
            disabled={!hasAnything}
            className="flex-1 text-xs py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>

      {/* Modal "Guardar build" */}
      <SaveBuildModal open={saveOpen} onClose={() => setSaveOpen(false)} />
    </div>
  );
}
