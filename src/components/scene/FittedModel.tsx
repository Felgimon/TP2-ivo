// FittedModel: wrapper que toma cualquier modelo 3D (placeholder o .glb
// real) y lo NORMALIZA al tamaño de un slot, además de animarlo cuando
// aparece. Así da igual si el modelo viene en metros, centímetros o
// "unidades de Blender": acá lo escalamos para que ocupe el espacio
// correcto sin chocar con el resto del gabinete.
//
// Cómo lo logra:
//   1) Primer render: rendereamos los hijos a escala 1, pero invisibles
//      (no se ven en pantalla). Con `Box3.setFromObject` calculamos su
//      caja de bounding en el espacio LOCAL del slot.
//   2) `useLayoutEffect` calcula el factor de escala (manteniendo
//      proporción) y el offset que centra el modelo en el origen del slot.
//   3) Segundo render: aplicamos el offset y un `useSpring` que anima la
//      escala desde 0 hasta el valor calculado (efecto de aparición).

"use client";

import {
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Box3, type Group, Matrix4, Vector3 } from "three";
import { animated, useSpring } from "@react-spring/three";

import type { Vec3 } from "../scene/slots";

type FittedModelProps = {
  children: ReactNode;
  // Caja máxima permitida (X, Y, Z) en unidades del gabinete.
  targetSize: Vec3;
  // Factor de "respiro": 1 = ocupa todo el slot; 0.95 deja un 5% de aire
  // en cada lado para que no toque las paredes.
  paddingFactor?: number;
};

type FitState = { scale: number; pos: Vec3 };

// Reusamos estos objetos de three.js entre llamadas para no andar
// asignando memoria en cada render (es un patrón común en R3F/three.js).
const tmpBox = new Box3();
const tmpInv = new Matrix4();
const tmpSize = new Vector3();
const tmpCenter = new Vector3();

export function FittedModel({
  children,
  targetSize,
  paddingFactor = 0.95,
}: FittedModelProps) {
  const ref = useRef<Group>(null);
  const [fit, setFit] = useState<FitState | null>(null);

  // Medición: corre después de cada render hasta que `fit` queda seteado.
  // Mide el bounding box de los hijos y calcula scale + offset de centrado.
  useLayoutEffect(() => {
    if (fit) return;
    const node = ref.current;
    if (!node) return;

    // Forzamos a three.js a recalcular las matrices por si los hijos
    // se montaron recién (por ejemplo, después de un Suspense de useGLTF).
    node.updateMatrixWorld(true);
    tmpBox.setFromObject(node);

    // Si el bounding box vino vacío (puede pasar si el subárbol no
    // tiene meshes todavía, p.ej. esperando un .glb), no hacemos nada.
    // El useLayoutEffect va a volver a correr en el próximo render.
    if (tmpBox.isEmpty()) return;

    // `setFromObject` da coordenadas en MUNDO. Las pasamos al espacio
    // LOCAL del slot invirtiendo la matriz mundial del nodo. Si no
    // hiciéramos esto, el offset estaría afectado por la posición
    // del slot padre y centraríamos el modelo en el lugar incorrecto.
    tmpInv.copy(node.matrixWorld).invert();
    tmpBox.applyMatrix4(tmpInv);

    tmpBox.getSize(tmpSize);
    tmpBox.getCenter(tmpCenter);

    // Calculamos el factor de escala por eje y nos quedamos con el más
    // chico (así el modelo entra entero en la caja sin distorsionarse).
    // Si algún eje del modelo es prácticamente 0 (p.ej. una placa muy
    // chata), evitamos dividir por cero usando 1 como fallback.
    const sx = tmpSize.x > 1e-4 ? targetSize[0] / tmpSize.x : 1;
    const sy = tmpSize.y > 1e-4 ? targetSize[1] / tmpSize.y : 1;
    const sz = tmpSize.z > 1e-4 ? targetSize[2] / tmpSize.z : 1;
    const scale = Math.min(sx, sy, sz) * paddingFactor;

    // Offset = -centro * escala. Movemos el modelo para que su centro
    // (el del bounding box) caiga sobre el origen del slot.
    setFit({
      scale,
      pos: [
        -tmpCenter.x * scale,
        -tmpCenter.y * scale,
        -tmpCenter.z * scale,
      ],
    });
  });

  // Spring que lleva la escala de 0 al valor calculado (animación de
  // "aparición" tipo Blender). Mientras `fit` es null, scale queda en 0.
  const spring = useSpring({
    scale: fit?.scale ?? 0,
    from: { scale: 0 },
    config: { tension: 220, friction: 18 },
  });

  // Primer render (medición): tree mínimo, sin transformaciones propias,
  // oculto. Esto garantiza que el bounding box se mide al tamaño "real"
  // del modelo, sin que ningún spring lo escale a 0 y rompa la cuenta.
  if (!fit) {
    return (
      <group ref={ref} visible={false}>
        {children}
      </group>
    );
  }

  // Segundo render (fitted): aplicamos pos centrante y la escala animada.
  // El `<group ref>` interno sigue ahí para que mediciones futuras (si las
  // hubiera) sigan teniendo dónde apoyarse.
  return (
    <animated.group position={fit.pos} scale={spring.scale}>
      <group ref={ref}>{children}</group>
    </animated.group>
  );
}
