// Store global con Zustand para manejar el estado del PC builder.
// Guarda:
//   - qué componente está elegido para cada categoría (`build`)
//   - qué pestaña/categoría está mirando el usuario (`activeCategory`)
// Zustand es como un "useState global": cualquier componente puede
// leer o modificar el estado sin pasar props por todo el árbol.

import { create } from "zustand";
import type { Build, PCCategory } from "@/types";
import { CATEGORY_ORDER } from "@/types";
import { getComponentById } from "@/data/components";

type BuildState = {
  // Build actual: qué componente eligió el usuario para cada categoría.
  build: Build;

  // Categoría actualmente abierta en la UI (CPU, GPU, etc.).
  activeCategory: PCCategory;

  // Selecciona o cambia un componente en una categoría.
  // Si pasamos undefined como id, "des-selecciona" esa categoría.
  selectComponent: (category: PCCategory, id: string | undefined) => void;

  // Cambia la pestaña activa de la UI.
  setActiveCategory: (category: PCCategory) => void;

  // Limpia todo el build (botón "empezar de nuevo").
  resetBuild: () => void;

  // Reemplaza el build actual por uno guardado (cargar favorito).
  // Hace una copia del objeto para que el favorito no se modifique
  // cuando el usuario edite el build después de cargarlo.
  loadBuild: (build: Build) => void;

  // Calcula el precio total del build sumando los componentes elegidos.
  // Devuelve 0 si no hay nada seleccionado todavía.
  getTotalPrice: () => number;
};

export const useBuildStore = create<BuildState>((set, get) => ({
  build: {},
  activeCategory: CATEGORY_ORDER[0],

  selectComponent: (category, id) =>
    set((state) => ({
      build: { ...state.build, [category]: id },
    })),

  setActiveCategory: (category) => set({ activeCategory: category }),

  resetBuild: () => set({ build: {} }),

  loadBuild: (build) => set({ build: { ...build } }),

  getTotalPrice: () => {
    // Recorremos el build, traemos cada componente del catálogo y sumamos
    // sus precios. Si alguno no existe (id roto), lo ignoramos.
    const { build } = get();
    return Object.values(build).reduce((total, id) => {
      const comp = getComponentById(id);
      return total + (comp?.price ?? 0);
    }, 0);
  },
}));
