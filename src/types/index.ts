// Tipos centrales del PC builder.
// Acá se define qué es un "componente" y cuáles son las categorías que
// se pueden elegir en el armado.

// Las 8 categorías que el usuario puede elegir al armar la PC.
// Tener esto como union type nos permite usarlo como llaves de objetos
// y que TypeScript nos avise si nos olvidamos de alguna.
export type PCCategory =
  | "gabinete"
  | "motherboard"
  | "cpu"
  | "disipador"
  | "gpu"
  | "ram"
  | "disco"
  | "fuente";

// Información mostrable y filtrable de un componente del catálogo.
// `modelId` es opcional: si no está, se usa el modelo 3D por default
// de la categoría. Si está, se busca en el registry de modelos
// específicos (por ejemplo una RTX 3090 con su modelo propio).
export interface PCComponent {
  id: string;
  category: PCCategory;
  name: string;
  brand: string;
  price: number;
  modelId?: string;
  specs?: Record<string, string>;
  description?: string;
}

// El "build" actual del usuario: para cada categoría guardamos el id
// del componente elegido (o undefined si todavía no eligió nada).
export type Build = {
  [K in PCCategory]?: string;
};

// Etiquetas legibles para mostrar en la UI por categoría.
// Se separa de la lógica para que sea fácil de traducir o cambiar.
export const CATEGORY_LABELS: Record<PCCategory, string> = {
  gabinete: "Gabinete",
  motherboard: "Motherboard",
  cpu: "Procesador",
  disipador: "Disipador",
  gpu: "Tarjeta gráfica",
  ram: "Memoria RAM",
  disco: "Disco",
  fuente: "Fuente",
};

// Orden en el que aparecen las categorías en los tabs.
// Lo dejamos explícito para no depender del orden de las keys del objeto.
export const CATEGORY_ORDER: PCCategory[] = [
  "gabinete",
  "motherboard",
  "cpu",
  "disipador",
  "gpu",
  "ram",
  "disco",
  "fuente",
];
