// Store de favoritos. Cada usuario logueado puede guardar varios
// builds (sets de componentes de PC) con su nombre y la fecha en que
// los guardó. La data persiste en localStorage.
//
// Cada SavedBuild guarda los IDs de los componentes elegidos (no toda
// la info, porque la info "real" vive en el catálogo `data/components.ts`).
// Cuando mostramos el favorito, hacemos lookup en el catálogo para
// traer nombre, marca, precio, etc. Esto evita duplicar info y mantiene
// los favoritos al día si actualizamos el catálogo.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Build } from "@/types";

export type SavedBuild = {
  id: string;
  userId: string;
  name: string;
  build: Build;
  createdAt: number;
};

type FavoritesState = {
  saved: SavedBuild[];

  // Guarda un build con un nombre dado para un usuario.
  // Devuelve el SavedBuild creado por si la UI lo necesita.
  saveBuild: (userId: string, name: string, build: Build) => SavedBuild;

  // Elimina un build por id.
  deleteBuild: (id: string) => void;

  // Trae todos los builds guardados de un usuario (los más nuevos primero).
  getByUser: (userId: string) => SavedBuild[];
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      saved: [],

      saveBuild: (userId, name, build) => {
        const newSaved: SavedBuild = {
          id: crypto.randomUUID(),
          userId,
          name: name.trim() || "Sin nombre",
          // Copiamos el build para que cambios futuros del builder no
          // muten el favorito guardado.
          build: { ...build },
          createdAt: Date.now(),
        };
        set({ saved: [newSaved, ...get().saved] });
        return newSaved;
      },

      deleteBuild: (id) => {
        set({ saved: get().saved.filter((b) => b.id !== id) });
      },

      getByUser: (userId) =>
        get()
          .saved.filter((b) => b.userId === userId)
          .sort((a, b) => b.createdAt - a.createdAt),
    }),
    { name: "tp2-ivo-favorites-v1" }
  )
);
