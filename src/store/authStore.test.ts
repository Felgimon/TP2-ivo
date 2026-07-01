// @vitest-environment jsdom
//
// Tests del store de autenticación.
//
// Acá está la lógica más delicada de la app desde el punto de vista del
// usuario: si el registro o el login se comportan mal, el usuario no entra
// o entra cuando no debería. Cubrimos las validaciones (que cortan antes de
// tocar la red) y los caminos que sí pegan a Supabase, mockeando el cliente.
//
// Usamos jsdom (no node) porque authStore usa el middleware persist de
// zustand, que necesita localStorage. En node puro tiraría warnings.
//
// El mock de Supabase está hecho con vi.hoisted para poder cambiar la
// respuesta desde cada test: maybeSingle y single leen de mockResponses,
// que vamos seteando según el caso (usuario existente, no encontrado, etc.).

import { describe, it, expect, beforeEach, vi } from "vitest";

const { mockResponses } = vi.hoisted(() => ({
  mockResponses: {
    maybeSingle: { data: null as unknown, error: null as unknown },
    single: { data: null as unknown, error: null as unknown },
  },
}));

vi.mock("@/supabase", () => {
  // Builder encadenable que imita la API de supabase-js: cada método
  // intermedio (from, select, eq, insert, order) devuelve el mismo builder,
  // y los terminales (maybeSingle, single) resuelven con lo que tenga
  // mockResponses en ese momento.
  const makeBuilder = () => {
    const builder: Record<string, unknown> = {};
    for (const m of ["select", "eq", "insert", "order"]) {
      builder[m] = vi.fn(() => builder);
    }
    builder.maybeSingle = vi.fn(() => Promise.resolve(mockResponses.maybeSingle));
    builder.single = vi.fn(() => Promise.resolve(mockResponses.single));
    return builder;
  };
  return {
    supabase: { from: vi.fn(() => makeBuilder()) },
    isSupabaseConfigured: false,
  };
});

// Import después del mock para que tome el cliente mockeado.
import { useAuthStore } from "./authStore";

const get = () => useAuthStore.getState();

beforeEach(() => {
  // Estado limpio y respuestas neutras antes de cada test.
  useAuthStore.setState({ users: [], currentUserId: null, isLoading: false });
  mockResponses.maybeSingle = { data: null, error: null };
  mockResponses.single = { data: null, error: null };
});

describe("register (validaciones que cortan antes de la red)", () => {
  it("rechaza un usuario de menos de 2 caracteres", async () => {
    const res = await get().register("a", "clave1234");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/al menos 2 caracteres/i);
  });

  it("rechaza una contraseña de menos de 4 caracteres", async () => {
    const res = await get().register("usuario", "123");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/al menos 4 caracteres/i);
  });
});

describe("register (caminos contra Supabase)", () => {
  it("rechaza el registro si el nombre de usuario ya existe", async () => {
    // maybeSingle devuelve una fila => el usuario ya está tomado.
    mockResponses.maybeSingle = { data: { id: "abc" }, error: null };
    const res = await get().register("repetido", "clave1234");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/ya está en uso/i);
  });

  it("registra al usuario y lo deja logueado cuando todo sale bien", async () => {
    // No existe todavía (maybeSingle null) y el insert devuelve la fila creada.
    mockResponses.maybeSingle = { data: null, error: null };
    mockResponses.single = {
      data: {
        id: "user-1",
        username: "nuevo",
        created_at: new Date().toISOString(),
      },
      error: null,
    };

    const res = await get().register("nuevo", "clave1234");
    expect(res.ok).toBe(true);
    expect(get().currentUserId).toBe("user-1");
    expect(get().users.some((u) => u.id === "user-1")).toBe(true);
  });
});

describe("login", () => {
  it("falla si el usuario no existe", async () => {
    mockResponses.maybeSingle = { data: null, error: null };
    const res = await get().login("fantasma", "clave1234");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/no encontrado/i);
  });

  it("falla si la contraseña no coincide", async () => {
    mockResponses.maybeSingle = {
      data: {
        id: "user-2",
        username: "lola",
        password: "abcd",
        created_at: new Date().toISOString(),
      },
      error: null,
    };
    // Misma longitud que la guardada para caer en el mensaje genérico.
    const res = await get().login("lola", "abce");
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/contraseña incorrecta/i);
  });

  it("loguea al usuario cuando las credenciales son correctas", async () => {
    mockResponses.maybeSingle = {
      data: {
        id: "user-3",
        username: "felipe",
        password: "secreta",
        created_at: new Date().toISOString(),
      },
      error: null,
    };
    const res = await get().login("felipe", "secreta");
    expect(res.ok).toBe(true);
    expect(get().currentUserId).toBe("user-3");
    // El login también agrega al usuario al array local si no estaba
    // (caso browser nuevo / incógnito con localStorage vacío).
    expect(get().getCurrentUser()?.username).toBe("felipe");
  });
});

describe("logout", () => {
  it("limpia el usuario actual", async () => {
    useAuthStore.setState({ currentUserId: "user-3" });
    const res = await get().logout();
    expect(res.ok).toBe(true);
    expect(get().currentUserId).toBeNull();
  });
});
