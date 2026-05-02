// Modal de autenticación: maneja "Iniciar sesión" y "Crear cuenta" con
// un toggle entre los dos modos. Si la operación tiene éxito, cierra
// el modal solo. Si falla, muestra el mensaje de error en rojo.

"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";

type AuthModalProps = {
  open: boolean;
  onClose: () => void;
};

type Mode = "login" | "register";

export function AuthModal({ open, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  // Limpia el formulario al cerrar el modal o cambiar de modo.
  const reset = () => {
    setUsername("");
    setPassword("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = mode === "login" ? login(username, password) : register(username, password);
    if (result.ok) {
      reset();
      onClose();
    } else {
      setError(result.error);
    }
  };

  const title = mode === "login" ? "Iniciar sesión" : "Crear cuenta";
  const submitLabel = mode === "login" ? "Entrar" : "Registrarme";
  const switchLabel =
    mode === "login" ? "¿No tenés cuenta? Crear una" : "¿Ya tenés cuenta? Iniciar sesión";

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"
            placeholder="tu_usuario"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/60"
            placeholder="••••••••"
          />
        </div>

        {/* Mensaje de error: solo si lo hay. */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors cursor-pointer"
        >
          {submitLabel}
        </button>

        <button
          type="button"
          onClick={switchMode}
          className="w-full text-xs text-white/50 hover:text-white/80 transition-colors cursor-pointer"
        >
          {switchLabel}
        </button>
      </form>
    </Modal>
  );
}
