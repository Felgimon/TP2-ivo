// Store de favoritos integrado con Supabase.
// Cada usuario logueado puede guardar varios builds (sets de componentes de PC)
// con su nombre y la fecha en que los guardó. La data persiste en Supabase.
//
// Cada SavedBuild guarda los IDs de los componentes elegidos (no toda
// la info, porque la info "real" vive en el catálogo `data/components.ts`).
// Cuando mostramos el favorito, hacemos lookup en el catálogo para
// traer nombre, marca, precio, etc. Esto evita duplicar info y mantiene
// los favoritos al día si actualizamos el catálogo.

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Build } from "@/types";
import { supabase } from "@/supabase";

export type SavedBuild = {
  id: string;
  userId: string;
  name: string;
  build: Build;
  createdAt: number;
};

type FavoritesState = {
  saved: SavedBuild[];
  isLoading: boolean;

  // Guarda un build con un nombre dado para un usuario.
  // Devuelve el SavedBuild creado por si la UI lo necesita.
  saveBuild: (userId: string, name: string, build: Build) => Promise<SavedBuild | null>;

  // Elimina un build por id.
  deleteBuild: (id: string) => Promise<boolean>;

  // Trae todos los builds guardados de un usuario (los más nuevos primero).
  getByUser: (userId: string) => SavedBuild[];

  // Sincroniza los builds de un usuario desde Supabase
  syncUserBuilds: (userId: string) => Promise<void>;

  // Sincroniza todos los builds desde localStorage (migración)
  syncFromLocalStorage: () => void;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      saved: [],
      isLoading: false,

      saveBuild: async (userId, name, build) => {
        set({ isLoading: true });
        try {
          const newSavedBuild = {
            user_id: userId,
            name: name.trim() || "Sin nombre",
            build,
          };

          const { data, error } = await supabase
            .from("saved_builds")
            .insert([newSavedBuild])
            .select()
            .single();

          if (error || !data) {
            console.error("Error guardando build:", error);
            return null;
          }

          const savedBuild: SavedBuild = {
            id: data.id,
            userId: data.user_id,
            name: data.name,
            build: data.build as Build,
            createdAt: new Date(data.created_at).getTime(),
          };

          set({ saved: [savedBuild, ...get().saved] });
          return savedBuild;
        } catch (error) {
          console.error("Error guardando build:", error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteBuild: async (id) => {
        try {
          const { error } = await supabase
            .from("saved_builds")
            .delete()
            .eq("id", id);

          if (error) {
            console.error("Error eliminando build:", error);
            return false;
          }

          set({ saved: get().saved.filter((b) => b.id !== id) });
          return true;
        } catch (error) {
          console.error("Error eliminando build:", error);
          return false;
        }
      },

      getByUser: (userId) =>
        get()
          .saved.filter((b) => b.userId === userId)
          .sort((a, b) => b.createdAt - a.createdAt),

      syncUserBuilds: async (userId) => {
        try {
          const { data, error } = await supabase
            .from("saved_builds")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          if (error || !data) {
            console.error("Error sincronizando builds:", error);
            return;
          }

          const builds: SavedBuild[] = data.map((b) => ({
            id: b.id,
            userId: b.user_id,
            name: b.name,
            build: b.build as Build,
            createdAt: new Date(b.created_at).getTime(),
          }));

          // Combinar con builds locales sin actualizar los de otros usuarios
          set((state) => ({
            saved: [
              ...builds,
              ...state.saved.filter((b) => b.userId !== userId),
            ],
          }));
        } catch (error) {
          console.error("Error sincronizando builds:", error);
        }
      },

      syncFromLocalStorage: () => {
        // Este método puede usarse para migrar datos de localStorage
        // Por ahora solo sirve como placeholder
      },
    }),
    { name: "tp2-ivo-favorites-v2" }
  )
);
