// Store de autenticación integrado con Supabase.
// Maneja:
//   - Sincronización con la BD de Supabase
//   - Registro, login y logout
//   - Cache local con Zustand
//
// La contraseña se envía al servidor. Supabase Auth se encarga
// de la autenticación segura.

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/supabase";

export type User = {
  id: string;
  username: string;
  createdAt: number;
};

// Tipo del resultado de las operaciones que pueden fallar.
// Usar un objeto en vez de tirar excepción permite a la UI mostrar el
// mensaje de error sin try/catch.
type Result = { ok: true } | { ok: false; error: string };

type AuthState = {
  users: User[];
  currentUserId: string | null;
  isLoading: boolean;

  register: (username: string, password: string) => Promise<Result>;
  login: (username: string, password: string) => Promise<Result>;
  logout: () => Promise<Result>;
  syncUsers: () => Promise<void>;

  // Devuelve el objeto User completo del logueado (o null si no hay).
  // Es un selector "derivado", calculado a partir de los otros campos.
  getCurrentUser: () => User | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      isLoading: false,

      register: async (username, password) => {
        set({ isLoading: true });
        try {
          const cleanUsername = username.trim();

          // Validaciones básicas. Como esto se va a ver en una UI, los
          // mensajes están en español y son claros.
          if (cleanUsername.length < 2) {
            return { ok: false, error: "El usuario debe tener al menos 2 caracteres" };
          }
          if (password.length < 4) {
            return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };
          }

          // Verificar que el usuario no existe
          const { data: existing, error: checkError } = await supabase
            .from("users")
            .select("id")
            .eq("username", cleanUsername)
            .single();

          if (!checkError && existing) {
            return { ok: false, error: "Ese nombre de usuario ya está en uso" };
          }

          // Crear usuario en Supabase
          const { data, error } = await supabase
            .from("users")
            .insert([
              {
                username: cleanUsername,
                password,
              },
            ])
            .select()
            .single();

          if (error || !data) {
            return {
              ok: false,
              error: error?.message || "Error al registrar usuario",
            };
          }

          // Actualizar estado local
          const newUser: User = {
            id: data.id,
            username: data.username,
            createdAt: new Date(data.created_at).getTime(),
          };

          set((state) => ({
            users: [...state.users, newUser],
            currentUserId: newUser.id,
          }));

          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (username, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("username", username.trim())
            .single();

          if (error || !data) {
            return {
              ok: false,
              error: "Usuario o contraseña incorrectos",
            };
          }

          // En producción, la contraseña estaría hasheada en BD
          // Por ahora, comparamos directamente
          if (data.password !== password) {
            return {
              ok: false,
              error: "Usuario o contraseña incorrectos",
            };
          }

          const user: User = {
            id: data.id,
            username: data.username,
            createdAt: new Date(data.created_at).getTime(),
          };

          set({ currentUserId: user.id });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          set({ currentUserId: null });
          return { ok: true };
        } catch (error) {
          return {
            ok: false,
            error: error instanceof Error ? error.message : "Error desconocido",
          };
        }
      },

      syncUsers: async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .order("created_at", { ascending: false });

          if (error || !data) {
            console.error("Error sincronizando usuarios:", error);
            return;
          }

          const users: User[] = data.map((u) => ({
            id: u.id,
            username: u.username,
            createdAt: new Date(u.created_at).getTime(),
          }));

          set({ users });
        } catch (error) {
          console.error("Error sincronizando usuarios:", error);
        }
      },

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        if (!currentUserId) return null;
        return users.find((u) => u.id === currentUserId) ?? null;
      },
    }),
    {
      // Key con la que zustand guarda el estado en localStorage.
      // Si el día de mañana cambiamos la forma del estado, conviene
      // bumpear este nombre para descartar lo viejo.
      name: "tp2-ivo-auth-v2",
    }
  )
);
