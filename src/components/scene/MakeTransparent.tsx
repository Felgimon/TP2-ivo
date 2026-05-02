// MakeTransparent: wrapper que recorre TODOS los meshes hijos y les
// fuerza materiales semi-transparentes. Lo usamos en el gabinete para
// que SIEMPRE se pueda ver adentro, sin importar si el .glb que metió
// el usuario tiene paredes opacas, panel de vidrio, o un acrílico
// completo. La idea es que el gabinete quede como un "fantasma con
// silueta" que muestra los componentes adentro.
//
// Cómo funciona:
//   1) En el primer mount, recorre el subárbol three.js con `traverse`.
//   2) Por cada Mesh, CLONA su material (importante: clonar para no
//      pisar el material original que puede estar compartido por otros
//      modelos en cache de useGLTF).
//   3) Setea `transparent: true`, `opacity` (mínimo entre la actual y
//      la pedida), `depthWrite: false` y `side: DoubleSide` para que
//      las paredes interiores se vean desde la cámara.
//   4) Al desmontar, dispone los materiales clonados (libera memoria
//      en GPU).
//
// Notas:
//   - `castShadow = false` en los meshes del gabinete: si el gabinete
//     proyectara sombra, la sombra se vería rara (tipo recorte fantasma)
//     sobre los componentes internos. Mejor que el gabinete no la tire.
//   - `Math.min(opacity actual, opacity nueva)`: si un material ya era
//     más transparente que lo que pedimos (ej. un panel de vidrio), no
//     lo hacemos MENOS transparente; respetamos su valor.

"use client";

import { type ReactNode, useLayoutEffect, useRef } from "react";
import { DoubleSide, type Group, type Material, type Mesh } from "three";

type MakeTransparentProps = {
  children: ReactNode;
  // Opacidad target: 0 = invisible, 1 = opaco. Default 0.22 da una
  // silueta clara con buena visibilidad de los componentes adentro.
  opacity?: number;
};

export function MakeTransparent({ children, opacity = 0.22 }: MakeTransparentProps) {
  const ref = useRef<Group>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Lista de materiales que clonamos en este pasaje, para poder
    // disponerlos cuando el componente se desmonte.
    const cloned: Material[] = [];

    // Función que toma un material y devuelve una copia transparente.
    // La encapsulamos así para que funcione tanto si el mesh tiene un
    // material como si tiene un array (multi-material).
    const apply = (m: Material): Material => {
      const c = m.clone();
      c.transparent = true;
      c.opacity = Math.min(c.opacity, opacity);
      c.depthWrite = false;
      c.side = DoubleSide;
      cloned.push(c);
      return c;
    };

    node.traverse((child) => {
      const mesh = child as Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      // El gabinete no proyecta sombras (sería ruido visual).
      mesh.castShadow = false;

      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(apply)
        : apply(mesh.material);
    });

    // Cleanup: cuando el chassis cambia (otro gabinete elegido), este
    // wrapper se desmonta. Liberamos los materiales clonados.
    return () => {
      cloned.forEach((m) => m.dispose());
    };
  }, [opacity]);

  return <group ref={ref}>{children}</group>;
}
