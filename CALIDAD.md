# Calidad y automatización

Este documento explica cómo aseguramos la calidad del PC Builder y por qué
tomamos cada decisión. No es un log automático ni un listado de comandos, es el
razonamiento del equipo detrás del pipeline, los tests y las herramientas.

La app ya estaba funcionando y deployada desde el TP2. Lo que sumamos en esta
etapa es la red de seguridad alrededor de ese código: que nada llegue a
producción sin pasar por verificaciones automáticas, y que si algo se rompe nos
enteremos nosotros antes que el usuario.

## 1. Estrategia general

El proyecto es chico en cantidad de pantallas (es básicamente una sola pantalla)
pero tiene varias piezas que pueden fallar en silencio: el cálculo del precio
total, el catálogo de componentes, la autenticación y el guardado de favoritos.
Decidimos no perseguir un número de cobertura alto a cualquier costo, sino
proteger primero lo que más duele si se rompe.

La estrategia se apoya en tres niveles, de más barato y rápido a más caro:

1. Lint estático, que corre en milisegundos y atrapa errores antes de ejecutar
   nada.
2. Tests unitarios sobre la lógica de negocio pura (los stores y el catálogo),
   que son rápidos, deterministas y no dependen de la red.
3. Un test E2E sobre el flujo principal en un navegador real, que valida que las
   piezas funcionen juntas de verdad y no solo aisladas.

La idea de fondo es la del marco teórico del TP: los tests validan casos
puntuales, pero la calidad también depende de cómo se organiza el trabajo. Por
eso todo cambio pasa por una rama, un Pull Request que referencia un issue, y la
revisión del otro integrante antes de mergear. El pipeline es el que garantiza
que ese código, ya revisado, además compile y pase los tests antes de ir a
producción.

Una decisión consciente fue separar qué testeamos con qué. La capa 3D
(react-three-fiber, los modelos .glb) no la cubrimos con unit tests porque es
cara de testear, cambia seguido y un test ahí sería frágil sin aportar mucha
confianza. La lógica que sí importa para el negocio (precios, catálogo, sesión)
está toda en funciones puras o en stores fáciles de testear, y ahí pusimos el
esfuerzo.

## 2. Herramientas seleccionadas

Tests unitarios: Vitest. Lo elegimos sobre Jest porque el proyecto ya usa Vite y
ESM de forma nativa, y Vitest se integra sin tener que configurar Babel ni
transformaciones extra. Jest hubiera requerido más configuración para que
entienda TypeScript y los imports con alias (`@/...`). Con Vitest alcanzó con un
`vitest.config.ts` corto reusando el mismo alias que ya usa Next.

Tests E2E: Playwright. Lo elegimos sobre Cypress porque levanta el navegador
headless más rápido, corre bien en CI sin configuración especial, y el modelo de
auto waiting (espera sola a que el elemento esté listo) nos evita los sleeps
frágiles. Además su `webServer` integrado nos deja levantar el build de
producción y testear contra eso con muy poca config.

Lint: ESLint con la config de Next (`eslint-config-next`), que ya venía en el
proyecto. No la cambiamos por otra porque trae reglas pensadas para Next y React
que tienen sentido acá. Lo único que ajustamos fue bajar dos reglas nuevas del
React Compiler a warning (lo explicamos abajo, en el pipeline).

CI/CD: GitHub Actions. Es la opción natural estando el repo en GitHub, no suma un
servicio externo y los secrets se manejan en el mismo lugar. Evaluamos no usar
nada y dejar que Vercel deploye solo con su integración de Git, pero eso no
cumple el requisito de que el deploy dependa de que los tests pasen, así que lo
descartamos.

Deploy: Vercel mediante su CLI desde el pipeline. La app ya vivía en Vercel, así
que no tenía sentido mover el hosting. Lo que cambiamos fue cómo se dispara el
deploy (ver pipeline).

Monitoreo de errores: Sentry (`@sentry/nextjs`). Es el estándar para Next y nos
deja capturar errores tanto del cliente como del servidor con una integración
oficial.

## 3. Tests desarrollados

### Unitarios (Vitest)

