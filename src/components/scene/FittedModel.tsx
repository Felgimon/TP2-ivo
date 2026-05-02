// FittedModel: wrapper que toma cualquier modelo 3D (placeholder o .glb
// real) y lo NORMALIZA al tamaño de un slot, además de animar su
// aparición. Da igual si el modelo viene en metros, centímetros o
// "unidades de Blender": acá lo escalamos para que ocupe el espacio
// correcto sin chocar con el resto del gabinete, y lo CENTRAMOS en el
// origen del slot (resuelve también el caso de modelos con el origen
// puesto en una esquina rara).
//
// Cómo lo logra:
//   1) Primer render: rendereamos los hijos a escala 1, pero invisibles.
//      Computamos el bounding box CONSIDERANDO SOLO meshes visibles
//      (ignoramos cámaras, luces, helpers o meshes ocultos del .glb
//      que podrían inflar el box artificialmente y hacernos encoger
//      el modelo más de lo que corresponde).
//   2) `useLayoutEffect` calcula el factor de escala (manteniendo
//      proporción) y el offset que centra el modelo en el origen del slot.
//      Si el modelo es chico, scale > 1 (lo agranda). Si es gigante,
//      scale < 1 (lo achica). El sistema es simétrico — corrige
//      automáticamente en ambas direcciones.
//   3) Segundo render: aplicamos el offset y un `useSpring` que anima
//      la escala desde 0 hasta el valor calculado.
//
// Defensas contra modelos rotos:
//   - Si el bounding box queda vacío (ningún mesh visible), no hacemos
//     nada y avisamos por consola en dev.
//   - Si hay NaN/Infinity (geometría corrupta), abortamos sin romper.
//   - Si un eje del modelo es prácticamente 0 (placa muy chata),
//     usamos 1 como fallback en ese eje para no dividir por 0.
//   - Si la escala calculada da extrema (>1000 o <0.001), avisamos por
//     consola en dev — suele ser señal de que el modelo está en
//     unidades raras o tiene scaffolding que no filtramos bien.

"use client";

import {
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Box3,
  type Group,
  Matrix4,
  type Mesh,
  type Object3D,
  Vector3,
} from "three";
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
// asignando memoria en cada render.
const tmpBox = new Box3();
const tmpMeshBox = new Box3();
const tmpInv = new Matrix4();
const tmpSize = new Vector3();
const tmpCenter = new Vector3();

// Computa el bounding box del subárbol IGNORANDO objetos invisibles.
// Esto es clave: si el .glb del usuario trae cámaras, luces, helpers
// o meshes ocultos (típico de exports de Blender con "scaffolding"),
// el `Box3.setFromObject` estándar los sumaría al bounding box e
// inflaría artificialmente las dimensiones — el modelo se nos
// achicaría más de lo debido. Nuestro recorrido propaga la visibilidad
// del padre y solo suma meshes que tengan geometría real y estén
// visibles a través de toda la cadena de ancestros.
//
// Importante: SALTEAMOS la visibilidad de la raíz en el recorrido.
// El propio FittedModel pone `visible={false}` en su wrapper de
// medición (para que el modelo no flashee a tamaño crudo antes del
// fit), y si propagáramos esa invisibilidad hacia abajo, ningún
// mesh se mediría. El filtro de visibilidad solo aplica a los
// descendientes a partir del nivel siguiente.
function computeVisibleBox(root: Object3D, out: Box3): boolean {
  out.makeEmpty();
  // Modernizamos las matrices del subárbol antes de medir.
  root.updateWorldMatrix(true, true);

  const walk = (obj: Object3D, parentVisible: boolean) => {
    const visible = parentVisible && obj.visible;

    if (visible) {
      const mesh = obj as Mesh;
      if (mesh.isMesh && mesh.geometry) {
        let bb = mesh.geometry.boundingBox;
        // Si la geometría todavía no tiene su bbox calculado, lo hacemos.
        if (!bb) {
          mesh.geometry.computeBoundingBox();
          bb = mesh.geometry.boundingBox;
        }
        if (bb && !bb.isEmpty()) {
          tmpMeshBox.copy(bb).applyMatrix4(mesh.matrixWorld);
          out.union(tmpMeshBox);
        }
      }
    }

    // Si el padre es invisible, los hijos se consideran invisibles
    // (la propiedad `visible` se hereda en three.js para el render,
    // así que es coherente que también afecte el bbox).
    for (const child of obj.children) {
      walk(child, visible);
    }
  };

  // Arrancamos desde los hijos de la raíz, no desde la raíz misma:
  // así nuestro propio wrapper (que va con `visible=false`) no
  // contamina la medición. Los descendientes del modelo siguen
  // respetando su propia bandera `visible`.
  for (const child of root.children) {
    walk(child, true);
  }
  return !out.isEmpty();
}

