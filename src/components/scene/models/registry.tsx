// Registry central de modelos 3D.
// Mapea un `modelId` (string que viene de cada componente del catálogo)
// a un componente React que renderiza el modelo 3D correspondiente.
//
// Si un componente NO tiene `modelId`, o el `modelId` no está en el
// registry, usamos el "default" de su categoría (placeholder procedural
// hecho a mano). Esto pasa por ejemplo con los componentes "genéricos"
// del catálogo que no tienen un .glb propio.
//
// CONVENCIÓN DE ARCHIVOS .glb:
//   public/models/<categoria>/<modelId>.glb
//   ej: public/models/gpu/gpu-rtx-3090.glb
//
// Para sumar un .glb nuevo: pegarlo en la subcarpeta correspondiente
// con el nombre que querés usar como `modelId`, agregar un componente
// en `data/components.ts` con ese `modelId`, y agregar la línea en este
// registry usando `gltfFor("<categoria>", "<modelId>")`.

"use client";

import type { ComponentType } from "react";
import type { PCCategory, PCComponent } from "@/types";
import type { Vec3 } from "../slots";

import {
  DefaultMotherboard,
  DefaultCpu,
  DefaultDisipador,
  DefaultGpu,
  DefaultRam,
  DefaultDisco,
  DefaultFuente,
  DefaultGabinete,
} from "./DefaultModels";

import {
  CoolerNoctua,
  CoolerAio,
  PsuPremium,
} from "./HeroModels";

import { GltfModel } from "./GltfModel";

// Componente de modelo: una función React sin props (los wrappers
// externos se encargan de posición/escala vía FittedModel).
export type ModelComponent = ComponentType;

// Helper para registrar un .glb. Construye la URL con la convención
// de carpetas y le pasa la categoría al GltfModel para que dispare
// la auto-orientación. Si el modelo necesita una rotación manual, se
// pasa por `options.rotation` y eso pisa la heurística.
export function gltfFor(
  category: PCCategory,
  modelId: string,
  options?: { rotation?: Vec3 }
): ModelComponent {
  const url = `/models/${category}/${modelId}.glb`;
  // Memoizamos los valores en variables para que el componente devuelto
  // siempre les pase la misma referencia y useMemo en GltfModel no
  // invalide en cada render.
  const rotation = options?.rotation;
  const Model: ModelComponent = () => (
    <GltfModel url={url} category={category} rotation={rotation} />
  );
  Model.displayName = `Gltf(${modelId})`;
  return Model;
}

// Registry de modelos específicos.
// Las keys son los `modelId` del catálogo (data/components.ts).
const MODEL_REGISTRY: Record<string, ModelComponent> = {
  // Gabinetes (.glb reales)
  "gab-corsair-4000d": gltfFor("gabinete", "gab-corsair-4000d"),
  "gab-fractal-meshify-c": gltfFor("gabinete", "gab-fractal-meshify-c"),
  "gab-ncase-m1": gltfFor("gabinete", "gab-ncase-m1"),
  "gab-nightshark": gltfFor("gabinete", "gab-nightshark"),

  // Motherboards (.glb reales)
  "mb-aorus-b550-elite": gltfFor("motherboard", "mb-aorus-b550-elite"),
  "mb-asus-b550-strix": gltfFor("motherboard", "mb-asus-b550-strix"),
  "mb-msi-z790": gltfFor("motherboard", "mb-msi-z790"),
  "mb-msi-b450-tomahawk": gltfFor("motherboard", "mb-msi-b450-tomahawk"),

  // CPUs (.glb reales)
  "cpu-r5-7600": gltfFor("cpu", "cpu-r5-7600"),
  "cpu-r7-5800x": gltfFor("cpu", "cpu-r7-5800x"),
  "cpu-r7-7800x3d": gltfFor("cpu", "cpu-r7-7800x3d"),
  "cpu-r9-9950x3d": gltfFor("cpu", "cpu-r9-9950x3d"),
  "cpu-r9-7950x3d": gltfFor("cpu", "cpu-r9-7950x3d"),
  "cpu-i5-13600k": gltfFor("cpu", "cpu-i5-13600k"),
  "cpu-i7-14700k": gltfFor("cpu", "cpu-i7-14700k"),
  "cpu-i9-14900k": gltfFor("cpu", "cpu-i9-14900k"),

  // Disipadores (placeholders procedurales — sin .glb propio todavía)
  "cool-noctua": CoolerNoctua,
  "cool-aio": CoolerAio,

  // GPUs (.glb reales)
  "gpu-gtx-1660": gltfFor("gpu", "gpu-gtx-1660"),
  "gpu-rtx-2080-fe": gltfFor("gpu", "gpu-rtx-2080-fe"),
  "gpu-rtx-3080-fe": gltfFor("gpu", "gpu-rtx-3080-fe"),
  "gpu-rtx-3090": gltfFor("gpu", "gpu-rtx-3090"),
  "gpu-rtx-4060-gigabyte": gltfFor("gpu", "gpu-rtx-4060-gigabyte"),
  "gpu-rtx-4090-fe": gltfFor("gpu", "gpu-rtx-4090-fe"),
  "gpu-rtx-5090-fe": gltfFor("gpu", "gpu-rtx-5090-fe"),

  // RAM (.glb reales)
  "ram-corsair-vengeance-lpx": gltfFor("ram", "ram-corsair-vengeance-lpx"),
  "ram-corsair-vengeance-rgb": gltfFor("ram", "ram-corsair-vengeance-rgb"),
  "ram-crucial-ballistix": gltfFor("ram", "ram-crucial-ballistix"),
  "ram-kingston-fury": gltfFor("ram", "ram-kingston-fury"),
  "ram-tforce-ddr5": gltfFor("ram", "ram-tforce-ddr5"),

  // Discos (.glb reales)
  "disk-crucial-mx500": gltfFor("disco", "disk-crucial-mx500"),
  "disk-samsung-990-pro": gltfFor("disco", "disk-samsung-990-pro"),

  // Fuentes (placeholder procedural — sin .glb propio todavía)
  "psu-premium": PsuPremium,
};

// Mapa de "modelo por default" para cada categoría.
// Si no hay match en MODEL_REGISTRY, usamos esto.
const DEFAULTS_BY_CATEGORY: Record<PCCategory, ModelComponent> = {
  motherboard: DefaultMotherboard,
  cpu: DefaultCpu,
  disipador: DefaultDisipador,
  gpu: DefaultGpu,
  ram: DefaultRam,
  disco: DefaultDisco,
  fuente: DefaultFuente,
  gabinete: DefaultGabinete,
};

// Función principal: dado un componente del catálogo, devuelve el
// componente React 3D que hay que renderizar. Si el componente es
// undefined, devuelve null (no se muestra nada en ese slot).
export function getModelFor(
  component: PCComponent | undefined
): ModelComponent | null {
  if (!component) return null;
  if (component.modelId && MODEL_REGISTRY[component.modelId]) {
    return MODEL_REGISTRY[component.modelId];
  }
  return DEFAULTS_BY_CATEGORY[component.category];
}

// Helper para el gabinete: si todavía no eligió ninguno, igual queremos
// mostrar la "carcasa" default para que la escena no se vea vacía.
export function getGabineteModel(
  component: PCComponent | undefined
): ModelComponent {
  const model = getModelFor(component);
  return model ?? DEFAULTS_BY_CATEGORY.gabinete;
}