Catálogo de componentes (`src/data/components.test.ts`):

- `getComponentById` devuelve el componente correcto cuando el id existe.
- `getComponentById` devuelve `undefined` cuando el id no existe (caso real: un
  favorito guardado con un id que después se sacó del catálogo).
- `getComponentById` devuelve `undefined` cuando el id es `undefined` (una
  categoría que el usuario todavía no eligió).
- `getComponentsByCategory` devuelve solo componentes de la categoría pedida.
- Cada categoría del builder tiene al menos un componente disponible, así
  ninguna pestaña queda vacía.
- No hay ids duplicados en el catálogo, porque un duplicado haría inalcanzable al
  segundo componente.
- Todos los precios son positivos.

Store del builder (`src/store/buildStore.test.ts`):

- `getTotalPrice` devuelve 0 cuando no hay nada seleccionado.
- `getTotalPrice` suma bien el precio de un único componente.
- `getTotalPrice` suma bien varios componentes de distintas categorías.
- `getTotalPrice` ignora ids inexistentes en vez de romperse o devolver `NaN`.
- `selectComponent` selecciona y des-selecciona (pasando `undefined`).
- Cambiar un componente no afecta a las otras categorías.
- `setActiveCategory` cambia la pestaña activa.
- `resetBuild` deja el build vacío y el total en 0.
- `loadBuild` carga un favorito haciendo una copia, no guardando la referencia,
  así editar el build después no modifica el favorito original.

Store de autenticación (`src/store/authStore.test.ts`), mockeando Supabase:

- `register` rechaza un usuario de menos de 2 caracteres.
- `register` rechaza una contraseña de menos de 4 caracteres.
- `register` rechaza el alta si el nombre de usuario ya existe.
- `register` da de alta y deja logueado al usuario cuando todo sale bien.
- `login` falla si el usuario no existe.
- `login` falla si la contraseña no coincide.
- `login` loguea cuando las credenciales son correctas y agrega el usuario al
  estado local si no estaba.
- `logout` limpia el usuario actual.

Store de favoritos (`src/store/favoritesStore.test.ts`), mockeando Supabase:

- `getByUser` devuelve solo los builds del usuario pedido.
- `getByUser` ordena del más nuevo al más viejo.
- `getByUser` devuelve vacío si el usuario no tiene builds.
- `saveBuild` guarda y agrega al estado cuando Supabase responde ok.
- `saveBuild` devuelve `null` si Supabase falla.
- `deleteBuild` saca el build del estado cuando el borrado es exitoso.
- `deleteBuild` no toca el estado si Supabase devuelve error.

Store de tema (`src/store/themeStore.test.ts`):

- `toggleTheme` alterna entre claro y oscuro.
- `toggleTheme` refleja el cambio en el atributo `data-theme` del documento, que
  es lo que el CSS usa para pintar la app.

### E2E (Playwright)

Flujo principal del builder (`e2e/builder.spec.ts`):

- El usuario elige un gabinete, lo ve aparecer en el resumen "Tu build" y el
  total pasa a ser el precio de esa pieza. Después elige un procesador en otra
  pestaña y el total se recalcula como la suma de los dos. Es el caso de uso
  central de la app de punta a punta.
- Al hacer click de nuevo en un componente ya elegido, se des-selecciona y el
  total vuelve a cero.

Sesión y validaciones (`e2e/auth.spec.ts`):

- Sin sesión iniciada, el botón "Guardar" del resumen está deshabilitado. No se
  puede guardar un build sin estar logueado.
- En el formulario de registro, una contraseña demasiado corta muestra el
  mensaje de error correcto. Este test recorre la UI real (abrir el modal,
  cambiar a modo registro, completar el form, leer el error) y corre sin backend
  porque la validación corta antes de pegarle a Supabase.

Para que los tests E2E no dependan de textos que pueden cambiar (marcas, nombres
de productos), agregamos algunos `data-testid` estables en la UI: las tarjetas de
componente (`option-<id>`), el total (`build-total`), el resumen
(`build-summary`) y el botón de guardar (`save-build`).

