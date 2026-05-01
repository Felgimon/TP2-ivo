// Registry central de modelos 3D.
// Mapea un `modelId` (string que viene de cada componente del catálogo)
// a un componente React que renderiza el modelo 3D correspondiente.
//
// Si un componente NO tiene `modelId`, o el `modelId` no está en el
// registry, usamos el "default" de su categoría. Esto permite ir
// agregando modelos específicos de a poco sin romper el resto.
//
// CONVENCIÓN DE ARCHIVOS .glb:
//   public/models/<categoria>/<modelId>.glb
//   ej: public/models/gpu/gpu-rtx-3090.glb
//
// Para reemplazar un placeholder por un .glb real, cambiar la entrada
// a algo como:
//   "gpu-rtx-3090": () => <GltfModel url="/models/gpu/gpu-rtx-3090.glb" />,
//
// El sistema de FittedModel se encarga de escalar el .glb al tamaño
// correcto del slot, así que NO importa en qué unidades venga el modelo.

"use client";

import type { ComponentType } from "react";
import type { PCCategory, PCComponent } from "@/types";

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
  GpuRtx3090,
  GpuRtx5070,
  GpuAmdFlagship,
  CpuAmdPremium,
  CpuIntelPremium,
  CoolerNoctua,
  CoolerAio,
  RamRgb,
  DiskNvme,
  DiskHdd,
  PsuPremium,
  GabineteGlassWhite,
  GabineteGlassBlack,
} from "./HeroModels";

// Componente de modelo: una función React sin props (los wrappers
// externos se encargan de posición/escala vía FittedModel).
export type ModelComponent = ComponentType;

// Registry de modelos específicos.
// Las keys son los `modelId` del catálogo (data/components.ts).
// Para agregar un .glb nuevo:
//   1) Lo poné en public/models/<categoria>/<id>.glb
//   2) Importá `GltfModel` y agregá una entrada acá:
//        "<id>": () => <GltfModel url="/models/<categoria>/<id>.glb" />,
const MODEL_REGISTRY: Record<string, ModelComponent> = {
  // GPUs
  "gpu-rtx-3090": GpuRtx3090,
  "gpu-rtx-5070": GpuRtx5070,
  "gpu-amd-flagship": GpuAmdFlagship,

  // CPUs
  "cpu-amd-premium": CpuAmdPremium,
  "cpu-intel-premium": CpuIntelPremium,

  // Disipadores
  "cool-noctua": CoolerNoctua,
  "cool-aio": CoolerAio,

  // RAM
  "ram-rgb": RamRgb,

  // Discos
  "disk-nvme": DiskNvme,
  "disk-hdd": DiskHdd,

  // Fuentes
  "psu-premium": PsuPremium,

  // Gabinetes
  "gab-glass-white": GabineteGlassWhite,
  "gab-glass-black": GabineteGlassBlack,
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
