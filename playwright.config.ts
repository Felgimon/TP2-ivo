// Configuración de Playwright para los tests E2E.
//
// Estrategia del servidor: corremos los tests contra el build de producción
// (next start), no contra el dev server, porque queremos validar lo más
// parecido posible a lo que ve el usuario en Vercel.
//
//   - En CI el build ya lo hizo el paso anterior del pipeline, así que acá
//     solo levantamos "npm run start" (no rebuildeamos al pedo).
//   - En local hacemos "build && start" para que el comando funcione de una
//     sin tener que acordarte de buildear antes; y si ya tenés un server
//     levantado, lo reusa.
//
// Solo Chromium: alcanza para cubrir el flujo principal y mantiene el CI
// rápido. Si más adelante hace falta, se agregan Firefox/WebKit.

import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Un poco más de tiempo por test: la home monta una escena 3D pesada y
  // en CI las máquinas son más lentas.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // En CI fallamos si alguien se olvidó un test.only.
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run build && npm run start",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    // El build con los modelos 3D y el React Compiler puede tardar, le damos
    // margen para no cortar antes de tiempo.
    timeout: 240_000,
  },
});