## 4. Casos de uso críticos

Priorizamos proteger, en este orden:

El cálculo del precio total. Es el número más visible de la app y el que decide
si "Guardar" se habilita. Si se rompe (una suma mal, un `NaN` por un id roto), el
usuario ve información incorrecta y pierde confianza en todo lo demás. Por eso
tiene la batería de tests más completa, incluyendo el caso del id que ya no
existe en el catálogo.

El armado de la PC de punta a punta. Es el flujo por el que pasa el 100% de los
usuarios. Lo cubrimos con el test E2E porque queremos validar no solo que la
función sume, sino que al hacer click en la UI real el componente aparezca en el
resumen y el total se actualice.

La autenticación. Si el registro o el login se comportan mal, el usuario no entra
o entra cuando no debería. Cubrimos las validaciones y los caminos felices y de
error contra Supabase (mockeado). No lo llevamos a E2E real porque depende de un
backend con datos, lo que haría el test lento y no determinista en CI.

Dejamos a propósito fuera del foco la escena 3D. Es lo más vistoso pero no es
donde está el riesgo de negocio: si un modelo no carga, hay un error boundary que
lo aísla y el resto de la app sigue andando. Cubrirla con tests sería caro y
frágil para el valor que aporta.

## 5. Pipeline de CI/CD

El workflow está en `.github/workflows/ci.yml` y se dispara en cada push a `main`
y en cada Pull Request que apunte a `main`. Tiene dos jobs.

El job `quality` corre, en orden:

1. Instala dependencias con `npm ci` y el navegador de Playwright.
2. Lint (`npm run lint`).
3. Tests unitarios con cobertura (`npm run test:coverage`).
4. Build de producción (`npm run build`).
5. Tests E2E (`npm run test:e2e`).

El orden es intencional: ponemos lo más rápido y barato primero. Si el lint
falla, el job se corta ahí y no gastamos minutos buildeando algo que ya sabemos
que está mal. Lo mismo con los unitarios antes del build, y el build antes del
E2E. Cada paso es una compuerta: si uno falla, los siguientes no corren y el job
queda en rojo.

Una decisión de diseño concreta: en CI los tests E2E no rebuildean. El build ya
lo hizo el paso anterior, así que Playwright solo levanta `next start` y testea
contra ese build (la lógica está en `playwright.config.ts`, que mira la variable
`CI`). En local, en cambio, el comando hace `build && start` solo para que sea
cómodo correrlo sin acordarse de buildear antes.

El job `deploy` depende de `quality` (`needs: quality`) y además solo corre en
push a `main`, nunca en Pull Requests. Esto es lo que garantiza que producción
solo se actualiza con código que pasó todas las verificaciones. Usa la CLI de
Vercel: trae la config con `vercel pull`, buildea con `vercel build --prod` y
deploya con `vercel deploy --prebuilt --prod`.

Para que el único camino a producción sea el pipeline, desactivamos el
auto deploy por git de Vercel en `vercel.json` (`git.deploymentEnabled.main:
false`). Sin esto, Vercel deployaría solo en cada push a `main`,
independientemente de si los tests pasaron, y el requisito quedaría sin cumplir.

Qué pasa si falla el lint (o cualquier paso): el job `quality` termina en rojo,
el job `deploy` no arranca porque su `needs` no se cumplió, y producción queda en
la última versión que sí había pasado. En un Pull Request, GitHub marca el check
en rojo y el PR no se debería mergear hasta arreglarlo. Esto se puede demostrar
abriendo un PR que rompa un test a propósito: el pipeline lo marca en rojo y el
deploy no ocurre.

Secrets necesarios para el deploy (se cargan en Settings, Secrets and variables,
Actions del repo): `VERCEL_TOKEN`, `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`. El
token se genera en Vercel (Account Settings, Tokens) y el org id y el project id
salen de correr `vercel link` en el proyecto o de leerlos en la config del
proyecto en Vercel.

## 6. Limitaciones y deuda técnica

Somos honestos con lo que quedó flojo o sin cubrir:

