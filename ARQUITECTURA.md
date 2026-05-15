# Arquitectura de la Integración Supabase

## 🏗️ Diagrama de Capas

```
┌──────────────────────────────────────────────────────────────────┐
│                     NAVEGADOR (Cliente)                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           COMPONENTES REACT (User Interface)              │ │
│  │                                                            │ │
│  │  AuthModal    SaveBuildModal    FavoritesModal           │ │
│  │      ↓               ↓                  ↓                 │ │
│  │    login()      saveBuild()        deleteBuild()          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            ZUSTAND STORE (Estado Local)                   │ │
│  │                                                            │ │
│  │  useAuthStore                useFavoritesStore            │ │
│  │  ├── users[]                 ├── saved[]                  │ │
│  │  ├── currentUserId           ├── isLoading                │ │
│  │  ├── register()              ├── saveBuild()              │ │
│  │  ├── login()                 ├── deleteBuild()            │ │
│  │  ├── logout()                ├── syncUserBuilds()         │ │
│  │  └── syncUsers()             └── getByUser()              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                          ↓                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         localStorage (Browser Storage)                    │ │
│  │                                                            │ │
│  │  Key: "tp2-ivo-auth-v2"                                   │ │
│  │  Key: "tp2-ivo-favorites-v2"                              │ │
│  │  (Cache para mejorar performance)                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                             ↓
                    ┌─────────────────┐
                    │  INTERNET (HTTP)│
                    │   Supabase JS   │
                    │  Client Library │
                    └─────────────────┘
                             ↓
┌──────────────────────────────────────────────────────────────────┐
│                    SUPABASE CLOUD                                │
│              (ihxtwbvuwvwmffckyzaj.supabase.co)                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      PostgreSQL Database (Fuente de Verdad)               │ │
│  │                                                            │ │
│  │  ┌──────────────────┐      ┌──────────────────────────┐  │ │
│  │  │  TABLA: users    │      │  TABLA: saved_builds     │  │ │
│  │  ├──────────────────┤      ├──────────────────────────┤  │ │
│  │  │ id (UUID)        │◄─────│ id (UUID)                │  │ │
│  │  │ username (TEXT)  │      │ user_id (UUID) ─────┐   │  │ │
│  │  │ password (TEXT)  │      │ name (TEXT)          │   │  │ │
│  │  │ created_at (TS)  │      │ build (JSONB)        │   │  │ │
│  │  └──────────────────┘      │ created_at (TS)      │   │  │ │
│  │                            └──────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Ubicación: AWS São Paulo (sa-east-1)                            │
│  Tipo: PostgreSQL 13+                                            │
│  Conexión: TCP + SSL/TLS                                         │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Flujos de Datos

### 1️⃣ Registrar Usuario

```
AuthModal
  ├─ Usuario ingresa username y password
  └─ Click en "Registrarme"
          ↓
    register(username, password)
          ↓
    [VALIDACIÓN EN CLIENTE]
    ├─ ¿Username >= 2 caracteres?
    ├─ ¿Password >= 4 caracteres?
    └─ ¿Username no existe ya?
          ↓
    supabase.from('users').insert([...])
          ↓
    [SUPABASE]
    ├─ Genera UUID
    ├─ Inserta en tabla users
    └─ Retorna registro creado
          ↓
    set({ users: [...], currentUserId: newUser.id })
          ↓
    [ZUSTAND]
    ├─ Actualiza estado local
    └─ localStorage se sincroniza automáticamente
          ↓
    Modal cierra
    Usuario es automáticamente logueado ✅
```

### 2️⃣ Iniciar Sesión

```
AuthModal
  ├─ Usuario ingresa username y password
  └─ Click en "Entrar"
          ↓
    login(username, password)
          ↓
    supabase.from('users').select('*').eq('username', ...)
          ↓
    [SUPABASE]
    ├─ Busca usuario en tabla users
    └─ Retorna registro si existe
          ↓
    [VALIDACIÓN]
    ├─ ¿Usuario existe?
    ├─ ¿Contraseña coincide?
    └─ Si todo OK → set({ currentUserId })
          ↓
    [ZUSTAND]
    ├─ Actualiza currentUserId
    └─ useSupabaseSync se dispara
          ↓
    syncUserBuilds(currentUserId)
          ↓
    supabase.from('saved_builds').select().eq('user_id', ...)
          ↓
    [SUPABASE]
    └─ Retorna todos los builds del usuario
          ↓
    set({ saved: [...] })
    Se cargan todos los favoritos del usuario ✅
```

### 3️⃣ Guardar Build

```
SaveBuildModal
  ├─ Usuario escribe nombre
  └─ Click en "Guardar"
          ↓
    saveBuild(userId, name, build)
          ↓
    supabase.from('saved_builds').insert([...])
          ↓
    [SUPABASE]
    ├─ Genera UUID
    ├─ Inserta en tabla saved_builds
    ├─ Relaciona con user_id
    └─ Retorna registro creado
          ↓
    set({ saved: [newBuild, ...] })
          ↓
    [ZUSTAND]
    ├─ Agrega nuevo build al principio
    └─ localStorage se sincroniza
          ↓
    Modal cierra
    Build aparece en "Mis Favoritos" ✅
