# Estructura de Archivos - Integración Supabase

```
TP2-ivo/
│
├── .env.local ⭐ NUEVO
│   └── Credenciales de Supabase (NO commitear a Git)
│
├── INTEGRACION_SUPABASE.md ⭐ NUEVO
│   └── Resumen completo de cambios e instrucciones
│
├── SUPABASE_SETUP.md ⭐ NUEVO
│   └── Guía detallada de configuración
│
├── package.json ✏️ MODIFICADO
│   └── Agregadas dependencias:
│       - @supabase/supabase-js@^2.38.0
│       - bcryptjs@^2.4.3
│
├── scripts/
│   └── create-supabase-tables.sql ⭐ NUEVO
│       └── Script SQL para crear tablas en Supabase
│
└── src/
    ├── supabase.ts ⭐ NUEVO
    │   └── Cliente de Supabase inicializado
    │
    ├── app/
    │   └── page.tsx ✏️ MODIFICADO
    │       └── Agregado useSupabaseSync()
    │
    ├── store/
    │   ├── authStore.ts ✏️ MODIFICADO
    │   │   ├── register() → async
    │   │   ├── login() → async
    │   │   ├── logout() → async
    │   │   ├── syncUsers() → nuevo método
    │   │   └── Conecta con tabla users
    │   │
    │   └── favoritesStore.ts ✏️ MODIFICADO
    │       ├── saveBuild() → async
    │       ├── deleteBuild() → async
    │       ├── syncUserBuilds() → nuevo método
    │       └── Conecta con tabla saved_builds
    │
    ├── hooks/
    │   └── useSupabaseSync.ts ⭐ NUEVO
    │       └── Sincroniza builds cuando usuario inicia sesión
    │
    └── components/
        └── auth/
            └── AuthModal.tsx ✏️ MODIFICADO
               └── Maneja promesas en handleSubmit()
        └── builder/
            ├── SaveBuildModal.tsx ✏️ MODIFICADO
            │   └── Maneja promesa en saveBuild()
            └── FavoritesModal.tsx ✏️ MODIFICADO
                └── Maneja promesa en deleteBuild()
        └── auth/
            └── UserMenu.tsx ✏️ MODIFICADO
                └── Maneja logout() como promesa

Legend:
⭐ = Archivo nuevo
✏️ = Archivo modificado
```

## Archivos Clave Explicados

### .env.local (NUEVO)
```
Contiene las credenciales de Supabase:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- Y otros parámetros PostgreSQL

⚠️ Nunca commitear este archivo
```

### src/supabase.ts (NUEVO)
```typescript
// Inicializa el cliente de Supabase
import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(url, key)
```

### src/store/authStore.ts (MODIFICADO)
```typescript
// Cambios principales:
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      isLoading: false,  // ← NUEVO
      
      // Funciones ahora async
      register: async (username, password) => Promise<Result>
      login: async (username, password) => Promise<Result>
      logout: async () => Promise<Result>
      
      // Nuevo método
      syncUsers: async () => Promise<void>
    }),
    { name: "tp2-ivo-auth-v2" }  // Cambió de v1 a v2
  )
)
```

### src/store/favoritesStore.ts (MODIFICADO)
```typescript
// Cambios principales:
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      saved: [],
      isLoading: false,  // ← NUEVO
      
      // Funciones ahora async
      saveBuild: async (userId, name, build) => Promise<SavedBuild | null>
      deleteBuild: async (id) => Promise<boolean>
      
      // Nuevo método
      syncUserBuilds: async (userId) => Promise<void>
    }),
    { name: "tp2-ivo-favorites-v2" }  // Cambió de v1 a v2
  )
)
```

### scripts/create-supabase-tables.sql (NUEVO)
```sql
-- Tabla users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Tabla saved_builds
CREATE TABLE saved_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  build JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
```

### Componentes Modificados

#### AuthModal.tsx
```typescript
// Antes: síncrono
const result = login(username, password)
if (result.ok) { ... }

// Después: async con promesa
login(username, password).then(result => {
  if (result.ok) { ... }
}).catch(err => {
  setError(err.message)
})
```

#### SaveBuildModal.tsx
```typescript
// Antes: síncrono
saveBuild(currentUserId, name, build)
onClose()

// Después: async con promesa
saveBuild(currentUserId, name, build).then(result => {
  if (result) onClose()
})
```

#### FavoritesModal.tsx
```typescript
// Antes: síncrono
onClick={() => deleteBuild(sb.id)}

// Después: async con promesa
onClick={() => deleteBuild(sb.id).catch(err => console.error(err))}
```

## Flujo de Datos

### Cuando se Registra un Usuario
```
1. Usuario ingresa username y password
2. AuthModal → handleSubmit() → register()
3. register() valida en cliente
4. Si OK, envía a Supabase.from('users').insert()
5. Supabase genera UUID y guarda
6. Zustand actualiza estado local
7. localStorage se sincroniza
8. Component actualiza UI
```

### Cuando Guarda un Build
```
1. Usuario hace clic "Guardar"
2. SaveBuildModal → handleSubmit() → saveBuild()
3. saveBuild() envía a Supabase.from('saved_builds').insert()
4. Supabase genera UUID, relaciona con user_id
5. Zustand actualiza estado local
6. localStorage se sincroniza
7. Component cierra modal
```

### Cuando Inicia Sesión
```
1. Usuario ingresa credentials
2. AuthModal → login()
3. login() busca en Supabase.from('users').select()
4. Si encuentra, establece currentUserId
5. Zustand notifica a useSupabaseSync()
6. useSupabaseSync() llama syncUserBuilds()
7. syncUserBuilds() descarga builds de ese user_id
8. Zustand se actualiza
9. App re-renderiza con favoritos del usuario
```

## Cambios en package.json

```json
"dependencies": {
  // ... otros packages ...
  "@supabase/supabase-js": "^2.38.0",  ← NUEVO
  "bcryptjs": "^2.4.3",                ← NUEVO (para futuro)
}
```

## Notas Importantes

1. **localStorage v2** - Se cambió el key en localStorage para evitar conflictos
2. **Funciones async** - Todos los cambios mantienen retrocompatibilidad
3. **Sin cambios de UI** - Los componentes lucen igual, solo cambiaron internamente
4. **Transición suave** - Zustand mantiene cache local mientras se sincroniza con Supabase
