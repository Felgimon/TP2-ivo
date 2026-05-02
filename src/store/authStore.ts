// Store de autenticación. Maneja:
//   - Una lista de usuarios registrados (en localStorage).
//   - El usuario actualmente logueado (currentUserId).
//   - Operaciones: register, login, logout.
//
// IMPORTANTE: Esto NO es seguridad real. Las contraseñas se guardan en
// texto plano en localStorage del navegador, así que cualquiera con
// acceso al navegador puede verlas. Está pensado para un TP académico
// donde lo que se evalúa es el flujo de UX y la persistencia.
// Si más adelante migramos a un backend (Supabase, NextAuth + DB),
// reemplazamos este store por uno que llame a la API y todo lo demás
// (UI, modales, favoritos) sigue funcionando sin cambios.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type User = {
  id: string;
  username: string;
  password: string;
  createdAt: number;
};

// Tipo del resultado de las operaciones que pueden fallar.
// Usar un objeto en vez de tirar excepción permite a la UI mostrar el
// mensaje de error sin try/catch.
type Result = { ok: true } | { ok: false; error: string };

type AuthState = {
  users: User[];
  currentUserId: string | null;

  register: (username: string, password: string) => Result;
  login: (username: string, password: string) => Result;
  logout: () => void;

  // Devuelve el objeto User completo del logueado (o null si no hay).
  // Es un selector "derivado", calculado a partir de los otros campos.
  getCurrentUser: () => User | null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,

      register: (username, password) => {
        const { users } = get();
        const cleanUsername = username.trim();

        // Validaciones básicas. Como esto se va a ver en una UI, los
        // mensajes están en español y son claros.
        if (cleanUsername.length < 2) {
          return { ok: false, error: "El usuario debe tener al menos 2 caracteres" };
        }
        if (password.length < 4) {
          return { ok: false, error: "La contraseña debe tener al menos 4 caracteres" };
        }
        if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
          return { ok: false, error: "Ese nombre de usuario ya está en uso" };
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          username: cleanUsername,
          password,
          createdAt: Date.now(),
        };

        // Al registrar, también logueamos automáticamente al usuario.
        set({ users: [...users, newUser], currentUserId: newUser.id });
        return { ok: true };
      },

      login: (username, password) => {
        const { users } = get();
        const user = users.find(
          (u) =>
            u.username.toLowerCase() === username.trim().toLowerCase() &&
            u.password === password
        );
        if (!user) {
          return { ok: false, error: "Usuario o contraseña incorrectos" };
        }
        set({ currentUserId: user.id });
        return { ok: true };
      },

      logout: () => set({ currentUserId: null }),

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
      name: "tp2-ivo-auth-v1",
    }
  )
);
