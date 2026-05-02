// Slots y dimensiones de referencia del gabinete.
//
// Tener "tamaños" además de "posiciones" hace que cualquier modelo
// (placeholder o .glb real) se auto-ajuste al espacio que le toca.
// Un .glb de RTX 5090 que viene en escala "real" (30 cm de largo) o uno
// que viene en metros, ambos terminan ocupando la misma caja después
// del FittedModel.
//
// Cómo funciona el sistema:
//   1) `CHASSIS_BOUNDS` es la caja de referencia del gabinete.
//      Cuando metés un .glb de gabinete, lo escalamos para que entre
//      exactamente en esta caja. Así las posiciones de los slots son
//      siempre las mismas, sin importar qué case uses.
//   2) Cada slot tiene un `size` (X, Y, Z) que es la caja máxima en
//      la que el componente debe entrar (manteniendo proporción).
//   3) `<FittedModel>` (en FittedModel.tsx) toma el modelo y calcula
//      el factor de escala + el offset para centrarlo en su slot.
//
// Las posiciones están pensadas para una distribución típica ATX:
//   - Motherboard pegada al fondo del case.
//   - CPU en la parte superior izquierda (mirando desde el panel
//     de vidrio).
//   - Disipador justo arriba del CPU.
//   - RAM al lado del CPU.
//   - GPU horizontal abajo del CPU, atravesando el ancho del case.
//   - Disco en la bahía derecha, mitad inferior.
//   - Fuente abajo de todo, atrás.

import type { PCCategory } from "@/types";

// Tupla [x, y, z]. Para position, rotation y size.
export type Vec3 = [number, number, number];

// Caja de referencia del gabinete. Todo gabinete (placeholder o .glb)
// se normaliza a este tamaño. Ancho 4, alto 6, profundidad 4.
export const CHASSIS_BOUNDS: Vec3 = [4.0, 6.0, 4.0];

// Configuración de un slot interior: dónde va el centro del componente
// y qué caja máxima puede ocupar.
export type SlotConfig = {
  position: Vec3;
  rotation?: Vec3;
  size: Vec3;
};

// Slots para todos los componentes que viven ADENTRO del gabinete.
// El gabinete no está acá: él es el contenedor.
export const SLOTS: Record<Exclude<PCCategory, "gabinete">, SlotConfig> = {
  // Motherboard: pegada al fondo, plana y vertical.
  // Z muy negativo = bien al fondo. Profundidad chiquita (es una placa).
  motherboard: {
    position: [0, 0, -1.65],
    size: [3.0, 4.5, 0.25],
  },

  // CPU: pegado al socket de la motherboard.
  // Z = -1.5 para que su cara trasera quede contra la mobo y el chip
  // no quede flotando con un gap visible.
  cpu: {
    position: [-0.7, 1.0, -1.5],
    size: [0.7, 0.7, 0.25],
  },

  // Disipador: arriba del CPU, ocupa bastante espacio vertical.
  // Y = 2.1 para que se siente sobre el CPU sin meterse adentro.
  // Z = -0.9 lo lleva un poco más adelante que el CPU (los coolers
  // de torre suelen ser más profundos que el chip).
  disipador: {
    position: [-0.7, 2.1, -0.9],
    size: [1.3, 1.6, 1.3],
  },

  // RAM: a la derecha del CPU, sticks parados.
  // Z = -1.25 alinea con el plano del CPU/mobo.
  ram: {
    position: [0.4, 1.2, -1.25],
    size: [1.1, 1.5, 0.6],
  },

  // GPU: horizontal, abajo del CPU. El componente más largo del set.
  gpu: {
    position: [0.0, -0.4, -0.7],
    size: [3.4, 1.0, 1.6],
  },

  // Disco: bahía a la derecha, abajo. Acepta NVMe finito o HDD 3.5".
  disco: {
    position: [1.4, -1.5, 0.4],
    size: [1.1, 0.5, 1.5],
  },

  // Fuente: abajo del gabinete, atrás. Dimensiones típicas ATX.
  fuente: {
    position: [-0.5, -2.4, -0.7],
    size: [1.9, 1.0, 1.6],
  },
};
