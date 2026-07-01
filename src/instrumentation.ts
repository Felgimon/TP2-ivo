// Inicialización de Sentry del lado del servidor (Node y Edge).
//
// Next.js llama a register() una vez al arrancar el servidor. Igual que en
// el cliente, solo inicializamos Sentry si hay DSN; sin DSN no hace nada.
//
// onRequestError es el hook oficial de App Router para reportar a Sentry los
// errores que ocurren al manejar un request en el servidor. Si Sentry no se
// inicializó (sin DSN), es un no-op seguro.

import * as Sentry from "@sentry/nextjs";

export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
