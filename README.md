# PC Builder

Aplicación web para armar una PC eligiendo componentes y viendo el armado en
3D en tiempo real. Por cada categoría (gabinete, motherboard, CPU, GPU, RAM,
etc.) el usuario elige una pieza, la ve aparecer dentro del gabinete y el total
se actualiza al instante. Con sesión iniciada se pueden guardar builds como
favoritos.

Hecho con Next.js, React, Zustand, react-three-fiber para el 3D y Supabase para
autenticación y persistencia.

## Producción

La app está deployada en Vercel:

https://tp-2-ivo-git-lola-sabetay-felgimons-projects.vercel.app/

El deploy a producción es automático: lo hace el pipeline de CI/CD cada vez que
se mergea a `main`, y solo si pasaron lint, tests unitarios, build y tests E2E.
El detalle del pipeline y de las decisiones de calidad está en
[CALIDAD.md](./CALIDAD.md).

## Cómo correrlo en local

Requiere Node 20 o superior.

```bash
npm install
npm run dev
```

Abrir http://localhost:3000.

Para que funcionen login y favoritos hace falta configurar Supabase. Copiar
`.env.local.example` a `.env.local` y completar las variables. Sin esas
variables la app igual arranca y se puede armar una PC; solo no andan login ni
guardado. El detalle está comentado dentro de `.env.local.example`.

## Scripts

```bash
npm run dev            # servidor de desarrollo
npm run build          # build de producción
npm run start          # sirve el build de producción
npm run lint           # ESLint
npm run test           # tests unitarios (Vitest)
npm run test:coverage  # tests unitarios con reporte de cobertura
npm run test:e2e       # tests E2E (Playwright)
```

## Convención de ramas

Ningún cambio se mergea directo a `main`. Todo pasa por una rama y un Pull
Request que referencia el issue que resuelve (`closes #N`), revisado y aprobado
por el otro integrante antes de mergear.

Las ramas se nombran según el tipo de trabajo:

```
feature/<nombre-corto>   nueva funcionalidad   ej: feature/cicd-pipeline
fix/<nombre-corto>       corrección de bug      ej: fix/login-trim-password
test/<nombre-corto>      tests                  ej: test/unit-business-logic
docs/<nombre-corto>      documentación          ej: docs/calidad
chore/<nombre-corto>     config / mantenimiento ej: chore/pr-template
```

## Tests y calidad

El proyecto tiene tests unitarios (Vitest) sobre la lógica de negocio y tests
E2E (Playwright) sobre el flujo principal, que corren en el pipeline de CI antes
de cada deploy. Todo el razonamiento detrás de la estrategia de testing, las
herramientas elegidas, los casos de uso priorizados y las limitaciones está
documentado en [CALIDAD.md](./CALIDAD.md).