Incidente del deploy a producción (resuelto). El primer día que enchufamos el
pipeline, el paso de deploy fallaba siempre en Vercel con el error "Resource
provisioning failed" (código BUILD_FAILED), antes de que arrancara el build, por
eso no dejaba logs. Nos costó bastante y lo diagnosticamos con la API de Vercel.
Lo primero que descartamos: no era del pipeline. La falla aparecía igual por el
deploy con CLI del workflow y por la integración git de Vercel, e incluso los auto
deploys de producción de los primeros merges a main fallaron idénticos, antes de
que nuestra config entrara en juego. En cambio, los deploys de preview del mismo
código quedaban en READY. O sea, el problema era puntual de los deploys de
producción de ese proyecto de Vercel. Probamos varias cosas que no lo destrabaron:
reintentar el deploy tres veces, revisar que el dominio estuviera verificado y el
proyecto no pausado, y bajar la versión de Node del proyecto de 24.x a 22.x. Lo
que finalmente lo resolvió fue recrear el proyecto en Vercel desde cero: creamos un
proyecto nuevo, copiamos las variables de entorno del viejo y apuntamos el secret
`VERCEL_PROJECT_ID` al nuevo. Con ese proyecto limpio, el deploy de producción pasó
a estado READY y la app quedó publicada. La conclusión que nos llevamos es que el
proyecto original había quedado con el provisioning de producción roto del lado de
Vercel, algo que no se arregla desde el código sino recreando el proyecto. Queda
como deuda un tema aparte: los modelos 3D pesan 258 MB en `public/`, que hace los
deploys pesados; no fue la causa del incidente (los previews con ese mismo peso
andaban), pero aligerarlos con storage externo o compresión sería una mejora.

La escena 3D no tiene tests. Es una decisión consciente por costo y fragilidad,
pero significa que una regresión visual (un modelo que carga mal, una cámara que
se rompe) no la atrapa el pipeline. Lo aceptamos como riesgo porque el error
boundary contiene el daño y no afecta la lógica de negocio.

El E2E de autenticación no prueba el camino completo contra Supabase real
(registrarse, guardar un favorito, recargar y verlo). Lo dejamos en validaciones
y en el gating del botón porque un E2E con backend de verdad necesitaría datos de
prueba y limpieza entre corridas, y se volvería lento y no determinista en CI.
Con más tiempo, lo haríamos contra un proyecto de Supabase de testing con seed y
teardown.

La cobertura de branches quedó en 56.89%, abajo del 60%. Las ramas que faltan son
casi todas manejo de error de Supabase (qué pasa si la red falla, si la query
devuelve error), difíciles de ejercitar sin levantar escenarios de error
específicos. Por eso el umbral de branches en el pipeline lo pusimos en 50% y no
en 60%, a diferencia de statements, lines y functions que sí están sobre 60%.

Dos reglas nuevas del React Compiler (`react-hooks/set-state-in-effect` y
`react-hooks/static-components`) las bajamos de error a warning. La primera salta
por el idiom de guard de hidratación (`setHydrated(true)` dentro de un `useEffect`
vacío), que es el patrón recomendado para evitar mismatch de SSR con estado
persistido en localStorage. La segunda salta en `PCScene` porque elegimos el
componente de modelo 3D según el build del usuario, que es intencional. Las
dejamos en warning para que el pipeline no se frene por falsos positivos, pero
las seguimos viendo en la salida del lint. La deuda acá sería migrar el guard de
hidratación a `useSyncExternalStore` para sacar el warning de raíz.

El repo arrastra varios .md de documentación del TP2 y 258 MB de modelos 3D, lo
que hace el checkout y el build en CI más pesados de lo ideal. No lo tocamos para
no romper la app, pero con más tiempo moveríamos los modelos a un storage externo
o los comprimiríamos con Draco.

La autenticación del TP2 compara contraseñas en texto plano contra Supabase. No
es parte de este TP arreglarlo, pero lo dejamos anotado como deuda de seguridad
conocida.

## Extras

### Cobertura de tests

