// Helper para cargar un archivo .glb/.gltf y renderizarlo como modelo 3D.
//
// Funcionalidades clave:
//
//   1) AUTO-ORIENTACIÓN: si pasás `category`, intentamos detectar si el
//      modelo viene en una orientación "rara" (típico problema de modelos
//      exportados con Z-up de Blender en lugar de Y-up de three.js) y le
//      aplicamos la rotación que lo deja como debería estar. La heurística
//      mira las dimensiones del bounding box y las compara con lo
//      esperado para esa categoría (ej. un gabinete debe ser tallado en Y).
//
//   2) OVERRIDE MANUAL: si la heurística no acierta para un modelo
//      puntual, podés pasar `rotation={[x, y, z]}` y eso tiene precedencia.
//
//   3) RE-CENTRADO: el `<FittedModel>` que envuelve a este componente ya
//      se encarga de centrar el bounding box en el origen del slot, así
//      que un modelo con el origen mal puesto (en una esquina, por ej.)
//      igual queda colocado correctamente. Acá solo nos preocupamos por
//      la orientación.
//
// Notas técnicas:
//   - useGLTF (drei) cachea por URL → un mismo modelo usado en varias
//     instancias se descarga UNA sola vez.
//   - Clonamos la escena ANTES de aplicar transformaciones (si no, dos
//     instancias del mismo .glb se pisarían entre sí porque comparten
//     el mismo Object3D).
//   - Envolvemos el clone en un Group nuevo en lugar de setear la
//     rotación directo en el clone, para no pisar transformaciones que
//     puedan venir del archivo original.

"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, type Object3D, Vector3 } from "three";

import type { PCCategory } from "@/types";
import type { Vec3 } from "../slots";

type GltfModelProps = {
  url: string;
  // Categoría del componente. Si está, se usa para auto-orientación.
  category?: PCCategory;
  // Override manual: si lo pasás, ignora la heurística y usa exactamente
  // estos valores. Útil cuando el auto-detect no acierta.
  rotation?: Vec3;
};

// Heurística: dado un modelo y su categoría, devuelve la rotación que
// hay que aplicar al root para dejarlo en la orientación esperada.
// Si las dimensiones ya cuadran, devuelve [0,0,0] (sin rotación).
//
// FILOSOFÍA: SOLO auto-orientamos categorías cuya "forma típica" es
// PREDECIBLE (RAM siempre alta, GPU siempre ancha, motherboard siempre
// fina). Para gabinete y disipador NO auto-orientamos: sus formas
// varían demasiado (mid-tower vs ITX cubo, tower cooler vs AIO 360mm)
// y la heurística termina rompiendo más casos de los que arregla.
// Si un modelo concreto viene mal orientado, se corrige con un
// `rotation` manual en la entrada del registry.
function detectAutoRotation(scene: Object3D, category: PCCategory): Vec3 {
  scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(scene);
  if (box.isEmpty()) return [0, 0, 0];

  const size = new Vector3();
  box.getSize(size);

  switch (category) {
    case "ram": {
      // RAM stick: Y debe ser el eje más largo (la altura del módulo).
      if (size.y >= size.x && size.y >= size.z) return [0, 0, 0];
      if (size.z > size.x) return [-Math.PI / 2, 0, 0];
      return [0, 0, Math.PI / 2];
    }
    case "gpu": {
      // GPU: X debe ser el eje más largo (ancho de la placa).
      if (size.x >= size.y && size.x >= size.z) return [0, 0, 0];
      if (size.z > size.y) return [0, Math.PI / 2, 0];
      return [0, 0, -Math.PI / 2];
    }
    case "motherboard": {
      // Motherboard: Z debe ser el eje más chico (placa fina).
      if (size.z <= size.x && size.z <= size.y) return [0, 0, 0];
      if (size.x < size.y) return [0, Math.PI / 2, 0];
      return [Math.PI / 2, 0, 0];
    }
    case "disco": {
      // Disco apoyado sobre el motherboard como M.2: X debe ser el
      // más largo (long axis horizontal). Si viene parado o de costado,
      // lo acostamos.
      if (size.x >= size.y && size.x >= size.z) return [0, 0, 0];
      if (size.z > size.y) return [0, Math.PI / 2, 0];
      return [0, 0, -Math.PI / 2];
    }
    // Para gabinete, disipador, cpu, fuente: confiamos en la orientación
    // nativa del modelo. Si algún caso viene mal orientado, pasar
    // `rotation` manual en el registry.
    default:
      return [0, 0, 0];
  }
}

export function GltfModel({ url, category, rotation }: GltfModelProps) {
  const { scene } = useGLTF(url);

  // Clave estable para useMemo cuando rotation es un array (que cambia
  // de identidad en cada render del padre, aunque los valores sean iguales).
  const rotKey = rotation
    ? `${rotation[0]},${rotation[1]},${rotation[2]}`
    : null;

  const transformed = useMemo(() => {
    // Cloning compartido: la geometría/materiales se reusan, solo se
    // duplica el Object3D, así que es barato.
    const sceneClone = scene.clone();

    // Decidimos la rotación: manual override > auto-detect > sin cambios.
    let rot: Vec3 = [0, 0, 0];
    if (rotation) {
      rot = rotation;
    } else if (category) {
      rot = detectAutoRotation(sceneClone, category);
    }

    // Wrap en un Group nuevo: aplicamos la rotación acá, sin pisar la
    // del root del .glb (que puede traer transformaciones legítimas).
    const root = new Group();
    root.add(sceneClone);
    root.rotation.set(rot[0], rot[1], rot[2]);
    root.updateMatrixWorld(true);

    return root;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, category, rotKey]);

  return <primitive object={transformed} />;
}
