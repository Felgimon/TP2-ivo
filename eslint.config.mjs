import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Reporte HTML que genera Playwright/Vitest: no es código nuestro.
    "playwright-report/**",
    "coverage/**",
  ]),
  {
    // Dos reglas nuevas del React Compiler (eslint-config-next 16) marcan
    // patrones que en este proyecto son intencionales y correctos. Las
    // dejamos en "warn" en vez de "error" para que el pipeline no se frene
    // por falsos positivos, pero las seguimos viendo en la salida del lint.
    // El detalle de por qué cada una es un falso positivo acá está explicado
    // en CALIDAD.md (sección de pipeline / decisiones de calidad).
    rules: {
      // Disparada por el idiom de guard de hidratación (setMounted(true) /
      // setHydrated(true) dentro de un useEffect vacío). Es el patrón
      // recomendado para evitar mismatch de SSR con estado persistido.
      "react-hooks/set-state-in-effect": "warn",
      // Disparada en PCScene por elegir dinámicamente el componente de modelo
      // 3D según el build del usuario. Es a propósito: el modelo a renderizar
      // depende del estado, no es un componente estático.
      "react-hooks/static-components": "warn",
    },
  },
]);

export default eslintConfig;
