// Setup global de los tests.
//
// El store de auth y el de favoritos usan el middleware persist de zustand,
// que escribe en localStorage. En el entorno de tests (jsdom de Vitest 4)
// localStorage no viene disponible, así que lo polyfilleamos con una
// implementación en memoria. Sin esto, cualquier setState del store de auth
// explota con "Cannot read properties of undefined (reading 'setItem')".
//
// Es a propósito una versión mínima: solo lo que persist necesita
// (getItem, setItem, removeItem). No simula cuotas ni eventos de storage.

import { vi } from "vitest";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

vi.stubGlobal("localStorage", new MemoryStorage());
