// Hook para sincronizar datos con Supabase cuando el usuario inicia sesión

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export function useSupabaseSync() {
  const currentUser = useAuthStore((state) => state.getCurrentUser());
  const syncUserBuilds = useFavoritesStore((state) => state.syncUserBuilds);

  useEffect(() => {
    if (currentUser) {
      // Sincronizar los builds del usuario cuando inicia sesión
      syncUserBuilds(currentUser.id);
    }
  }, [currentUser?.id]);
}
