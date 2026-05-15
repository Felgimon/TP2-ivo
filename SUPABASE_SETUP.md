# Integración de Supabase

Este proyecto ha sido actualizado para almacenar datos de forma permanente usando Supabase en lugar de localStorage.

## Configuración

### 1. Variables de Entorno

Las variables de entorno necesarias ya están configuradas en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave anónima (pública)
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL`: URLs de conexión a PostgreSQL

**IMPORTANTE**: Nunca commitees `.env.local` a GitHub, ya que contiene credenciales sensibles.

### 2. Crear Tablas en Supabase

Para crear las tablas necesarias en Supabase:

1. Ve al [Dashboard de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Crea una nueva query y copia el contenido de `scripts/create-supabase-tables.sql`
5. Ejecuta la query

Las tablas creadas serán:
- **users**: Almacena registros de usuarios (username, password)
- **saved_builds**: Almacena los builds favoritos de cada usuario

### 3. Instalar Dependencias

```bash
npm install
```

Las dependencias principales son:
- `@supabase/supabase-js`: Cliente de Supabase
- `zustand`: Manejo de estado (con sincronización a Supabase)
- `framer-motion`, `lucide-react`: UI y animaciones

## Cambios Implementados

### Stores Actualizados

- **`src/store/authStore.ts`**: 
  - ✅ Ahora usa Supabase para registro, login y logout
  - ✅ Las funciones `register()`, `login()` y `logout()` son async
  - ✅ Mantiene Zustand para estado local y localStorage como fallback

- **`src/store/favoritesStore.ts`**:
  - ✅ Ahora usa Supabase para guardar/eliminar builds
  - ✅ Las funciones `saveBuild()` y `deleteBuild()` son async
  - ✅ Nuevo método `syncUserBuilds()` para sincronizar datos

### Componentes Actualizados

Los siguientes componentes fueron actualizados para manejar funciones async:

- `src/components/auth/AuthModal.tsx`: Maneja promesas en login/register
- `src/components/auth/UserMenu.tsx`: Logout ahora es async
- `src/components/builder/SaveBuildModal.tsx`: `saveBuild()` retorna promesa
- `src/components/builder/FavoritesModal.tsx`: `deleteBuild()` retorna promesa

### Sincronización de Datos

Se agregó `src/hooks/useSupabaseSync.ts` que sincroniza automáticamente los builds favoritos del usuario cuando inicia sesión.

## Seguridad

### Consideraciones Actuales

Actualmente, las contraseñas se almacenan en texto plano en la base de datos. Esto es suficiente para un proyecto académico, pero NO es recomendado para producción.

### Para Producción

Para un proyecto real, se recomienda:

1. **Usar Supabase Auth**: Integrar `@supabase/auth-helpers` para autenticación segura
2. **Hash de Contraseñas**: Usar bcryptjs en un Edge Function de Supabase
3. **JWT**: Implementar tokens JWT para sesiones
4. **HTTPS Only**: Asegurar que todas las conexiones sean HTTPS
5. **Rate Limiting**: Limitar intentos de login fallidos

Ejemplo con Supabase Auth (futuro):
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)
await supabase.auth.signUp({ email, password })
```

## Testing

Para probar la integración:

1. Inicia el servidor: `npm run dev`
2. Abre `http://localhost:3000`
3. Crea una nueva cuenta
4. Guarda un build favorito
5. Recarga la página: el build debe persistir
6. Cierra sesión y vuelve a iniciar: el build debe estar disponible

## Troubleshooting

### "Las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY son requeridas"

- Verifica que `.env.local` existe en la raíz del proyecto
- Confirma que tienes las keys correctas en Supabase

### Los builds no se sincronizan

- Verifica que las tablas existan en Supabase (ve a SQL Editor)
- Comprueba en la consola del navegador (F12) para ver errores
- Asegúrate de que el usuario está logueado antes de guardar builds

### Error de conexión a Supabase

- Verifica que la URL de Supabase es correcta
- Comprueba que la clave anónima no está expirada
- Verifica que no hay firewall bloqueando la conexión
