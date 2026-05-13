// Modal genérico reutilizable.
// Lo usan AuthModal, SaveBuildModal y FavoritesModal.
//
// Comportamiento:
//   - Renderiza en un PORTAL a document.body. Si no lo hiciéramos,
//     el modal queda atrapado dentro del stacking context del header
//     (que tiene su propio z-10) y los paneles laterales (también
//     z-10 pero hermanos posteriores en el DOM) lo tapan visualmente.
//     Con createPortal sube al body y su z-50 manda sobre todo.
//   - Backdrop oscuro semi-transparente que cierra al click.
//   - Animación de entrada/salida con framer-motion.
//   - Tecla Escape también cierra (accesibilidad).
//   - Colores que respetan el tema (claro/oscuro) via CSS variables.

"use client";

import { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  // Escape cierra el modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // createPortal solo funciona en cliente (no hay `document` en SSR).
  // Esperamos al primer render del cliente con un flag local.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const node = (
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
            className={`relative w-full ${SIZE_CLASSES[size]} rounded-2xl shadow-2xl overflow-hidden`}
            style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--panel-border)",
              color: "var(--text)",
            }}
          >
            {title && (
              <div
                className="px-6 pt-6 pb-3"
                style={{ borderBottom: "1px solid var(--panel-border)" }}
              >
                <h3 className="text-lg font-semibold text-fg">{title}</h3>
              </div>
            )}
            <div className="p-6">{children}</div>
            {/* Botón cerrar (X) */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-fg/40 hover:text-fg hover:bg-fg/10 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              ×
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(node, document.body);
}
