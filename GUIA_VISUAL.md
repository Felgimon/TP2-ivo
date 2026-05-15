# Guía Visual Rápida - Integración Supabase

## Antes vs Después

### ANTES ❌
```
┌─────────────────────┐
│  Tu PC Builder      │
└─────────────────────┘
        ↓
┌─────────────────────┐
│  localStorage       │
│  (Solo este nav)    │
└─────────────────────┘

Problema: 
- Recargás → datos se pierden
- Otro dispositivo → no ve nada
```

### DESPUÉS ✅
```
┌─────────────────────┐
│  Tu PC Builder      │
└─────────────────────┘
        ↓
┌─────────────────────┐       ┌────────────────────┐
│  localStorage       │◄─────►│  Supabase Cloud    │
│  (Cache local)      │       │  (Fuente de Verdad)│
└─────────────────────┘       └────────────────────┘

Beneficios:
✓ Recargás → datos persisten
✓ Otro dispositivo → ves todo
✓ Compartir cuenta → sincronizado
```

## Flujo Paso a Paso

### 1️⃣ REGISTRARSE

```
[Navegador]
    │
    ├─ Usuario ingresa username + password
    │
    └─► register()
         ├─ Valida (cliente)
         ├─ Envía a Supabase
         └─ Supabase inserta en tabla 'users'
              │
              └─► Retorna id + timestamp
                   │
                   └─► Se guarda en Zustand
                       │
                       └─► localStorage se auto-sincroniza

Resultado: Usuario registrado y logueado ✅
```

### 2️⃣ GUARDAR BUILD

```
[Navegador]
    │
    ├─ Usuario hace clic "Guardar"
    │
    └─► saveBuild(userId, name, build)
         ├─ Envía a Supabase
         └─ Supabase inserta en tabla 'saved_builds'
              │
              └─► Retorna build creado
                   │
                   └─► Se guarda en Zustand
                       │
                       └─► localStorage se auto-sincroniza

Resultado: Build guardado en la nube ✅
```

### 3️⃣ RECARGAR PÁGINA

```
[Navegador]
    │
    ├─ Usuario presiona F5
    │
    ├─► App se recarga
    │
    ├─► Zustand intenta cargar del localStorage
    │   (lo que se guardó antes)
    │
    └─► useSupabaseSync() se activa
         ├─ Obtiene currentUserId
         ├─ Descarga builds de Supabase
         └─ Actualiza Zustand

Resultado: Todos los builds aparecen ✅
```

### 4️⃣ LOGOUT + NUEVO LOGIN

```
[Navegador]
    │
    ├─ Usuario hace logout
    │
    └─► currentUserId = null
         │
         ├─ Todos los builds desaparecen (esperado)
         │
         └─ localStorage se limpia


[Navegador]
    │
    ├─ Usuario hace login con OTRA cuenta
    │
    └─► useSupabaseSync() se dispara
         ├─ Descarga builds de OTRO usuario
         └─ Se muestran en Favoritos

Resultado: Cada usuario ve solo SUS builds ✅
```

## Las Tablas en Supabase

```
DATABASE: postgres (en ihxtwbvuwvwmffckyzaj.supabase.co)

┌──────────────────────────────────────┐
│         Tabla: users                 │
├──────────────────────────────────────┤
│ id (UUID)         | 550e8400-...     │
│ username (TEXT)   | juan             │
│ password (TEXT)   | pass123          │
│ created_at (TS)   | 2025-05-15 10:30 │
├──────────────────────────────────────┤
│ id (UUID)         | 550e8400-...     │
│ username (TEXT)   | maria            │
│ password (TEXT)   | password456      │
│ created_at (TS)   | 2025-05-15 10:35 │
└──────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│         Tabla: saved_builds                                  │
├──────────────────────────────────────────────────────────────┤
│ id (UUID)    | 550e8400-...                                  │
│ user_id      | 550e8400-... [→ juan]                        │
│ name (TEXT)  | Mi PC Gaming                                 │
│ build (JSON) | {"cpu": "i9-13900k", "ram": "32GB", ...}    │
│ created_at   | 2025-05-15 10:45                            │
├──────────────────────────────────────────────────────────────┤
│ id (UUID)    | 550e8400-...                                  │
│ user_id      | 550e8400-... [→ juan]                        │
│ name (TEXT)  | PC Ofimática                                 │
│ build (JSON) | {"cpu": "i5-13600k", "ram": "16GB", ...}    │
│ created_at   | 2025-05-15 10:50                            │
└──────────────────────────────────────────────────────────────┘
```

