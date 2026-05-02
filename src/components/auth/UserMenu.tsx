// Menú de usuario en el header.
// Si NO hay usuario logueado: muestra un botón "Iniciar sesión".
// Si HAY usuario: muestra el nombre + un botón "Salir".
//
// Espera a `useHydrated` antes de renderizar para evitar mismatch
// entre el HTML del servidor (siempre "no logueado") y el del cliente
// (donde puede haber un usuario en localStorage).

"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useHydrated } from "@/hooks/useHydrated";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const hydrated = useHydrated();
  const [authOpen, setAuthOpen] = useState(false);

  // Suscribimos al currentUserId Y a users: si cambia cualquiera de los
  // dos (login, logout, register, edición futura), re-renderizamos.
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const users = useAuthStore((s) => s.users);
  const logout = useAuthStore((s) => s.logout);

  // Mientras no haya hidratado, devolvemos un placeholder del mismo
  // alto para que no haya "salto" visual cuando se carga el estado.
  if (!hydrated) {
    return <div className="h-9 w-28" aria-hidden />;
  }

  const user = users.find((u) => u.id === currentUserId) ?? null;

  if (!user) {
    return (
      <>
        <button
          onClick={() => setAuthOpen(true)}
          className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-medium transition-colors cursor-pointer"
        >
          Iniciar sesión
        </button>
        <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar con la inicial del usuario, redondito */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-sm font-semibold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm text-white/80">{user.username}</span>
      </div>
      <button
        onClick={logout}
        className="text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
      >
        Salir
      </button>
    </div>
  );
}
