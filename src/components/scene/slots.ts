// Slots y dimensiones de referencia del gabinete.
//
// ARQUITECTURA DEL SISTEMA DE TAMAÑO Y POSICIÓN
// ==============================================
//
// 1) GABINETE (`CHASSIS_BOUNDS`)
//    Todo gabinete se normaliza a [4, 6, 4] con
//    `<FittedModel preserveAspect={false}>` en PCScene. El chassis
//    siempre ocupa el mismo volumen, así los slots interiores tienen
//    coordenadas confiables.
//
// 2) MOTHERBOARD: TAMAÑO FIJO (NON-UNIFORM SCALED)
//    El motherboard también usa `preserveAspect: false`. Sin esto,
//    `FittedModel` lo escala uniformemente y la profundidad (Z) varía
//    según el modelo .glb — modelos que incluyen capacitores grandes
//    pueden hacer que la motherboard atraviese la pared trasera del
//    chassis. Con `preserveAspect: false`, el motherboard SIEMPRE mide
//    [3.2, 4.5, 0.3] y su cara frontal SIEMPRE está en Z=-1.35.
//    Eso permite anclar CPU/RAM/disco a Z=-1.25 con precisión.
//
// 3) RESTO DE COMPONENTES INTERIORES
//    `preserveAspect: true` (default) — escala uniforme, mantienen
//    proporciones realistas. Las dimensiones se expresan en mm reales
//    via `mmSize()` para que motherboard/CPU/RAM/etc. sean
//    proporcionales entre sí.
//
// 4) ANCLAJE A LA MOTHERBOARD
//    CPU, RAM y disco van apoyados sobre la motherboard a `Z = ON_MB_Z
//    = -1.25`, justo 0.1 unidades adelante del frente del MB (-1.35).
//    Como el MB tiene tamaño fijo, este ancle FUNCIONA sin importar
//    qué modelo de motherboard se haya seleccionado.

import type { PCCategory } from "@/types";

export type Vec3 = [number, number, number];

const MM_PER_UNIT = 100;
const mm = (n: number): number => n / MM_PER_UNIT;
const mmSize = (w: number, h: number, d: number): Vec3 => [mm(w), mm(h), mm(d)];

export const CHASSIS_BOUNDS: Vec3 = [4.0, 6.0, 4.0];

export type SlotConfig = {
  position: Vec3;
  rotation?: Vec3;
  size: Vec3;
  // Si false, el modelo se estira por eje para llenar `size`. Si true
  // (default), se escala uniformemente manteniendo proporciones.
  preserveAspect?: boolean;
};

// Centro Z del motherboard. Movido adelante respecto al fondo del
// chassis (Z=-2) para que ningún modelo lo atraviese.
const MB_Z = -1.5;

// Z para componentes apoyados sobre la motherboard. La cara frontal
// del motherboard está en Z=-1.5 + 0.15 = -1.35; ON_MB_Z=-1.25 los
// pone 0.1 unidades adelante, visualmente "encastrados".
const ON_MB_Z = -1.25;

export const SLOTS: Record<Exclude<PCCategory, "gabinete">, SlotConfig> = {
  // Motherboard: TAMAÑO FIJO, NON-UNIFORM. Ocupa ~80% del chassis.
  motherboard: {
    position: [0, 0, MB_Z],
    size: [3.2, 4.5, 0.3],
    preserveAspect: false,
  },

  // CPU: zona superior-izquierda del MB, apoyado.
  cpu: {
    position: [-0.5, 0.8, ON_MB_Z],
    size: mmSize(60, 60, 60),
  },

  // RAM: justo a la derecha del CPU, apoyada.
  ram: {
    position: [0.3, 0.8, ON_MB_Z],
    size: mmSize(50, 150, 40),
  },

  // Disipador: arriba del CPU, sobresale hacia adelante.
  disipador: {
    position: [-0.5, 1.95, -0.5],
    size: mmSize(170, 180, 170),
  },

  // GPU: zona inferior del MB (PCIe), sobresale hacia adelante.
  gpu: {
    position: [0, -0.8, -0.5],
    size: mmSize(330, 160, 100),
  },

  // Disco (M.2 NVMe): apoyado sobre la motherboard, entre CPU y GPU.
  disco: {
    position: [0.2, 0.1, ON_MB_Z],
    size: mmSize(100, 30, 10),
  },

  // Fuente: parte inferior del chassis.
  fuente: {
    position: [-0.5, -2.5, -0.7],
    size: mmSize(160, 110, 160),
  },
};
