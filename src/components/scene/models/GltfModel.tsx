// Helper para cargar un archivo .glb/.gltf y renderizarlo como modelo 3D.
//
// Funcionalidades clave:
//
//   1) AUTO-ORIENTACIÓN: si pasás `category`, intentamos detectar si el
//      modelo viene en una orientación "rara" (típico problema de modelos
//      exportados con Z-up de Blender en lugar de Y-up de three.js) y le
//      aplicamos la rotación que lo deja como debería estar.
//
//   2) OVERRIDE MANUAL: si la heurística no acierta para un modelo
//      puntual, podés pasar `rotation={[x, y, z]}` y eso tiene precedencia.
//
//   3) RE-CENTRADO: el `<FittedModel>` que envuelve a este componente ya
//      se encarga de centrar el bounding box en el origen del slot, así
//      que un modelo con el origen mal puesto igual queda colocado bien.
//
//   4) ANIMACIONES: si el .glb trae animaciones embebidas (rotor de un
//      fan, LEDs RGB, lo que sea), las reproducimos en LOOP INFINITO
//      mientras el modelo esté visible. Cuando el componente se
//      desmonta (cambia el componente seleccionado), las paramos para
//      no consumir CPU al pedo.
//
// Notas técnicas:
//   - useGLTF (drei) cachea por URL → un mismo modelo se descarga UNA vez.
//   - Clonamos la escena con scene.clone() para que dos instancias del
//     mismo .glb no se pisen entre sí compartiendo el mismo Object3D.
//   - useAnimations (drei) crea un AnimationMixer y lo va updateando
//     en cada frame automáticamente. Sus actions están indexadas por
//     el nombre del clip dentro del .glb.

"use client";

import { useEffect, useMemo } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Box3, Group, LoopRepeat, type Object3D, Vector3 } from "three";

import type { PCCategory } from "@/types";
import type { Vec3 } from "../slots";

type GltfModelProps = {
  url: string;
  // Categoría del componente. Si está, se usa para auto-orientación.
  category?: PCCategory;
  // Override manual: si lo pasás, ignora la heurística y usa exactamente
  // estos valores. Útil cuando el auto-detect no acierta.
  rotation?: Vec3;
  // Si false, NO reproduce las animaciones embebidas del .glb. Útil
  // para modelos con animaciones rotas (ej. skeletal/skinning malo)
  // donde reproducirlas deforma la geometría. Default: true.
  animationsEnabled?: boolean;
};

// Heurística: dado un modelo y su categoría, devuelve la rotación que
// hay que aplicar al root para dejarlo en la orientación esperada.
//
// FILOSOFÍA: SOLO auto-orientamos categorías cuya "forma típica" es
// PREDECIBLE (RAM siempre alta, GPU siempre ancha, motherboard siempre
// fina, CPU siempre chip plano, disco siempre M.2 horizontal). Para
// gabinete y disipador NO auto-orientamos: sus formas varían demasiado
// (mid-tower vs ITX, tower cooler vs AIO 360mm) y la heurística termina
// rompiendo más casos de los que arregla. Si un modelo concreto viene
// mal orientado, se corrige con un `rotation` manual en el registry.
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
    case "cpu": {
      // CPU: Z debe ser el eje más chico (chip plano), igual que el
      // motherboard. Esto pone la IHS (cara superior con el logo)
      // mirando hacia el viewer en lugar de hacia el techo.
      if (size.z <= size.x && size.z <= size.y) return [0, 0, 0];
      if (size.x < size.y) return [0, Math.PI / 2, 0];
      return [Math.PI / 2, 0, 0];
    }
    case "disco": {
      // Disco apoyado sobre el motherboard como M.2: X debe ser el
      // más largo (long axis horizontal).
      if (size.x >= size.y && size.x >= size.z) return [0, 0, 0];
      if (size.z > size.y) return [0, Math.PI / 2, 0];
      return [0, 0, -Math.PI / 2];
    }
    // Para gabinete, disipador, fuente: confiamos en la orientación
    // nativa del modelo. Si algún caso viene mal orientado, pasar
    // `rotation` manual en el registry.
    default:
      return [0, 0, 0];
  }
}

export function GltfModel({
  url,
  category,
  rotation,
  animationsEnabled = true,
}: GltfModelProps) {
  // useGLTF nos da la escena Y las animaciones (si el .glb las trae).
  const { scene, animations } = useGLTF(url);

  // Clave estable para useMemo cuando rotation es un array (que cambia
  // de identidad en cada render del padre, aunque los valores sean iguales).
  const rotKey = rotation
    ? `${rotation[0]},${rotation[1]},${rotation[2]}`
    : null;

  // Clonamos la escena y le aplicamos la rotación. Devolvemos también el
  // clone "interno" porque useAnimations necesita apuntar a la escena
  // que contiene los nodos animados (no al Group envolvente).
  const transformed = useMemo(() => {
    const sceneClone = scene.clone();

    let rot: Vec3 = [0, 0, 0];
    if (rotation) {
      rot = rotation;
    } else if (category) {
      rot = detectAutoRotation(sceneClone, category);
    }

    const root = new Group();
    root.add(sceneClone);
    root.rotation.set(rot[0], rot[1], rot[2]);
    root.updateMatrixWorld(true);

    return { root, sceneClone };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, category, rotKey]);

  // Atamos las animaciones al sceneClone. Si están deshabilitadas,
  // pasamos un array vacío para que el mixer no tenga nada que hacer
  // (cero overhead). Drei updatea el mixer en cada frame automáticamente.
  const effectiveAnimations = animationsEnabled ? animations : [];
  const { actions } = useAnimations(effectiveAnimations, transformed.sceneClone);

  // Reproducimos TODAS las animaciones del modelo en loop infinito.
  // Si el .glb no trae animaciones (la mayoría de los componentes de
  // PC), `actions` es un objeto vacío y el effect no hace nada.
  useEffect(() => {
    if (!animationsEnabled) return;
    if (!animations || animations.length === 0) return;

    const playing = Object.values(actions).filter(
      (a): a is NonNullable<typeof a> => a != null
    );
    playing.forEach((action) => {
      action.reset();
      action.setLoop(LoopRepeat, Infinity);
      // clampWhenFinished=false para que el mixer no "fije" el último
      // frame al terminar; queremos que loopee sin pausas.
      action.clampWhenFinished = false;
      action.play();
    });

    // Cleanup: cuando el modelo se desmonta (el usuario cambió el
    // componente, etc.), paramos las acciones para que el mixer no
    // siga consumiendo CPU.
    return () => {
      playing.forEach((action) => action.stop());
    };
  }, [actions, animations, animationsEnabled]);

  return <primitive object={transformed.root} />;
}
