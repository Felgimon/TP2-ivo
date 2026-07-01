// E2E del flujo principal: armar una PC.
//
// Es EL caso de uso de la app. Un usuario entra, elige componentes y ve el
// total actualizarse. Este test no necesita backend (Supabase): todo el
// armado vive en el estado local, así que corre estable en CI sin depender
// de credenciales ni de red.
//
// Validamos tres cosas que, si se rompen, rompen el producto:
//   1. Elegir un componente lo muestra en el resumen "Tu build".
//   2. El total refleja el precio del componente elegido.
//   3. Al sumar un segundo componente, el total se recalcula bien.

import { test, expect } from "@playwright/test";

test("el usuario arma una PC y el total refleja la suma de los componentes", async ({
  page,
}) => {
  await page.goto("/");

  // La categoría por defecto es Gabinete. Elegimos el Corsair 4000D ($105).
  await page.getByTestId("option-gab-corsair-4000d").click();

  const total = page.getByTestId("build-total");
  const summary = page.getByTestId("build-summary");

  // El gabinete elegido aparece en el resumen y el total es su precio.
  await expect(summary).toContainText("Corsair 4000D Airflow");
  await expect(total).toHaveText("$105");

  // Cambiamos a la pestaña Procesador y elegimos el Ryzen 5 7600 ($220).
  await page.getByRole("button", { name: "Procesador", exact: true }).click();
  await page.getByTestId("option-cpu-r5-7600").click();

  // El total ahora es la suma de los dos: 105 + 220 = 325.
  await expect(summary).toContainText("AMD Ryzen 5 7600");
  await expect(total).toHaveText("$325");
});

test("des-seleccionar un componente lo descuenta del total", async ({ page }) => {
  await page.goto("/");

  const total = page.getByTestId("build-total");

  await page.getByTestId("option-gab-corsair-4000d").click();
  await expect(total).toHaveText("$105");

  // Click de nuevo en el mismo componente: lo des-selecciona y vuelve a $0.
  await page.getByTestId("option-gab-corsair-4000d").click();
  await expect(total).toHaveText("$0");
});
