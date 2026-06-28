// @vitest-environment jsdom
//
// Tests del store de tema (claro/oscuro).
//
// Es chico pero tiene dos cosas que verificar: que toggleTheme alterne el
// valor y que además refleje el cambio en el atributo data-theme del <html>,
// que es lo que usa el CSS para pintar la app. Si ese atributo no se setea,
// el toggle "funciona" en el estado pero la pantalla no cambia.

import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "./themeStore";

beforeEach(() => {
  useThemeStore.setState({ theme: "dark" });
  document.documentElement.removeAttribute("data-theme");
});

describe("toggleTheme", () => {
  it("pasa de dark a light", () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("light");
  });

  it("vuelve a dark al togglear dos veces", () => {
    useThemeStore.getState().toggleTheme();
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe("dark");
  });

  it("refleja el tema en el atributo data-theme del documento", () => {
    useThemeStore.getState().toggleTheme();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