## Interacciones: Cliente ↔ Supabase

```
DESDE CLIENTE:

POST /rest/v1/users
├─ Body: { username: "juan", password: "pass123" }
└─ Retorna: { id, username, created_at }

GET /rest/v1/users?username=eq.juan
├─ Query: Buscar usuario por username
└─ Retorna: [{ id, username, password, created_at }]

POST /rest/v1/saved_builds
├─ Body: { user_id, name, build }
└─ Retorna: { id, user_id, name, build, created_at }

GET /rest/v1/saved_builds?user_id=eq.550e8400-...
├─ Query: Obtener todos los builds de un usuario
└─ Retorna: [{ id, user_id, name, build, created_at }, ...]

DELETE /rest/v1/saved_builds?id=eq.550e8400-...
├─ Elimina un build específico
└─ Retorna: (200 OK)
```

## Estado Local vs Supabase

```
┌─────────────────────────────────────────────────────────────┐
│  NAVEGADOR - Zustand Store                                  │
│  ┌─────────────────────────────────────────────────────────┐
│  │ useAuthStore                                            │
│  │ ├─ users: []       ← Todos los usuarios                 │
│  │ ├─ currentUserId   ← ID del usuario logueado            │
│  │ └─ isLoading       ← Está esperando respuesta?          │
│  │                                                         │
│  │ useFavoritesStore                                       │
│  │ ├─ saved: []       ← Todos los builds guardados        │
│  │ └─ isLoading       ← Está esperando respuesta?          │
│  └─────────────────────────────────────────────────────────┘
│         ↕ (se sincroniza)
│  ┌─────────────────────────────────────────────────────────┐
│  │  localStorage (Browser)                                 │
│  │  ├─ "tp2-ivo-auth-v2"      ← Cache del auth            │
│  │  └─ "tp2-ivo-favorites-v2"  ← Cache de favoritos       │
│  └─────────────────────────────────────────────────────────┘
│         ↕ (se sincroniza)
│  ┌─────────────────────────────────────────────────────────┐
│  │  Supabase Cloud (Fuente de Verdad)                      │
│  │  ├─ Table: users                                        │
│  │  └─ Table: saved_builds                                 │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

## Variables de Entorno (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=
  https://ihxtwbvuwvwmffckyzaj.supabase.co
  ↑ URL de tu proyecto Supabase

NEXT_PUBLIC_SUPABASE_ANON_KEY=
  eyJhbGciOiJIUzI1NiIs...
  ↑ Clave pública para requests del cliente

POSTGRES_URL=
  postgres://user:pass@host/db
  ↑ Para conexiones de backend (futuro)
```

## Flujo de Compilación

```
npm install
    ↓
[Instala dependencias]
    ├─ @supabase/supabase-js
    └─ bcryptjs

npm run dev
    ↓
[Next.js dev server inicia]
    ├─ Lee .env.local
    ├─ Inicializa cliente de Supabase
    └─ Abre http://localhost:3000

Browser abre app
    ↓
[Componentes React montan]
    ├─ useAuthStore hydrata del localStorage
    ├─ useFavoritesStore hydrata del localStorage
    ├─ useSupabaseSync corre y sincroniza
    └─ UI se renderiza

¡Listo! ✅
```

## Resumido en 3 Líneas

1. **Guardas algo** → Se guarda en Supabase
2. **Recargás página** → Se descarga de Supabase
3. **Cambias de cuenta** → Ve builds de OTRA persona

---

**Eso es todo lo que necesitás saber para empezar!** 🚀
