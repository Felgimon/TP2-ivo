// Modal genérico reutilizable.
// Lo usan AuthModal, SaveBuildModal y FavoritesModal.
//
// Comportamiento:
//   - Backdrop oscuro semi-transparente que cierra al hacer click.
//   - Animación de entrada/salida con framer-motion.
//   - Tecla Escape también cierra (mejora la accesibilidad).
//   - Botón "×" en la esquina superior derecha.

"use client";

import { type ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  // Ancho máximo del panel. Por default md (28rem).
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({ open, onClose, title, children, size = "md" }: ModalProps) {
  // Listener de Escape: solo cuando el modal está abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop: cubre toda la pantalla y cierra al click. */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel del modal con su animación propia (escala + slide). */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className={`relative w-full ${SIZE_CLASSES[size]} bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden`}
          >
            {title && (
              <div className="px-6 pt-6 pb-3 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              </div>
            )}
            <div className="p-6">{children}</div>
            {/* Botón cerrar (X) — pegado a la esquina superior derecha. */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
