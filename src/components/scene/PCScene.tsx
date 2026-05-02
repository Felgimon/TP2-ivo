// Escena 3D principal: el `<Canvas>` de R3F que vive de fondo.
// Acá adentro:
//   1) Iluminación de estudio (key/fill direccional + ambient + Environment).
//   2) Una luz puntual interior para iluminar los componentes adentro
//      del gabinete (donde la luz exterior no llega tan bien).
//   3) El gabinete envuelto en <MakeTransparent>: SIEMPRE se ve a través,
//      sin importar qué .glb haya subido el usuario.
//   4) Cada slot interior con su <FittedModel>, todo dentro de un
//      <SceneErrorBoundary> para que si un .glb roto rompe, no se caiga
//      la escena entera (solo desaparece ese slot).
//   5) `OrbitControls` para que el usuario gire/haga zoom.
//
// Todo Client Component: R3F necesita el WebGL del navegador (no SSR).

"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, ContactShadows } from "@react-three/drei";
import { Suspense, useMemo } from "react";

import { useBuildStore } from "@/store/buildStore";
import { getComponentById } from "@/data/components";
import type { PCCategory } from "@/types";

import { getGabineteModel, getModelFor } from "./models/registry";
import { CHASSIS_BOUNDS, SLOTS } from "./slots";
import { FittedModel } from "./FittedModel";
import { MakeTransparent } from "./MakeTransparent";
import { SceneErrorBoundary } from "./SceneErrorBoundary";

// Categorías que se posicionan ADENTRO del gabinete (el gabinete no
// está porque ÉL es el contenedor).
const INNER_CATEGORIES: Exclude<PCCategory, "gabinete">[] = [
  "motherboard",
  "cpu",
  "disipador",
  "gpu",
  "ram",
  "disco",
  "fuente",
];

export function PCScene() {
  // Build actual. R3F re-renderiza cuando cambia.
  const build = useBuildStore((s) => s.build);

  // Gabinete elegido (o undefined → usa el default).
  const gabineteComp = useMemo(
    () => getComponentById(build.gabinete),
    [build.gabinete]
  );
  const GabineteModel = getGabineteModel(gabineteComp);

  return (
    <Canvas
      camera={{ position: [6, 3, 7], fov: 40 }}
      shadows
      gl={{ antialias: true }}
      // Cap del pixel ratio: en pantallas 4K/Retina, sin esto el GPU
      // sufre porque renderea a 2-3x la resolución. Con [1, 2] cortamos
      // en 2x, suficiente para verse nítido sin tirones.
      dpr={[1, 2]}
    >
      <Suspense fallback={null}>
        {/* ---------- ILUMINACIÓN ---------- */}
        {/* Ambiente para que nada quede totalmente negro */}
        <ambientLight intensity={0.4} />
        {/* Key light (direccional principal) */}
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Fill light (luz suave azulada desde atrás para recortar) */}
        <directionalLight position={[-5, 4, -5]} intensity={0.5} color="#88aaff" />

        {/* Luz puntual INTERIOR del gabinete: ilumina los componentes
            adentro, que de otra forma quedarían en sombra cuando el
            gabinete está semi-transparente. `decay=2` (físico) y
            `distance=8` para que el efecto se quede dentro del case. */}
        <pointLight
          position={[0, 0.5, 0]}
          intensity={0.8}
          distance={8}
          decay={2}
          color="#ffffff"
        />

        {/* Environment (HDRI urbano de pmndrs.com) → reflejos realistas
            en metales y vidrios. */}
        <Environment preset="city" />

        {/* ---------- GABINETE ---------- */}
        {/* Tres capas de wrappers haciendo cada uno UNA cosa:
            - SceneErrorBoundary: si el .glb del case revienta, no se
              cae la escena entera, solo desaparece el case.
            - FittedModel: escala el case a CHASSIS_BOUNDS (siempre
              ocupa el mismo espacio, ningún case viene "gigante" o
              "microscópico").
            - MakeTransparent: fuerza materiales semi-transparentes
              para que SIEMPRE se vea adentro, incluso si el modelo
              original tiene paredes opacas. */}
        <SceneErrorBoundary label="gabinete">
          <FittedModel
            key={`gab-${build.gabinete ?? "default"}`}
            targetSize={CHASSIS_BOUNDS}
            paddingFactor={1}
          >
            <MakeTransparent>
              <GabineteModel />
            </MakeTransparent>
          </FittedModel>
        </SceneErrorBoundary>

        {/* ---------- COMPONENTES INTERIORES ---------- */}
        {INNER_CATEGORIES.map((category) => {
          const compId = build[category];
          const comp = getComponentById(compId);
          const Model = getModelFor(comp);
          // Sin componente elegido para esta categoría → no renderizamos.
          if (!Model) return null;
          const slot = SLOTS[category];
          return (
            // La key incluye el id del componente: cuando cambia, React
            // re-monta el slot y FittedModel vuelve a medir/animar.
            // Cada slot tiene su propia ErrorBoundary así un componente
            // roto no afecta a los demás.
            <SceneErrorBoundary
              key={`${category}-${compId}`}
              label={`${category}:${compId}`}
            >
              <group position={slot.position} rotation={slot.rotation}>
                <FittedModel targetSize={slot.size}>
                  <Model />
                </FittedModel>
              </group>
            </SceneErrorBoundary>
          );
        })}

        {/* ---------- SOMBRA SUAVE BAJO EL GABINETE ---------- */}
        <ContactShadows
          position={[0, -3.05, 0]}
          opacity={0.45}
          scale={12}
          blur={2.4}
          far={4.5}
        />

        {/* ---------- CONTROLES DE CÁMARA ---------- */}
        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={14}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.05}
          target={[0, 0, 0]}
        />
      </Suspense>
    </Canvas>
  );
}
