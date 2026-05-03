// Slots y dimensiones de referencia del gabinete.
//
// ARQUITECTURA DEL SISTEMA DE TAMAÑO Y POSICIÓN
// ==============================================
//
// 1) ESCALA DE REFERENCIA (`MM_PER_UNIT`)
//    1 unidad de la escena = 100 mm reales. Permite expresar el `size`
//    de cada slot a partir de DIMENSIONES REALES, así los componentes
//    mantienen proporciones realistas entre sí.
//
// 2) GABINETE (`CHASSIS_BOUNDS`)
//    Todo gabinete se normaliza a [4, 6, 4] (~ 400×600×400 mm) con
//    `<FittedModel preserveAspect={false}>`. Sin importar el case que
//    cargues, ocupa el mismo volumen visual y los slots interiores
//    siempre apuntan al mismo lugar.
//
// 3) MOTHERBOARD: HAND-TUNED, NO MM
//    La motherboard es la EXCEPCIÓN al sistema mm: la dimensiono a mano
//    para que ocupe ~80% del chassis (visualmente parece "la pared del
//    fondo del case"). Si la dejara en sus 244×305 mm reales, se vería
//    chica vs el chassis (~60% de ancho). Como el chassis se estira
//    no-uniforme a [4,6,4], la noción de "1 mm real" pierde sentido para
//    la pieza que define el plano de fondo.
//
// 4) RESTO DE COMPONENTES: MM REALES
//    Los demás van con mmSize() basado en specs estándar. Como el slot.z
//    es generoso (los modelos .glb suelen tener bbox.z mucho mayor que
//    el espesor real por incluir conectores y disipadores), el modelo
//    no queda Z-limitado y se ve a tamaño correcto.
//
// 5) ANCLAJE A LA MOTHERBOARD
//    CPU, RAM y DISCO van apoyados sobre la motherboard (Z = -1.0,
//    apenas adelante del plano de la mb que está en Z = -1.65).
//    El disco se posiciona como un M.2 NVMe horizontal (slot pequeño y
//    chato). El disipador y la GPU quedan más adelantados porque
//    sobresalen del plano del MB.

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
};

// Posición Z del centro de la motherboard.
const MB_Z = -1.65;

// Posición Z para componentes apoyados sobre la motherboard.
// Apenas adelante del plano del MB (-1.65) para evitar superposición
// con los capacitores que sobresalen del PCB en los modelos reales.
const ON_MB_Z = -1.0;

export const SLOTS: Record<Exclude<PCCategory, "gabinete">, SlotConfig> = {
  // Motherboard: HAND-TUNED, ~80% del chassis. Domina la pared del fondo.
  motherboard: {
    position: [0, 0, MB_Z],
    size: [3.2, 4.5, 1.2],
  },

  // CPU: socket en la zona superior-izquierda del MB.
  // Slot pequeño (cube ~60mm) para que el chip se vea chico vs la mb.
  cpu: {
    position: [-0.5, 0.8, ON_MB_Z],
    size: mmSize(60, 60, 60),
  },

  // RAM: kit de 2 sticks, JUSTO al lado del CPU socket.
  // Distancia X de 0.7 al CPU para que se vean "encastrados" próximos.
  ram: {
    position: [0.2, 0.8, ON_MB_Z],
    size: mmSize(50, 150, 40),
  },

  // Disipador: arriba del CPU. Sticks adelantado en Z.
  disipador: {
    position: [-0.5, 2.0, -0.3],
    size: mmSize(170, 180, 170),
  },

  // GPU: parte inferior del MB (zona PCIe). Sticks adelantado.
  gpu: {
    position: [0, -1.0, -0.5],
    size: mmSize(330, 160, 100),
  },

  // Disco: como un M.2 NVMe horizontal apoyado sobre la motherboard.
  // Slot CHATO (Z=10mm) para que el modelo quede flat sobre el PCB.
  // Posición típica: entre el CPU socket y la PCIe.
  disco: {
    position: [0.2, 0.1, ON_MB_Z],
    size: mmSize(100, 30, 10),
  },

  // Fuente: abajo del case, bahía estándar ATX.
  fuente: {
    position: [-0.5, -2.5, -0.7],
    size: mmSize(160, 110, 160),
  },
};
