// Error boundary local de la escena 3D.
//
// ¿Para qué? Si un .glb que el usuario subió está corrupto, mal
// nombrado, o tira un error al parsearse, sin esto el error explota
// y se rompe TODA la escena (incluyendo los componentes que sí cargaron
// bien). Con esta boundary, si un slot falla:
//   - Se muestra el `fallback` (por default nada) en ese slot.
//   - El error queda logueado en consola para debug.
//   - El resto de la escena sigue andando.
//
// React no tiene una API funcional para boundaries, así que tiene que
// ser una clase. Es la única clase del proyecto.

"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  // Etiqueta opcional para que el log diga qué slot falló.
  label?: string;
};

type State = {
  hasError: boolean;
};

export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logueamos en consola con la etiqueta para que sea fácil ubicar
    // qué modelo está rompiendo.
    const where = this.props.label ? ` [${this.props.label}]` : "";
    console.error(`[Scene]${where} error renderizando modelo:`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
