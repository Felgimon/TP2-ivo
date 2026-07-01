// E2E del gating de autenticación.
//
// Cubrimos dos cosas del lado de la sesión que no dependen de Supabase:
//   1. Sin sesión iniciada, el botón "Guardar" del resumen está deshabilitado
//      (no podés guardar un build si no estás logueado).
//   2. Las validaciones del formulario de registro cortan ANTES de pegarle a
//      la red, así que podemos verificar el mensaje de error sin backend.
//
// La validación de "contraseña corta" es un buen caso E2E porque recorre la
// UI real: abrir el modal, cambiar a modo registro, completar el form y leer
// el error que ve el usuario.

import { test, expect } from "@playwright/test";

test("sin sesión, el botón Guardar está deshabilitado", async ({ page }) => {
  await page.goto("/");

  // Elegimos algo para que el botón no esté deshabilitado por "build vacío",
  // y así aislamos que lo que lo bloquea es la falta de sesión.
  await page.getByTestId("option-gab-corsair-4000d").click();

  await expect(page.getByTestId("save-build")).toBeDisabled();
});

test("el registro rechaza una contraseña demasiado corta", async ({ page }) => {
  await page.goto("/");

  // Abrimos el modal de auth desde el header.
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  // Pasamos de "iniciar sesión" a "crear cuenta".
  await page.getByRole("button", { name: "¿No tenés cuenta? Crear una" }).click();

  // Usuario válido (2+ chars) pero contraseña corta (menos de 4).
  await page.getByPlaceholder("tu_usuario").fill("usuarioqa");
  await page.getByPlaceholder("••••••••").fill("12");
  await page.getByRole("button", { name: "Registrarme" }).click();

  // El mensaje de error que ve el usuario.
  await expect(
    page.getByText("La contraseña debe tener al menos 4 caracteres")
  ).toBeVisible();
});
