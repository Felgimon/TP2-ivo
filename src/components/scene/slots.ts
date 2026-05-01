// Slots y dimensiones de referencia del gabinete.
//
// La idea de tener "tamaños" además de "posiciones" es que ahora
// cualquier modelo (placeholder o .glb real) se auto-ajusta al
// espacio que le toca. Sin esto, un .glb de RTX 5090 en escala "real"
// (30 cm de largo) saldría enorme contra un gabinete de 4 unidades.
//
// El sistema funciona así:
//   1) `CHASSIS_BOUNDS` es la caja de referencia del gabinete.
//      Cuando el usuario pone un .glb de gabinete, lo escalamos para
//      que entre exactamente en esta caja. Así las posiciones de los
//      slots son siempre las mismas, sin importar el modelo del case.
//   2) Cada slot tiene una `size` (X, Y, Z) que es la caja máxima en
//      la que el componente debe entrar (manteniendo proporción).
//   3) `<FittedModel>` (en FittedModel.tsx) toma el modelo y calcula
//      el factor de escala + el offset para centrarlo en su slot.

import type { PCCategory } from "@/types";

// Tupla [x, y, z]. La usamos para position, rotation y size.
export type Vec3 = [number, number, number];

// Caja de referencia del gabinete. Todo gabinete (placeholder o .glb)
// se escala para encajar acá adentro. Ancho 4, alto 6, profundidad 4.
export const CHASSIS_BOUNDS: Vec3 = [4.0, 6.0, 4.0];

// Configuración de un slot interior: dónde va el centro del componente
// y qué caja máxima puede ocupar.
export type SlotConfig = {
  position: Vec3;
  rotation?: Vec3;
  size: Vec3;
};

// Slots para todos los componentes que viven ADENTRO del gabinete.
// El propio gabinete no está acá: él es el contenedor.
export const SLOTS: Record<Exclude<PCCategory, "gabinete">, SlotConfig> = {
  // Motherboard: pegada al fondo del gabinete, plana y vertical.
  // Es chata (Z=0.2) porque es básicamente una placa.
  motherboard: {
    position: [0, 0, -1.65],
    size: [3.0, 4.5, 0.25],
  },

  // CPU: pequeño, pegado al socket de la motherboard.
  cpu: {
    position: [-0.7, 1.0, -1.4],
    size: [0.7, 0.7, 0.25],
  },

  // Disipador: arriba del CPU, ocupa bastante espacio vertical.
  disipador: {
    position: [-0.7, 2.0, -1.0],
    size: [1.3, 1.6, 1.3],
  },

  // RAM: a la derecha del CPU, sticks parados.
  ram: {
    position: [0.4, 1.2, -1.1],
    size: [1.1, 1.5, 0.6],
  },

  // GPU: horizontal, abajo del CPU. Es el componente más largo del set.
  gpu: {
    position: [0.0, -0.4, -0.7],
    size: [3.4, 1.0, 1.6],
  },

  // Disco: bahía a la derecha, abajo. Acepta tanto NVMe finito
  // como un HDD 3.5" mas grande (el auto-fit ajusta).
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
