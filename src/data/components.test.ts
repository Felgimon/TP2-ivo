// Tests del catálogo de componentes.
//
// El catálogo es la fuente de verdad de toda la app: el builder, el resumen
// y los favoritos hacen lookup acá para traer nombre y precio. Si estos
// helpers se rompen, se rompe todo lo demás en silencio (un favorito viejo
// con un id que ya no existe, por ejemplo). Por eso los testeamos.

import { describe, it, expect } from "vitest";
import {
  COMPONENTS,
  getComponentById,
  getComponentsByCategory,
} from "./components";
import { CATEGORY_ORDER } from "@/types";

describe("getComponentById", () => {
  it("devuelve el componente cuando el id existe", () => {
    const comp = getComponentById("cpu-r7-7800x3d");
    expect(comp).toBeDefined();
    expect(comp?.name).toBe("AMD Ryzen 7 7800X3D");
    expect(comp?.category).toBe("cpu");
  });

  it("devuelve undefined cuando el id no existe (id roto de una persistencia vieja)", () => {
    expect(getComponentById("no-existe-este-id")).toBeUndefined();
  });

  it("devuelve undefined cuando el id es undefined", () => {
    // Caso real: una categoría del build que el usuario todavía no eligió
    // tiene su id en undefined, y el resumen igual llama a este helper.
    expect(getComponentById(undefined)).toBeUndefined();
  });
});

describe("getComponentsByCategory", () => {
  it("devuelve solo componentes de la categoría pedida", () => {
    const gpus = getComponentsByCategory("gpu");
    expect(gpus.length).toBeGreaterThan(0);
    expect(gpus.every((c) => c.category === "gpu")).toBe(true);
  });

  it("cada categoría del builder tiene al menos un componente disponible", () => {
    // Si una categoría quedara vacía, la pestaña correspondiente se vería
    // sin opciones y el usuario no podría completar el build. Este test lo
    // detecta antes de que llegue a producción.
    for (const category of CATEGORY_ORDER) {
      expect(getComponentsByCategory(category).length).toBeGreaterThan(0);
    }
  });
});

describe("integridad del catálogo", () => {
  it("no hay ids duplicados", () => {
    // Un id duplicado haría que getComponentById devuelva siempre el primero
    // y el segundo componente sería inalcanzable. Mejor saberlo con un test.
    const ids = COMPONENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("todos los precios son positivos", () => {
    expect(COMPONENTS.every((c) => c.price > 0)).toBe(true);
  });
});
