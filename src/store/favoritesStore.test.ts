// @vitest-environment jsdom
//
// Tests del store de favoritos.
//
// getByUser es lógica pura (filtra los builds del usuario y los ordena del
// más nuevo al más viejo) y es lo que alimenta el modal de favoritos, así
// que lo cubrimos con varios casos. saveBuild y deleteBuild pegan a Supabase,
// así que mockeamos el cliente con un builder encadenable que además es
// "thenable": se puede await directamente (para delete) o terminar con
// .single() (para insert), imitando cómo responde supabase-js.

import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockResponses } = vi.hoisted(() => ({
  mockResponses: {
    single: { data: null as unknown, error: null as unknown },
    terminal: { data: null as unknown, error: null as unknown },
  },
}));

vi.mock("@/supabase", () => {
  const makeBuilder = () => {
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "insert", "delete", "order"]) {
      builder[m] = vi.fn(() => builder);
    }
    builder.single = vi.fn(() => Promise.resolve(mockResponses.single));
    // thenable: await sobre el builder resuelve el resultado "terminal".
    builder.then = (onF: (v: unknown) => unknown, onR: (e: unknown) => unknown) =>
      Promise.resolve(mockResponses.terminal).then(onF, onR);
    return builder;
  };
  return {
    supabase: { from: vi.fn(() => makeBuilder()) },
    isSupabaseConfigured: false,
  };
});

import { useFavoritesStore, type SavedBuild } from "./favoritesStore";

const get = () => useFavoritesStore.getState();

beforeEach(() => {
  useFavoritesStore.setState({ saved: [], isLoading: false });
  mockResponses.single = { data: null, error: null };
  mockResponses.terminal = { data: null, error: null };
});

describe("getByUser", () => {
  it("devuelve solo los builds del usuario pedido", () => {
    const saved: SavedBuild[] = [
      { id: "1", userId: "u1", name: "A", build: {}, createdAt: 100 },
      { id: "2", userId: "u2", name: "B", build: {}, createdAt: 200 },
      { id: "3", userId: "u1", name: "C", build: {}, createdAt: 300 },
    ];
    useFavoritesStore.setState({ saved });
    const result = get().getByUser("u1");
    expect(result.map((b) => b.id)).toEqual(["3", "1"]);
  });

  it("ordena del más nuevo al más viejo", () => {
    const saved: SavedBuild[] = [
      { id: "viejo", userId: "u1", name: "viejo", build: {}, createdAt: 1 },
      { id: "nuevo", userId: "u1", name: "nuevo", build: {}, createdAt: 999 },
    ];
    useFavoritesStore.setState({ saved });
    expect(get().getByUser("u1")[0].id).toBe("nuevo");
  });

  it("devuelve vacío si el usuario no tiene builds", () => {
    expect(get().getByUser("desconocido")).toEqual([]);
  });
});

describe("saveBuild", () => {
  it("guarda el build y lo agrega al estado cuando Supabase responde ok", async () => {
    mockResponses.single = {
      data: {
        id: "saved-1",
        user_id: "u1",
        name: "Mi build",
        build: { cpu: "cpu-r5-7600" },
        created_at: new Date().toISOString(),
      },
      error: null,
    };

    const result = await get().saveBuild("u1", "Mi build", { cpu: "cpu-r5-7600" });
    expect(result).not.toBeNull();
    expect(result?.id).toBe("saved-1");
    expect(get().saved.some((b) => b.id === "saved-1")).toBe(true);
  });

  it("devuelve null si Supabase falla", async () => {
    mockResponses.single = { data: null, error: { message: "boom" } };
    const result = await get().saveBuild("u1", "Falla", {});
    expect(result).toBeNull();
  });
});

describe("deleteBuild", () => {
  it("saca el build del estado cuando el borrado es exitoso", async () => {
    useFavoritesStore.setState({
      saved: [{ id: "x", userId: "u1", name: "x", build: {}, createdAt: 1 }],
    });
    mockResponses.terminal = { data: null, error: null };

    const ok = await get().deleteBuild("x");
    expect(ok).toBe(true);
    expect(get().saved.find((b) => b.id === "x")).toBeUndefined();
  });

  it("no toca el estado si Supabase devuelve error", async () => {
    useFavoritesStore.setState({
      saved: [{ id: "x", userId: "u1", name: "x", build: {}, createdAt: 1 }],
    });
    mockResponses.terminal = { data: null, error: { message: "no se pudo" } };

    const ok = await get().deleteBuild("x");
    expect(ok).toBe(false);
    expect(get().saved.find((b) => b.id === "x")).toBeDefined();
  });
});
