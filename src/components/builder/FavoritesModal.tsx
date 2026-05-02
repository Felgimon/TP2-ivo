// Modal de favoritos: muestra la lista de builds guardados del usuario
// logueado. Permite cargarlos al builder o eliminarlos.
//
// Cada entrada muestra TODA la info del build: nombre, fecha, total,
// cantidad de piezas y el detalle de cada componente con su precio.

"use client";

import { Modal } from "@/components/ui/Modal";
import { useAuthStore } from "@/store/authStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useBuildStore } from "@/store/buildStore";
import { getComponentById } from "@/data/components";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/types";
import type { Build, PCCategory } from "@/types";

type FavoritesModalProps = {
  open: boolean;
  onClose: () => void;
};

// Helper local para sumar el precio total de un build guardado.
// Ignora componentes que ya no existen en el catálogo (id roto).
function calcTotal(build: Build): number {
  return CATEGORY_ORDER.reduce((acc, cat) => {
    const comp = getComponentById(build[cat]);
    return acc + (comp?.price ?? 0);
  }, 0);
}

// Cuenta cuántas categorías tienen un componente seleccionado.
function calcFilled(build: Build): number {
  return CATEGORY_ORDER.filter((c) => build[c]).length;
}

export function FavoritesModal({ open, onClose }: FavoritesModalProps) {
  const currentUserId = useAuthStore((s) => s.currentUserId);
  const saved = useFavoritesStore((s) => s.saved);
  const deleteBuild = useFavoritesStore((s) => s.deleteBuild);
  const loadBuild = useBuildStore((s) => s.loadBuild);

  // Filtramos los favoritos del usuario actual y ordenamos del más
  // nuevo al más viejo.
  const userBuilds = currentUserId
    ? saved.filter((s) => s.userId === currentUserId).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const handleLoad = (build: Build) => {
    loadBuild(build);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Mis favoritos" size="lg">
      {userBuilds.length === 0 ? (
        // Estado vacío: cuando todavía no guardó nada.
        <div className="text-center py-10">
          <div className="text-4xl mb-3 opacity-40">★</div>
          <p className="text-white/60 text-sm">
            Todavía no guardaste ningún build.
          </p>
          <p className="text-white/40 text-xs mt-1">
            Armá uno y tocá "Guardar" para tenerlo a mano.
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {userBuilds.map((sb) => {
            const total = calcTotal(sb.build);
            const filled = calcFilled(sb.build);
            return (
              <li
                key={sb.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                {/* Encabezado: nombre + fecha + acciones */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium truncate">{sb.name}</h4>
                    <div className="text-xs text-white/40 mt-0.5">
                      {new Date(sb.createdAt).toLocaleString("es-AR")}
                      {" · "}
                      {filled} pieza{filled === 1 ? "" : "s"}
                      {" · "}
                      <span className="text-white/60 font-medium">
                        ${total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleLoad(sb.build)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-medium transition-colors cursor-pointer"
                    >
                      Cargar
                    </button>
                    <button
                      onClick={() => deleteBuild(sb.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-red-300 hover:border-red-400/40 transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Detalle de componentes guardados (toda la info). */}
                <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  {CATEGORY_ORDER.map((cat: PCCategory) => {
                    const comp = getComponentById(sb.build[cat]);
                    return (
                      <li
                        key={cat}
                        className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-black/20"
                      >
                        <span className="text-white/40 w-20 shrink-0">
                          {CATEGORY_LABELS[cat]}
                        </span>
                        <span
                          className={`flex-1 truncate ${
                            comp ? "text-white/90" : "text-white/30 italic"
                          }`}
                        >
                          {comp?.name ?? "—"}
                        </span>
                        {comp && (
                          <span className="text-white/50">${comp.price}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
