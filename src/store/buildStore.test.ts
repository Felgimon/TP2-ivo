// Tests del store del builder.
//
// Lo más importante acá es getTotalPrice: es el número que el usuario ve
// grande en el panel de la derecha y el que decide si "Guardar" se habilita.
// Un error de suma o un id roto que no se ignore romperían esa cifra, así
// que cubrimos varios casos: vacío, una pieza, varias, e id inexistente.
//
// El store es un singleton de zustand, por eso reseteamos el estado antes
// de cada test con setState; si no, un test arrastraría el build del anterior.

import { describe, it, expect, beforeEach } from "vitest";
import { useBuildStore } from "./buildStore";
import { getComponentById } from "@/data/components";

// Atajos para leer estado y acciones sin tener que escribir getState() cada vez.
const get = () => useBuildStore.getState();

beforeEach(() => {
  // Volvemos al build vacío antes de cada caso.
  useBuildStore.setState({ build: {} });
});

describe("getTotalPrice", () => {
  it("devuelve 0 cuando no hay nada seleccionado", () => {
    expect(get().getTotalPrice()).toBe(0);
  });

  it("suma el precio de un único componente elegido", () => {
    get().selectComponent("cpu", "cpu-r5-7600");
    const expected = getComponentById("cpu-r5-7600")!.price;
    expect(get().getTotalPrice()).toBe(expected);
  });

  it("suma los precios de varios componentes de distintas categorías", () => {
    get().selectComponent("cpu", "cpu-r5-7600");
    get().selectComponent("gpu", "gpu-rtx-3090");
    get().selectComponent("ram", "ram-tforce-ddr5");

    const expected =
      getComponentById("cpu-r5-7600")!.price +
      getComponentById("gpu-rtx-3090")!.price +
      getComponentById("ram-tforce-ddr5")!.price;

    expect(get().getTotalPrice()).toBe(expected);
  });

  it("ignora ids que no existen en el catálogo en vez de romperse", () => {
    // Simula un favorito guardado con un id que después se sacó del catálogo.
    // El total no debería explotar ni sumar NaN: simplemente lo ignora.
    useBuildStore.setState({
      build: { cpu: "cpu-r5-7600", gpu: "id-fantasma" },
    });
    const expected = getComponentById("cpu-r5-7600")!.price;
    expect(get().getTotalPrice()).toBe(expected);
  });
});

describe("selectComponent", () => {
  it("selecciona un componente en su categoría", () => {
    get().selectComponent("gpu", "gpu-gtx-1660");
    expect(get().build.gpu).toBe("gpu-gtx-1660");
  });

  it("des-selecciona la categoría cuando se pasa undefined", () => {
    get().selectComponent("gpu", "gpu-gtx-1660");
    get().selectComponent("gpu", undefined);
    expect(get().build.gpu).toBeUndefined();
  });

  it("cambiar un componente no afecta a las otras categorías", () => {
    get().selectComponent("cpu", "cpu-i5-13600k");
    get().selectComponent("gpu", "gpu-gtx-1660");
    get().selectComponent("cpu", "cpu-i9-14900k");
    expect(get().build.cpu).toBe("cpu-i9-14900k");
    expect(get().build.gpu).toBe("gpu-gtx-1660");
  });
});

describe("setActiveCategory", () => {
  it("cambia la pestaña activa de la UI", () => {
    get().setActiveCategory("gpu");
    expect(get().activeCategory).toBe("gpu");
  });
});

describe("resetBuild", () => {
  it("deja el build vacío", () => {
    get().selectComponent("cpu", "cpu-i5-13600k");
    get().resetBuild();
    expect(get().build).toEqual({});
    expect(get().getTotalPrice()).toBe(0);
  });
});

describe("loadBuild", () => {
  it("carga un build guardado y lo hace con una copia (no referencia)", () => {
    // loadBuild tiene que copiar el objeto: si guardara la referencia, editar
    // el build después de cargar un favorito modificaría el favorito original.
    const favorito = { cpu: "cpu-r7-5800x", gpu: "gpu-rtx-2080-fe" };
    get().loadBuild(favorito);

    // El estado quedó con el contenido del favorito...
    expect(get().build).toEqual(favorito);
    // ...pero no es el MISMO objeto.
    expect(get().build).not.toBe(favorito);

    // Y al editar el build, el objeto original del favorito no se toca.
    get().selectComponent("cpu", "cpu-i9-14900k");
    expect(favorito.cpu).toBe("cpu-r7-5800x");
  });
});
