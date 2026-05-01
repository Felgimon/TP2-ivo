// Escena 3D principal: el `<Canvas>` de R3F que vive de fondo.
// Acá adentro armamos:
//   1) Iluminación de estudio para que los modelos se vean bien.
//   2) El gabinete, ajustado a CHASSIS_BOUNDS para que sea SIEMPRE del
//      mismo tamaño en pantalla (independiente del .glb que se use).
//   3) Cada slot interior (CPU, GPU, RAM, etc.), donde el modelo se
//      auto-ajusta al `size` del slot vía <FittedModel>.
//   4) `OrbitControls` para que el usuario pueda girar y hacer zoom.
//
// Todo es Client Component porque R3F necesita el DOM/canvas del
// navegador (en SSR no hay WebGL).

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

// Categorías que se posicionan adentro del gabinete (todas menos el
// gabinete, que ES el contenedor).
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
  // Build actual del store. R3F re-renderiza cuando cambia.
  const build = useBuildStore((s) => s.build);

  // Resolvemos el componente de gabinete elegido (o undefined).
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
    >
      {/* Suspense necesario porque useGLTF (cuando se usen .glb reales)
          suspende mientras descarga el archivo. */}
      <Suspense fallback={null}>
        {/* ---------- ILUMINACIÓN ---------- */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 4, -5]} intensity={0.5} color="#88aaff" />

        {/* Reflejos realistas en metales/vidrio (HDRI urbano). */}
        <Environment preset="city" />

        {/* ---------- GABINETE ---------- */}
        {/* El gabinete se ajusta a CHASSIS_BOUNDS. Cualquier .glb que
            metas (chico o gigante) se va a normalizar a ese tamaño,
            así los slots interiores siempre encajan donde corresponde. */}
        <FittedModel
          key={`gab-${build.gabinete ?? "default"}`}
          targetSize={CHASSIS_BOUNDS}
          // El gabinete sí toca las paredes (es la pared). Sin padding.
          paddingFactor={1}
        >
          <GabineteModel />
        </FittedModel>

        {/* ---------- COMPONENTES INTERIORES ---------- */}
        {INNER_CATEGORIES.map((category) => {
          const compId = build[category];
          const comp = getComponentById(compId);
          const Model = getModelFor(comp);
          // Si no hay nada elegido, no mostramos modelo en ese slot.
          if (!Model) return null;
          const slot = SLOTS[category];
          return (
            // La key incluye el id del componente: cuando cambia, React
            // re-monta el slot y FittedModel vuelve a medir/animar.
            <group
              key={`${category}-${compId}`}
              position={slot.position}
              rotation={slot.rotation}
            >
              <FittedModel targetSize={slot.size}>
                <Model />
              </FittedModel>
            </group>
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
