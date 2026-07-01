// ATENCION: este test FALLA a proposito. No se mergea.
//
// Sirve para demostrar que el pipeline de CI corta cuando un test falla:
// al abrir el PR de esta rama, el job de calidad queda en rojo en el paso
// de tests unitarios y el deploy no ocurre. Es la demostración que pide el
// anexo del TP ("el pipeline corre y falla correctamente si un test falla").

import { describe, it, expect } from "vitest";
import { useBuildStore } from "./buildStore";

describe("demostración de fallo de CI (no mergear)", () => {
  it("falla a propósito para que el pipeline quede en rojo", () => {
    // El total de un build vacío es 0. Afirmamos 999 a propósito para
    // forzar el fallo y ver cómo reacciona el pipeline.
    expect(useBuildStore.getState().getTotalPrice()).toBe(999);
  });
});
