// Cliente de Supabase compartido por toda la app.
//
// Diseño defensivo: NO lanzamos error al cargar el módulo si faltan
// las env vars. Si lo hiciéramos, el build de Next.js (que pre-renderiza
// la home como página estática) se cae al evaluar este módulo, porque
// los stores de auth/favoritos lo importan a nivel top-level.
//
// En su lugar, si faltan las variables:
//   - Creamos un cliente "placeholder" apuntando a una URL falsa.
//   - El build pasa OK (la home no llama a la BD durante el prerender).
//   - En el cliente, si alguien intenta loguearse o guardar un build,
//     Supabase devuelve un error de red que las funciones async ya
//     manejan con try/catch (ver authStore.ts / favoritesStore.ts).
//   - Logueamos un warning UNA VEZ en consola del browser para que
//     el dev se dé cuenta de que faltan las env vars.
//
// Para que las features de auth/favoritos funcionen DE VERDAD hay que
// setear `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
//   - Local: archivo `.env.local` en la raíz del proyecto.
//   - Vercel: Settings → Environment Variables (Production, Preview,
//     Development).
//   El prefijo `NEXT_PUBLIC_` hace que Next.js las exponga al bundle
//   del cliente; sin ese prefijo, solo existen en el servidor.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasCredentials = Boolean(supabaseUrl && supabaseKey);

// Aviso UNA vez en consola del browser si faltan las credenciales.
// En server-side (durante el build/prerender) no logueamos, para no
// ensuciar los logs de Vercel — el build no necesita Supabase.
if (!hasCredentials && typeof window !== "undefined") {
  console.warn(
    "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Las features de login y favoritos no van a funcionar hasta que las configures. " +
      "Ver README o el comentario de src/supabase.ts."
  );
}

// Si hay credenciales, cliente real. Si no, cliente placeholder
// (cualquier llamada va a fallar al intentar conectar — pero el
// módulo se carga sin tirar y el build pasa).
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseKey ?? "placeholder-anon-key"
);

// Flag útil para que la UI pueda detectar el estado de configuración
// (por ej. mostrar un cartel "configura Supabase para guardar builds"
// en lugar de un error genérico de red). Por ahora no lo usamos en
// la UI, pero queda disponible.
export const isSupabaseConfigured = hasCredentials;