```

### 4️⃣ Eliminar Build

```
FavoritesModal
  ├─ Usuario hace hover sobre un build
  └─ Click en "Eliminar"
          ↓
    deleteBuild(id)
          ↓
    supabase.from('saved_builds').delete().eq('id', ...)
          ↓
    [SUPABASE]
    ├─ Busca registro con ese id
    └─ Lo elimina de tabla saved_builds
          ↓
    set({ saved: saved.filter(b => b.id !== id) })
          ↓
    [ZUSTAND]
    ├─ Remueve build del array
    └─ localStorage se sincroniza
          ↓
    Build desaparece de lista ✅
```

## 📊 Modelo de Datos

### Tabla: users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,           -- UUID generado por Supabase
  username TEXT UNIQUE NOT NULL, -- Nombre de usuario (único)
  password TEXT NOT NULL,        -- Contraseña (texto plano actualmente)
  created_at TIMESTAMP           -- Cuando se registró
);
```

**Ejemplo:**
```
id                                   | username  | password     | created_at
─────────────────────────────────────┼───────────┼──────────────┼───────────────────
550e8400-e29b-41d4-a716-446655440000 | juan      | pass123      | 2025-05-15 10:30
550e8400-e29b-41d4-a716-446655440001 | maria     | password456  | 2025-05-15 10:35
```

### Tabla: saved_builds
```sql
CREATE TABLE saved_builds (
  id UUID PRIMARY KEY,            -- UUID generado por Supabase
  user_id UUID NOT NULL,          -- Referencia al usuario (FK)
  name TEXT NOT NULL,             -- Nombre del build
  build JSONB NOT NULL,           -- Objeto JSON con componentes
  created_at TIMESTAMP            -- Cuando se guardó
);
```

**Ejemplo:**
```
id                                   | user_id                              | name                    | build (JSONB)              | created_at
─────────────────────────────────────┼──────────────────────────────────────┼─────────────────────────┼────────────────────────────┼───────────────────────
550e8400-e29b-41d4-a716-446655440100 | 550e8400-e29b-41d4-a716-446655440000 | Mi PC Gaming            | {"cpu": "i9-13900k", ...}  | 2025-05-15 10:45
550e8400-e29b-41d4-a716-446655440101 | 550e8400-e29b-41d4-a716-446655440000 | PC Ofimática            | {"cpu": "i5-13600k", ...}  | 2025-05-15 10:50
550e8400-e29b-41d4-a716-446655440102 | 550e8400-e29b-41d4-a716-446655440001 | Workstation              | {"cpu": "Ryzen 5950x", ...}| 2025-05-15 11:00
```

## 🔐 Seguridad - Capas

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1: NAVEGADOR                                          │
│  ├─ Validación básica de inputs                             │
│  ├─ localStorage solo en cliente                            │
│  └─ HTTPS para comunicación con Supabase                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CAPA 2: RED                                                │
│  ├─ HTTPS / TLS 1.2+                                        │
│  ├─ No se guardan contraseñas en cookies                    │
│  └─ JWT no implementado aún                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CAPA 3: SUPABASE                                           │
│  ├─ PostgreSQL con RLS (Row Level Security)                 │
│  ├─ Políticas de acceso (RLS policies)                      │
│  ├─ SSL de conexión                                         │
│  ├─ Backups automáticos                                     │
│  └─ Encriptación en tránsito                                │
└─────────────────────────────────────────────────────────────┘
```

## 🌐 Endpoints de Supabase Utilizados

```
POST   /rest/v1/users
       - Crear usuario (register)
       - Body: { username, password }
       - Response: { id, username, created_at }

GET    /rest/v1/users?username=eq.{username}
       - Buscar usuario por username (login)
       - Response: [{ id, username, password, created_at }]

POST   /rest/v1/saved_builds
       - Crear build favorito
       - Body: { user_id, name, build }
       - Response: { id, user_id, name, build, created_at }

GET    /rest/v1/saved_builds?user_id=eq.{user_id}
       - Obtener builds de un usuario
       - Response: [{ id, user_id, name, build, created_at }]

DELETE /rest/v1/saved_builds?id=eq.{id}
       - Eliminar un build
       - Response: (204 No Content)
```

## 📈 Performance

### Caching
```
Request → Check localStorage → No hay
           ↓
Request → Supabase → Respuesta
           ↓
Store en localStorage (Zustand)
           ↓
Proxima request → Check localStorage → Hay! ✅
```

### Reducción de Requests
- localStorage como cache evita requests innecesarios
- syncUserBuilds() solo al cambiar de usuario
- Sincronización automática en background

## 🚀 Escalabilidad Futura

```
Hoy:                          Futuro:
- localStorage + Supabase     - Supabase Auth
- Contraseña plana            - JWT + Refresh Tokens
- Sin validación backend      - Edge Functions
- UI solo                      - Real-time Subscriptions
- Manual sync                  - Auto-sync con Realtime
```
