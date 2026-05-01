// Helper para cargar un archivo .glb/.gltf y renderizarlo como modelo 3D.
//
// Cuando consigamos los modelos reales, en el registry vamos a poder
// hacer algo así:
//
//     "gpu-rtx-3090": () => <GltfModel url="/models/gpu/rtx-3090.glb" />,
//
// y el FittedModel se encarga de escalarlo automáticamente al slot.
//
// Notas técnicas:
//   - useGLTF (de drei) cachea por URL, así que aunque uses el mismo
//     modelo en varias partes, el archivo se descarga una sola vez.
//   - `scene.clone()` es importante: si dos lugares usan el mismo .glb
//     sin clonar, three.js los trata como el mismo Object3D y "se mueven
//     juntos" o uno reemplaza al otro. El clone da instancias separadas.
//   - useMemo evita re-clonar en cada render.

"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

type GltfModelProps = {
  url: string;
};

export function GltfModel({ url }: GltfModelProps) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(), [scene]);
  return <primitive object={cloned} />;
}
