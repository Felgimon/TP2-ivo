// Configuración de Vitest para los tests unitarios.
//
// Apuntamos a la lógica de negocio pura del proyecto (stores y catálogo),
// que es lo que tiene sentido cubrir con tests unitarios. Los componentes
// 3D y de UI los dejamos para el E2E, porque ahí lo que importa es el
// comportamiento end-to-end y no las funciones aisladas.
//
// Por qué environment "node": la mayoría de la lógica (buildStore, catálogo)
// no necesita DOM. El único test que sí lo necesita (authStore, que usa el
// persist de zustand con localStorage) lo declara con un comentario
// `@vitest-environment jsdom` arriba de su archivo, así no cargamos jsdom
// para todo y los tests corren más rápido.

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      // Mismo alias que usa Next/TypeScript (@/* -> ./src/*), para que los
      // imports de los tests se resuelvan igual que en la app.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // No declaramos globals: importamos describe/it/expect explícitamente
    // en cada archivo. Es un poco más verboso pero deja claro de dónde sale
    // cada cosa y no ensucia el scope global.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      // Solo medimos cobertura sobre las funciones de negocio. Incluir la
      // capa 3D o los componentes acá inflaría el denominador con código
      // que no tiene sentido cubrir con unit tests y daría un número
      // engañoso.
      include: ["src/store/**", "src/data/**"],
      reporter: ["text", "html"],
      // El TP pide superar 60% en las funciones de negocio. Lo dejamos como
      // umbral real: si la cobertura baja de acá, el pipeline falla. Branches
      // va un poco más abajo a propósito, porque hay ramas de manejo de error
      // de Supabase difíciles de ejercitar sin levantar un backend real.
      thresholds: {
        statements: 60,
        functions: 60,
        lines: 60,
        branches: 50,
      },
    },
  },
});
