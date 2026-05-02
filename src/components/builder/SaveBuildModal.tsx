// Modal para guardar el build actual como favorito.
// Le pide un nombre al usuario y lo guarda en favoritesStore.
// Si el usuario no está logueado, este modal no debería abrirse;
// igual ponemos una guarda por las dudas.

"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useBuildStore } from "@/store/buildStore";

type SaveBuildModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SaveBuildModal({ open, onClose }: SaveBuildModalProps) {
  const [name, setName] = useState("");
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const build = useBuildStore((s) => s.build);
  const saveBuild = useFavoritesStore((s) => s.saveBuild);

  // Cada vez que se abre, sugerimos un nombre por default basado en la
  // fecha actual. El usuario lo puede borrar y poner otro.
  useEffect(() => {
    if (open) {
      const today = new Date();
      setName(`Mi build · ${today.toLocaleDateString("es-AR")}`);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId) return;
    saveBuild(currentUserId, name, build);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Guardar build">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-white/50 mb-1.5">
            Nombre del build
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-400/60"
            placeholder="Mi PC para gaming"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
}
