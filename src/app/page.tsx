// Página principal del PC builder.
// Layout (full-screen, sin scroll del body):
//   - Fondo: el Canvas 3D ocupa toda la pantalla.
//   - Encima del 3D, paneles de UI flotantes (vidrio esmerilado):
//       · Header: título + UserMenu + botón Favoritos.
//       · Izquierda (selector): tabs + lista de componentes.
//       · Derecha (resumen): build actual + total + Guardar / Reset.
//   - Hint discreto en la parte inferior central que se desvanece solo.

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
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const PCScene = dynamic(
  () => import("@/components/scene/PCScene").then((m) => m.PCScene),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-zinc-950 to-zinc-900" />
    ),
  }
);

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
          className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[11px] tracking-wide pointer-events-none select-none"
          style={{ color: "var(--hint)" }}
        >
          ↻ arrastrá para girar · scroll para zoom
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FavoritesButton() {
  const hydrated = useHydrated();
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const [open, setOpen] = useState(false);

  if (!hydrated || !currentUserId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-2 rounded-full transition-colors cursor-pointer"
        style={{
          color: "var(--text-muted)",
          border: "1px solid var(--panel-border)",
        }}
      >
        ★ Favoritos
      </button>
      <FavoritesModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function Home() {
  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* ---------- ESCENA 3D (fondo) ---------- */}
      <div className="absolute inset-0">
        <PCScene />
      </div>

      <DragHint />

      {/* ---------- HEADER ---------- */}
      <header className="absolute top-0 left-0 right-0 z-10 px-8 py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div
            className="text-xs uppercase tracking-[0.2em]"
            style={{ color: "var(--text-muted)" }}
          >
            PC Builder
          </div>
          <h1
            className="text-xl font-semibold"
            style={{ color: "var(--text)" }}
          >
            Armá tu PC ideal
          </h1>
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <ThemeToggle />
          <FavoritesButton />
          <UserMenu />
        </div>
      </header>

      {/* ---------- PANEL IZQUIERDO: SELECTOR ---------- */}
      <div className="absolute left-0 top-0 bottom-0 z-10 p-6 pt-20 pb-8 flex pointer-events-none">
        <div className="w-[420px] max-w-[90vw] flex flex-col gap-4 pointer-events-auto">
          <div
            className="rounded-2xl backdrop-blur-xl p-4"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
            }}
          >
            <CategoryTabs />
          </div>
          <div
            className="rounded-2xl backdrop-blur-xl p-4 flex-1 overflow-y-auto"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
            }}
          >
            <ComponentList />
          </div>
        </div>
      </div>

      {/* ---------- PANEL DERECHO: RESUMEN ---------- */}
      <div className="absolute right-0 top-0 bottom-0 z-10 p-6 pt-20 pb-8 flex pointer-events-none">
        <div className="w-[320px] max-w-[90vw] pointer-events-auto">
          <div
            className="rounded-2xl backdrop-blur-xl p-5 h-full"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
            }}
          >
            <BuildSummary />
          </div>
        </div>
      </div>
    </div>
  );
}