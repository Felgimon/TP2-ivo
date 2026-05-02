// Hook para saber si el componente ya montó en el cliente.
//
// ¿Para qué? Cuando usamos zustand con `persist` (localStorage), durante
// el render del servidor no hay localStorage, así que el estado inicial
// viene vacío. Al hidratarse en el cliente, zustand carga los datos
// guardados y el estado cambia. Si renderizamos cosas que dependen de
// ese estado en el primer render, React detecta una diferencia entre
// el HTML del servidor y el del cliente ("hydration mismatch") y rompe.
//
// Solución: en componentes que dependen de datos persistidos, esperamos
// a que `useHydrated()` devuelva true antes de renderizar el contenido
// real. Mientras tanto, devolvemos un placeholder neutro.

"use client";

import { useEffect, useState } from "react";

export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
