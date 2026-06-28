// Inicialización de Sentry del lado del cliente (browser).
//
// Next.js carga este archivo automáticamente en el bundle del cliente.
// Solo arrancamos Sentry si hay DSN configurado (NEXT_PUBLIC_SENTRY_DSN).
// Si no hay DSN, esto no hace nada: la app funciona igual y el build no se
// ve afectado. Por eso el monitoreo de errores es opt-in y no intrusivo.
//
// El DSN se setea como variable de entorno en Vercel (y en .env.local para
// probar en local). Tiene que llevar el prefijo NEXT_PUBLIC_ para que llegue
// al cliente.

import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Muestreo de performance al 10%: suficiente para tener señal sin
    // mandar un evento por cada interacción.
    tracesSampleRate: 0.1,
    // No mandamos PII por default; este proyecto no maneja datos sensibles.
    sendDefaultPii: false,
  });

  // Helper para disparar un error de prueba a mano y verificar que Sentry
  // lo captura. Para usarlo, abrir la consola del navegador en la app
  // deployada y ejecutar: window.__sentryTest()
  // Lo dejamos solo si hay DSN, así no ensucia nada cuando Sentry está off.
  (window as unknown as { __sentryTest?: () => string }).__sentryTest = () => {
    const id = Sentry.captureException(
      new Error("Error de prueba TP3 (verificación de Sentry)")
    );
    return id;
  };
}
