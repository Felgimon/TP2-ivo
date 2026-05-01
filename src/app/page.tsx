// Página principal del PC builder.
// Layout (full-screen, sin scroll del body):
//   - Fondo: el Canvas 3D ocupa toda la pantalla.
//   - Encima del 3D, paneles de UI flotantes (vidrio esmerilado):
//       · Header: título.
//       · Izquierda (selector): tabs + lista de componentes.
//       · Derecha (resumen): build actual + total.
//
// El Canvas se lazy-loadea con dynamic() y `ssr: false` porque R3F y
// drei tocan APIs del navegador (window, WebGL) que no existen en el
// servidor de Next.js. Si lo importamos directo, falla la build.

"use client";

import dynamic from "next/dynamic";
import { CategoryTabs } from "@/components/builder/CategoryTabs";
import { ComponentList } from "@/components/builder/ComponentList";
import { BuildSummary } from "@/components/builder/BuildSummary";

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

export default function Home() {
  return (
    // Contenedor full-screen que mata el scroll y centra el contenido.
    <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-white">
      {/* ---------- ESCENA 3D (fondo) ---------- */}
      <div className="absolute inset-0">
        <PCScene />
      </div>

      {/* ---------- HEADER ---------- */}
      <header className="absolute top-0 left-0 right-0 z-10 px-8 py-5 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto">
          <div className="text-xs uppercase tracking-[0.2em] text-white/40">
            PC Builder
          </div>
          <h1 className="text-xl font-semibold text-white">Armá tu PC ideal</h1>
        </div>
        <div className="pointer-events-auto text-xs text-white/40">
          v0.1 · arrastrá para girar la vista
        </div>
      </header>

      {/* ---------- PANEL IZQUIERDO: SELECTOR ---------- */}
      {/* `pointer-events-none` en el wrapper + `pointer-events-auto` en el
          panel real es el truco para que el Canvas siga siendo interactivo
          en las zonas vacías de la pantalla (zoom/rotar). */}
      <div className="absolute left-0 top-0 bottom-0 z-10 p-6 pt-20 pb-8 flex pointer-events-none">
        <div className="w-[420px] max-w-[90vw] flex flex-col gap-4 pointer-events-auto">
          {/* Glass panel: backdrop-blur le da el efecto de vidrio esmerilado */}
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