// Verifica que el bounding box no tenga NaN o Infinity (puede pasar
// con modelos corruptos o geometría con valores rotos).
function isBoxFinite(box: Box3): boolean {
  return (
    Number.isFinite(box.min.x) &&
    Number.isFinite(box.min.y) &&
    Number.isFinite(box.min.z) &&
    Number.isFinite(box.max.x) &&
    Number.isFinite(box.max.y) &&
    Number.isFinite(box.max.z)
  );
}

export function FittedModel({
  children,
  targetSize,
  paddingFactor = 0.95,
}: FittedModelProps) {
  const ref = useRef<Group>(null);
  const [fit, setFit] = useState<FitState | null>(null);

  // Medición: corre después de cada render hasta que `fit` queda seteado.
  useLayoutEffect(() => {
    if (fit) return;
    const node = ref.current;
    if (!node) return;

    // Box solo de meshes visibles (filtra scaffolding y helpers).
    const found = computeVisibleBox(node, tmpBox);
    if (!found) {
      // Subárbol todavía sin meshes visibles. Puede ser que un .glb
      // esté llegando, o que el modelo tenga todo oculto. Esperamos
      // a un próximo render y re-medimos.
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[FittedModel] no encontré meshes visibles para medir — ¿el modelo está cargando o tiene todo oculto?"
        );
      }
      return;
    }
    if (!isBoxFinite(tmpBox)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[FittedModel] bounding box con valores no finitos (modelo corrupto?). Salteo.");
      }
      return;
    }

    // Pasamos el box de coords MUNDIALES a coords LOCALES del slot.
    // Sin esto, el offset de centrado estaría afectado por la posición
    // del slot padre y centraríamos el modelo en el lugar incorrecto.
    tmpInv.copy(node.matrixWorld).invert();
    tmpBox.applyMatrix4(tmpInv);

    tmpBox.getSize(tmpSize);
    tmpBox.getCenter(tmpCenter);

    if (
      !Number.isFinite(tmpSize.x) ||
      !Number.isFinite(tmpSize.y) ||
      !Number.isFinite(tmpSize.z)
    ) {
      return;
    }

    // Factor de escala por eje. Si un eje es prácticamente 0 (placa
    // muy chata), usamos 1 para no romper la cuenta y dejar que los
    // otros ejes determinen la escala. Si todos los ejes son tiny,
    // el modelo igual se escala vía los que sí tengan tamaño.
    const sx = tmpSize.x > 1e-6 ? targetSize[0] / tmpSize.x : 1;
    const sy = tmpSize.y > 1e-6 ? targetSize[1] / tmpSize.y : 1;
    const sz = tmpSize.z > 1e-6 ? targetSize[2] / tmpSize.z : 1;

    // Tomamos el min para que el modelo entre completo (sin distorsión)
    // y le aplicamos el padding para dejar un cachito de aire.
    const rawScale = Math.min(sx, sy, sz);
    const scale = rawScale * paddingFactor;

    if (!Number.isFinite(scale) || scale <= 0) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[FittedModel] escala calculada inválida (${scale}). Tamaño detectado: [${tmpSize.x}, ${tmpSize.y}, ${tmpSize.z}].`
        );
      }
      return;
    }

    // Aviso si el modelo viene en unidades raras (muy chico = aprox.
    // metros cuando esperábamos cm; muy grande = aprox. mm cuando
    // esperábamos cm). No abortamos: aplicamos la corrección igual,
    // solo dejamos rastro en la consola para que el usuario sepa.
    if (process.env.NODE_ENV === "development") {
      if (scale > 1000) {
        console.info(
          `[FittedModel] modelo MUY chico, lo agrando ×${scale.toFixed(0)}. Tamaño raw: [${tmpSize.x.toExponential(1)}, ${tmpSize.y.toExponential(1)}, ${tmpSize.z.toExponential(1)}]. ¿Tal vez está en metros y deberíamos en cm?`
        );
      } else if (scale < 0.001) {
        console.info(
          `[FittedModel] modelo MUY grande, lo achico ×${scale.toExponential(1)}. Tamaño raw: [${tmpSize.x.toFixed(1)}, ${tmpSize.y.toFixed(1)}, ${tmpSize.z.toFixed(1)}]. ¿Tal vez está en mm y deberíamos en cm?`
        );
      }
    }

    setFit({
      scale,
      pos: [
        -tmpCenter.x * scale,
        -tmpCenter.y * scale,
        -tmpCenter.z * scale,
      ],
    });
  });

  // Spring que lleva la escala de 0 al valor calculado.
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

  // Segundo render (fitted): pos centrante + scale animado.
  return (
    <animated.group position={fit.pos} scale={spring.scale}>
      <group ref={ref}>{children}</group>
    </animated.group>
  );
}
