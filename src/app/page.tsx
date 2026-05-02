// Página principal del PC builder.
// Layout (full-screen, sin scroll del body):
//   - Fondo: el Canvas 3D ocupa toda la pantalla.
//   - Encima del 3D, paneles de UI flotantes (vidrio esmerilado):
//       · Header: título + UserMenu + botón Favoritos.
//       · Izquierda (selector): tabs + lista de componentes.
//       · Derecha (resumen): build actual + total + Guardar / Reset.
//   - Hint discreto en la parte inferior central que se desvanece solo.
//
// El Canvas se lazy-loadea con `dynamic({ ssr: false })` porque R3F y
// drei tocan APIs del navegador (window, WebGL) que no existen en el
// servidor de Next.js. Si lo importamos directo, falla la build.

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { CategoryTabs } from "@/components/builder/CategoryTabs";
import { ComponentList } from "@/components/builder/ComponentList";
import { BuildSummary } from "@/components/builder/BuildSummary";
import { UserMenu } from "@/components/auth/UserMenu";
import { FavoritesModal } from "@/components/builder/FavoritesModal";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/useHydrated";

// Carga del Canvas 3D solo en cliente (sin SSR).
// Mientras se carga, mostramos un fondo oscuro.
const PCScene = dynamic(
  () => import("@/components/scene/PCScene").then((m) => m.PCScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-900" />
    ),
  }
);

// Hint discreto que recuerda que se puede arrastrar para girar la vista.
// Aparece al cargar la página y se va solo después de 6 segundos.
function DragHint() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(t);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.5, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] tracking-wide text-white/60 pointer-events-none select-none"
        >
          ↻ arrastrá para girar · scroll para zoom
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Botón "Favoritos" del header. Solo aparece cuando hay un usuario
// logueado (no tiene sentido mostrarlo si nadie está autenticado).
function FavoritesButton() {
  const hydrated = useHydrated();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const [open, setOpen] = useState(false);

  if (!hydrated || !currentUserId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-white/70 hover:text-white px-3 py-2 rounded-full border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
      >
        ★ Favoritos
      </button>
      <FavoritesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function Home() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-white">
      {/* ---------- ESCENA 3D (fondo) ---------- */}
      <div className="absolute inset-0">
        <PCScene />
      </div>

      {/* Hint discreto abajo y centrado */}
      <DragHint />

      {/* ---------- HEADER ---------- */}
      <header className="absolute top-0 left-0 right-0 z-10 px-8 py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">
            PC Builder
          </div>
          <h1 className="text-xl font-semibold text-white">Armá tu PC ideal</h1>
        </div>
        {/* Cluster de la derecha: Favoritos + UserMenu */}
        <div className="pointer-events-auto flex items-center gap-3">
          <FavoritesButton />
          <UserMenu />
        </div>
      </header>

      {/* ---------- PANEL IZQUIERDO: SELECTOR ---------- */}
      <div className="absolute left-0 top-0 bottom-0 z-10 p-6 pt-20 pb-8 flex pointer-events-none">
        <div className="w-[420px] max-w-[90vw] flex flex-col gap-4 pointer-events-auto">
          <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-4">
            <CategoryTabs />
          </div>
          <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-4 flex-1 overflow-y-auto">
            <ComponentList />
          </div>
        </div>
      </div>

      {/* ---------- PANEL DERECHO: RESUMEN ---------- */}
      <div className="absolute right-0 top-0 bottom-0 z-10 p-6 pt-20 pb-8 flex pointer-events-none">
        <div className="w-[320px] max-w-[90vw] pointer-events-auto">
          <div className="rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 p-5 h-full">
            <BuildSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