Corremos cobertura con `npm run test:coverage` (Vitest con provider v8). Medimos
solo sobre las funciones de negocio (`src/store` y `src/data`), porque incluir la
capa 3D o los componentes inflaría el denominador con código que no tiene sentido
cubrir con unit tests y daría un número engañoso.

Resultado actual sobre las funciones de negocio:

```
Statements   : 74.21% ( 95/128 )
Branches     : 56.89% ( 33/58 )
Functions    : 78.94% ( 30/38 )
Lines        : 74.78% ( 86/115 )
```

Statements, functions y lines superan el 60% pedido. Lo que más cubierto está es
justamente lo más crítico: el cálculo de precios del builder y el catálogo. El
tema (`themeStore`) está al 100%. Lo menos cubierto son las ramas de error de
Supabase en auth y favoritos, como explicamos en limitaciones.

Los umbrales están puestos como gate real en `vitest.config.ts` (statements,
lines y functions en 60, branches en 50). Si la cobertura baja de ahí, el
pipeline falla.

### Sentry (monitoreo de errores)

Integramos Sentry con `@sentry/nextjs`. La inicialización está en
`src/instrumentation-client.ts` (cliente) y `src/instrumentation.ts` (servidor,
con el hook oficial `onRequestError` de App Router). Toda la integración está
guardada por la variable `NEXT_PUBLIC_SENTRY_DSN`: si no hay DSN, Sentry queda
apagado y ni la app ni el build se ven afectados. Esto la hace opt in y no
intrusiva.

Para verificar que captura errores dejamos un helper que, cuando hay DSN, se
expone en `window.__sentryTest()`. Con el DSN configurado en Vercel, abrimos la
consola del navegador en la app deployada, ejecutamos `window.__sentryTest()` y
el evento "Error de prueba TP3 (verificación de Sentry)" aparece en el dashboard
de Sentry. Para que esto funcione hay que cargar `NEXT_PUBLIC_SENTRY_DSN` en las
variables de entorno de Vercel (o en `.env.local` para probar en local).

### Uso de un agente de IA

Usamos un agente de IA para acelerar la parte mecánica del TP. En concreto generó
el andamiaje de la configuración de Vitest y Playwright, una primera versión de
los tests y el esqueleto del workflow de Actions. Sobre eso revisamos y
ajustamos varias cosas a mano porque la primera pasada no contemplaba detalles
del proyecto:

- El entorno de los tests. La primera versión asumía jsdom para todo. Lo pasamos
  a `node` por default (más rápido) y dejamos jsdom solo en los archivos que lo
  necesitan, declarándolo con un comentario `@vitest-environment jsdom` arriba de
  cada uno.
- El polyfill de `localStorage`. Los stores usan el middleware `persist` de
  zustand, que escribe en localStorage, y el jsdom de Vitest 4 no lo trae. Sin
  esto los tests de auth y favoritos explotaban. Agregamos un polyfill en memoria
  en `vitest.setup.ts`.
- El mock de Supabase. Lo reescribimos como un builder encadenable y "thenable"
  para imitar la API real de supabase-js (que a veces se termina con
  `.maybeSingle()` y a veces se hace `await` directo sobre la query), porque la
  versión inicial no cubría el caso de `delete` ni de `order`.
- El alcance de la cobertura y los `data-testid`, que ajustamos a la estructura
  real de este proyecto.

Entendemos cada test que entregamos y podemos explicar línea por línea qué hace y
por qué, que es lo que pide la consigna.

### Organización del trabajo

El trabajo se organizó con issues en GitHub, uno por cada unidad de cambio
(pipeline, tests unitarios, tests E2E, fixes de lint, documentación, Sentry).
Cada uno tiene su rama siguiendo la convención documentada en el README, su Pull
Request referenciando el issue (`closes #N`) y la revisión del otro integrante
antes de mergear. El historial de issues y PRs es parte de la entrega y refleja
este flujo.

### Plantilla de Pull Request

Agregamos una plantilla de PR (`.github/pull_request_template.md`) con un
checklist de revisión (lint en verde, tests en verde, rama con la convención
correcta, revisión del otro integrante) para que ninguna revisión sea una
aprobación vacía. También dejamos plantillas de issues para feature y para bug.
