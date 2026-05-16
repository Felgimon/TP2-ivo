// Modal de autenticación: maneja "Iniciar sesión" y "Crear cuenta" con
// un toggle entre los dos modos. Si la operación tiene éxito, cierra
// el modal solo. Si falla, muestra el mensaje de error en rojo.

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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
  // Toggle del ojito: si está en true mostramos el password en texto
  // plano (input type="text"), si no lo escondemos con bullets.
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  // Limpia el formulario al cerrar el modal o cambiar de modo.
  // Resetea también el toggle del ojito, para que la próxima vez que
  // se abra el modal arranque oculto.
  const reset = () => {
    setUsername("");
    setPassword("");
    setShowPassword(false);
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
    
    const operation = mode === "login" ? login(username, password) : register(username, password);
    
    // Manejar promesa async
    operation.then((result) => {
      if (result.ok) {
        reset();
        onClose();
      } else {
        setError(result.error);
      }
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "Error desconocido");
    });
  };

  const title = mode === "login" ? "Iniciar sesión" : "Crear cuenta";
  const submitLabel = mode === "login" ? "Entrar" : "Registrarme";
  const switchLabel =
    mode === "login" ? "¿No tenés cuenta? Crear una" : "¿Ya tenés cuenta? Iniciar sesión";

  return (
    <Modal open={open} onClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-fg/50 mb-1.5">
            Usuario
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
            className="w-full px-3 py-2 rounded-lg bg-fg/5 border border-fg/10 text-fg focus:outline-none focus:border-emerald-400/60"
            placeholder="tu_usuario"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-fg/50 mb-1.5">
            Contraseña
          </label>
          {/* Wrapper relativo: el input es full-width y el botón del
              ojito se posiciona absoluto a la derecha, dentro del input.
              El pr-10 del input le deja espacio al botón para que no
              tape el texto que tipea el usuario. */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 pr-10 rounded-lg bg-fg/5 border border-fg/10 text-fg focus:outline-none focus:border-emerald-400/60"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              // tabIndex={-1} para que el Tab del teclado no caiga acá
              // entre el input y el botón submit — es un control auxiliar,
              // no parte del flujo principal del form.
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-fg/40 hover:text-fg/80 hover:bg-fg/5 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
          className="w-full text-xs text-fg/50 hover:text-fg/80 transition-colors cursor-pointer"
        >
          {switchLabel}
        </button>
      </form>
    </Modal>
  );
}
