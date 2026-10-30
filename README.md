# GranaBank — Challenge técnico

Web app de billetera para el club, siguiendo el [diseño de Figma](https://www.figma.com/design/GXEt9rIWDil8nQN8ewOrVD/Challenge-t%C3%A9cnico) del challenge: inicio de sesión, home con la tarjeta y los últimos movimientos, y una pantalla de movimientos con búsqueda y filtros rápidos.

- **Deploy:** https://pps-lanus-test.vercel.app
- **Repositorio:** https://github.com/Bauti-Daneri/pps-lanus-test

> **Estado: en desarrollo.** Hoy están resueltos la infraestructura (repo, deploy, base de datos y migraciones), el login con sesión, los datos de tarjeta y movimientos en el backend y las pantallas Login, Home y Movimientos con el estilo del Figma. Falta la comparación visual contra el Figma. Lo que falta está marcado como `[Pendiente]` en cada sección.

## Estado del proyecto

- [x] Repo en GitHub y deploy automático en Vercel en cada push a `main`
- [x] Base PostgreSQL en Neon (región São Paulo)
- [x] Prisma 7 con el modelo `User` y la migración inicial
- [X] Seed con el usuario de prueba y contraseña hasheada
- [x] Login y sesión: login, logout, "Recordarme" (sesión de 30 días o de navegador), `/home` protegida y redirecciones del proxy
- [x] Datos de tarjeta y movimientos (backend): modelos `Card` y `Movement`, migración aplicada, seed idempotente y servicio de lectura
- [x] Home: saludo, tarjeta, últimos 5 movimientos y barra de navegación, con los datos reales (verificado por HTTP en `npm run dev`)
- [x] Movimientos: búsqueda por nombre y filtros rápidos por tipo, con estado en la URL (verificado por HTTP en `npm run dev` con datos reales; el debounce, la opacidad y la sincronización del input no se probaron en un navegador)
- [ ] Estados de carga, error y vacío: implementados en Home y Movimientos (`loading.tsx` por pantalla, un `error.tsx` compartido, vacío total y vacío por filtros). Con la base caída se confirmó que el servidor deriva el error a `(app)/error.tsx`, pero no se vio en pantalla
- [ ] Fidelidad al Figma y responsive: Login, Home y Movimientos siguen las medidas y tokens del Figma, pero todavía no se compararon visualmente contra el diseño


## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend y backend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS 4 (tokens del Figma en `@theme`) |
| Tipografías | Plus Jakarta Sans y Roboto Slab con `next/font/google` |
| Base de datos | PostgreSQL en Neon |
| ORM | Prisma 7 con `@prisma/adapter-pg` |
| Deploy | Vercel |

## Cómo correrlo

**Requisitos:** Node.js 20.9 o superior, npm y una base PostgreSQL (Neon u otra).

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/Bauti-Daneri/pps-lanus-test.git
   cd pps-lanus-test
   ```

2. Crear un archivo `.env` en la raíz **antes de instalar** (el script `postinstall` ejecuta `prisma generate`, que lee la configuración):

   ```env
   DATABASE_URL="postgresql://USUARIO:CLAVE@HOST-pooler/neondb?sslmode=verify-full"
   DIRECT_URL="postgresql://USUARIO:CLAVE@HOST/neondb?sslmode=require"
   SESSION_SECRET="CADENA_ALEATORIA_DE_32_O_MAS_CARACTERES"
   ```

   - `DATABASE_URL`: conexión *pooled*, la que usa la app. Se usa verify-full explícito para evitar un aviso de seguridad de la librería pg. Es el comportamiento que require ya tiene hoy. DIRECT_URL queda en require, porque la usan las migraciones de Prisma.
   - `DIRECT_URL`: conexión directa, la que usan las migraciones.
   - Con una base local, las dos pueden ser la misma URL.
   - `SESSION_SECRET`: clave con la que se firman los JWT de sesión. Mínimo 32 caracteres. Sin ella la app (y el build) fallan con un error explícito. Se genera con:

     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
     ```

     En Vercel se carga como variable de entorno del proyecto. Cambiarla invalida todas las sesiones abiertas.

3. Instalar dependencias:

   ```bash
   npm install
   ```

4. Aplicar las migraciones:

   ```bash
   npx prisma migrate deploy
   ```

   Aplica solo las migraciones pendientes y nunca resetea la base. En este proyecto la base de Neon es la misma para local y producción, así que no se usa `migrate dev` contra ella: si detecta diferencias, ofrece borrar todo.

5. Cargar el usuario de prueba con su tarjeta y sus movimientos:

   ```bash
   npx prisma db seed
   ```

   Ejecuta `prisma/seed.ts` con `tsx` (registrado en `migrations.seed` de `prisma.config.ts`) y usa `DATABASE_URL`. Es idempotente: en una sola transacción hace `upsert` del usuario por email, borra su tarjeta y sus movimientos y los vuelve a crear. Correrlo de nuevo no duplica nada. Las fechas de los movimientos se calculan desde el día en que se corre (el más nuevo, hoy a las 12:00 UTC; cada uno de los siguientes, un día antes).

6. Levantar el servidor de desarrollo y abrir http://localhost:3000:

   ```bash
   npm run dev
   ```

### Usuario de prueba

Según la consigna del challenge:

- Email: `soygranate@clublanus.com`
- Contraseña: `GRANATE1@`

Lo crea el seed. En la base se guarda solo el hash de la contraseña (bcrypt), nunca el texto plano.

### Rutas

| Ruta | Qué hace |
| --- | --- |
| `/` | Redirige a `/home`. |
| `/login` | Logo y formulario de ingreso (email, contraseña con botón para mostrarla y "Recordarme"). Sin barra de navegación. Con sesión activa, el proxy redirige a `/home`. |
| `/home` | Protegida. Saludo con el nombre, tarjeta, últimos 5 movimientos y barra de navegación (Inicio, Movimientos, Salir). |
| `/movimientos` | Protegida. Buscador por nombre y pestañas por tipo. Acepta `?q=<texto>` y `?type=SUS\|CASH_IN\|CASH_OUT`; un `type` inválido se ignora. |
| `/api/session/clear` | Uso interno: borra la cookie cuando el JWT apunta a un usuario que ya no existe y redirige a `/login`. |

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Decisiones técnicas

### Tomadas

- **Un solo proyecto Next.js para frontend y backend.** Server Components, Server Actions y route handlers, sin servidor aparte. Evita un segundo deploy, CORS y configuración duplicada, y la consigna lo permite.
- **Prisma 7 fijado, no la 8.** La versión 8 reorganizó hace poco su CLI y su documentación; elegí la versión con documentación y ejemplos estables. Migrar a la 8 queda como mejora.
- **Dos cadenas de conexión a Neon.** La *pooled* para la app, porque en un entorno serverless se abren muchas conexiones cortas; la directa para las migraciones, porque el pooler puede interferir con operaciones de esquema.
- **Cliente de Prisma generado fuera de Git.** Vive en `src/generated/prisma`, está en `.gitignore` y se genera en el `postinstall`, también en Vercel.
- **Autenticación implementada a mano.** Se desactivó el servicio de auth gestionado que ofrece Neon para entender y poder explicar el flujo de sesión.
- **Un único cliente de Prisma para la app.** `src/lib/prisma.ts` crea el cliente con `@prisma/adapter-pg` y `DATABASE_URL`, y en desarrollo lo guarda en `globalThis` para que el hot reload no abra un pool de conexiones nuevo en cada recarga.
- **Contraseñas hasheadas con `bcryptjs`.** Es JavaScript puro: no necesita compilar binarios nativos en Windows ni en Vercel, a diferencia de `bcrypt` o `argon2`.
- **El seed usa la conexión *pooled*.** Solo hace consultas comunes (no cambia el esquema), así que usa la misma cadena que la app. Tiene su propio cliente en lugar de importar `src/lib/prisma.ts`, para no mezclar el script de CLI con el código de la app.
- **Sesión sin estado con JWT en cookie.** `src/lib/session.ts` firma un JWT con `jose` (HS256, `SESSION_SECRET`) y lo guarda en la cookie `session`: `httpOnly`, `Secure` solo en producción, `SameSite=Lax` y `path=/`. La duración depende de "Recordarme" (ver más abajo). La verificación exige `algorithms: ["HS256"]` explícito. El archivo importa `server-only` para que el build falle si alguien lo importa desde el navegador.
- **El JWT lleva solo el id del usuario.** Va en `sub`. El nombre y cualquier otro dato se leen de la base con ese id, así no quedan datos viejos en la cookie y un usuario borrado deja de tener acceso aunque su JWT siga vigente.
- **Login y logout como Server Actions.** `src/app/actions/auth.ts`. El formulario usa `useActionState` para mostrar el error y deshabilitar el botón mientras envía. Los campos se validan dentro de la acción, no solo en el HTML.
- **Un único mensaje de error: "Credenciales inválidas".** Se usa para email inexistente, contraseña incorrecta y datos mal formados. Si el email no existe, igual se corre `bcrypt.compare` contra un hash precalculado de costo 10, para que la respuesta tarde lo mismo y no se pueda averiguar qué emails están registrados midiendo tiempos.
- **Errores de la base en el login: mensaje propio, sin página de error.** Si la consulta del usuario falla (base caída, timeout, error de Prisma), la action `login` devuelve "No pudimos iniciar sesión. Probá de nuevo en unos minutos." en lugar de lanzar la excepción.
  - El mensaje es el mismo para cualquier email, así que no revela cuáles existen.
  - Se muestra con el mismo `role="alert"`, pero sin `aria-invalid` ni borde rojo en los campos: el problema no son los datos ingresados. El estado lleva un `kind` (`credentials` o `unavailable`) para distinguirlo.
  - El `try/catch` cubre solo la consulta. `bcrypt.compare`, `createSession` y `redirect` quedan afuera (`redirect` lanza una excepción interna de Next que el `catch` no debe atrapar).
  - Se registra con `console.error` solo el tipo de error, el código de Prisma y la causa del adaptador (por ejemplo `P1001` / `DatabaseNotReachable`). No se registra `error.message`, porque puede incluir el email o el host.
  - **Timeout de conexión de 8 s** (`CONNECTION_TIMEOUT_MS` en `src/lib/prisma.ts`, `connectionTimeoutMillis` del adaptador `pg`). Sin límite, `pg` espera lo que tarde el sistema operativo en abandonar una conexión que no responde (~20 s o más). Con 8 s el error llega antes del límite de duración de la función en Vercel y el usuario ve el mensaje. Una conexión nueva a la base real tardó ~1.4 s en las pruebas, lejos del límite.
- **El proxy es solo comodidad.** `src/proxy.ts` (Next 16 renombró `middleware` a `proxy`) verifica la firma del JWT, sin consultar la base, y redirige: sin sesión a `/login`, y con sesión de `/login` a `/home`. No excluye las rutas de assets de Next ni las que tienen extensión. La verificación real está en `src/lib/dal.ts` (`verifySession`, `getCurrentUser`), que se llama donde se leen los datos.
- **Limpieza de sesiones huérfanas por route handler.** Si el JWT es válido pero el usuario ya no existe, `/home` redirige a `/api/session/clear`, que borra la cookie y manda a `/login`. Hace falta ese paso porque en Next 16 un Server Component puede leer cookies pero no borrarlas.

- **Dinero en centavos (`Int`), nunca `float`.** `Card.balanceCents` y `Movement.amountCents`. Evita errores de redondeo; se formatea recién en la UI.
- **Saldo guardado en la tarjeta, no calculado.** `Card.balanceCents` se guarda tal cual y no se obtiene sumando movimientos. El diseño muestra un saldo que no sale de los 10 movimientos de ejemplo, y leerlo es una sola fila. La contra: si algún día se crean movimientos, hay que actualizar el saldo en la misma transacción para que no se desincronicen.
- **`amountCents` siempre positivo.** El signo (entra o sale plata) se deriva de `type`: `CASH_IN` suma; `CASH_OUT` y `SUS` restan. La base lo garantiza con un `CHECK ("amountCents" > 0)`, agregado a mano en la migración porque Prisma no modela CHECK.
- **La descripción del movimiento no se guarda.** "Pago de suscripción" y similares se derivan del tipo en la UI.
- **Una tarjeta por usuario.** `Card.userId` es `@unique`: la base lo garantiza y `getCardForUser` es un `findUnique`. Si hicieran falta varias, se quita con una migración chica.
- **`onDelete: Cascade` en tarjeta y movimientos.** Es una simplificación del challenge: borrar un usuario borra sus datos. En una billetera real los movimientos se conservarían (baja lógica del usuario, retención por auditoría).
- **Índice `(userId, occurredAt DESC)` en `Movement`.** Cubre las dos consultas del servicio: filtrar por usuario y ordenar del más nuevo al más viejo.
- **Servicio que recibe el `userId` como parámetro.** `src/server/movements.ts` (`getCardForUser`, `getRecentMovements`, `searchMovements`) filtra siempre por el `userId` que recibe. Quien lo llama lo obtiene de `verifySession()` en `src/lib/dal.ts`, nunca de un dato enviado por el cliente. Devuelve solo los campos que necesita la UI.
- **Búsqueda acotada y literal.** `q` se recorta y se limita a 50 caracteres, y busca con `contains` sin distinguir mayúsculas sobre el nombre. Prisma no escapa los comodines de `ILIKE` (se comprobó: `%` y `_` matcheaban todo), así que el servicio escapa `%`, `_` y `\` para que se busquen como texto. `type` solo filtra si es exactamente `SUS`, `CASH_IN` o `CASH_OUT`; cualquier otro valor se ignora.
- **Migraciones aditivas.** La base de Neon es la misma para local y producción, así que cada migración solo agrega (tablas, tipos, índices) y se aplica con `prisma migrate deploy`, que nunca resetea la base.
- **Capas: Server Component → servicio (`src/server`) → Prisma.** La Home obtiene el `userId` con `verifySession()` y pide nombre, tarjeta y movimientos en paralelo.
- **Tokens del Figma en `globals.css` con `@theme` de Tailwind 4.** Colores (`surface-1`, `granate`, `info`, `warning`, tintes al 15%, etc.), tamaños de texto (`text-display`, `text-title`, `text-body`, `text-detail`, `text-card`) y sombras. Se usan como clases (`bg-granate`, `text-display`) sin instalar nada extra. Se quitó el modo oscuro de la plantilla: el diseño es solo claro.
- **Route group `(app)` para las pantallas con sesión.** Su layout arma la columna de 414 px y la barra de navegación inferior. `/login` queda afuera, sin barra. Los paréntesis no cambian la URL.
- **Un solo mapa por tipo de movimiento.** `src/lib/movement-types.ts` define, para `SUS`, `CASH_IN` y `CASH_OUT`, la descripción, el ícono y los colores. Es un `Record` sobre el enum, así que si se agrega un tipo TypeScript obliga a completarlo.
- **Formatos en `src/lib/format.ts`.** Monto: "$125", o "$95.50" si tiene centavos. Saldo: siempre 2 decimales y separador de miles en formato en-US ("1,234.56"). Vencimiento: "02/30". El monto se muestra sin signo; el color indica si entra o sale plata.
- **Assets del Figma descargados a `public/icons/`.** No se usan las URLs temporales que entrega Figma. Varios SVG vienen recortados al trazo (por ejemplo, 18×20), así que el componente `Icon` los muestra a su tamaño real centrados en la caja del frame (24 o 28 px). La flecha de "Pago enviado" viene exportada hacia abajo y se gira 180° con CSS. El asset de la insignia USD es solo el fondo con degradé; el texto (la moneda de la tarjeta) se superpone en el código.
- **La tarjeta mide 348 px de ancho máximo y queda alineada a la izquierda.** Así está en el Figma (x=24). La columna tiene 366 px de contenido, así que la tarjeta es un poco más angosta que las filas. 
- **La tarjeta escala proporcionalmente.** El contenedor es un *container query* (`container-type: inline-size`) de ancho `min(100%, 348px)`. La tarjeta define `--u: calc(100cqw / 348)` (1/348 de ese ancho) y expresa cada posición, tamaño, radio y tamaño de letra como `calc(var(--u) * N)`, con los N en px del Figma: el logo, por ejemplo, va en `u(289), u(16)`. El alto sale de `aspect-ratio: 348 / 190`. A 348 px, `--u` vale 1px y el resultado es idéntico al diseño; en pantallas más angostas se achica todo junto, sin que nada se salga del borde. La sombra y el borde de 1px no escalan. El esqueleto de `loading.tsx` usa el mismo contenedor, así que no salta al cargar.
- **Un solo `error.tsx`, en `(app)/`, y usa `retry()`, no `reset()`.** Al estar junto al layout del grupo atrapa los errores de Home y de Movimientos y deja visible la barra. En Next 16.3+, `retry()` vuelve a pedir los datos y re-renderiza; `reset()` solo re-renderiza, así que un error de la base se repetiría.
- **El estado de Movimientos vive en la URL.** `?q=` y `?type=` sobreviven a un refresh, se pueden compartir y el Server Component los lee de `searchParams` (una Promise en Next 16). El filtrado lo hace `searchMovements` en el servidor; la página no agrega lógica propia.
- **Buscador con debounce y `router.replace`.** El input (`src/components/movement-search.tsx`) actualiza `?q=` 300 ms después de la última tecla, o enseguida con Enter, sin recargar la página. Usa `replace`, así escribir no llena el historial. Si el valor recortado ya es el `q` de la URL, no navega. Conserva `type` leyendo la URL en el momento de navegar. Sin JS, el form hace un GET normal y la búsqueda igual funciona.
- **Input y URL sincronizados sin bucles.** Si `q` cambia desde afuera ("Limpiar filtros", botón atrás), el input lo adopta. Si el cambio es la búsqueda que pidió el propio input, no lo toca, para no pisar lo que el usuario siguió escribiendo. El ajuste se hace durante el render, sin efectos, y nunca vuelve a escribir la URL.
- **Opacidad mientras busca.** El input y la lista comparten un `useTransition` por contexto (están separados por las pestañas). La lista baja al 50% mientras la navegación está pendiente.
- **Pestañas como links.** "Todos" más una por tipo, con la etiqueta (`filterLabel`) tomada del mapa central `movement-types.ts`. Cada `<Link>` conserva `q`, y la activa sale de la URL y lleva `aria-current="true"`. Las inactivas tienen borde transparente, para medir lo mismo que la activa y que la fila no salte. La fila se desplaza horizontalmente sin barra visible.
- **Largo máximo de búsqueda en un solo lugar.** `MAX_QUERY_LENGTH = 50` (`src/lib/search.ts`) lo usan el servicio, que recorta, y el input (`maxLength`).
- **Roboto Slab en lugar de Rockwell** en el buscador, porque Rockwell no está en Google Fonts. El placeholder dice "Search..." como en el Figma.
- **Login: solo cambió la capa visual.** `session.ts`, la action `login` y el proxy no se tocaron. Los placeholders del Figma ("Placeholder") se reemplazaron por "nombre@correo.com" y "Tu contraseña". El email usa `autocomplete="username"`, como recomiendan los gestores de contraseñas para el usuario de un login.
- **Botón para mostrar la contraseña.** Alterna `type="password"`/`"text"`, con etiqueta fija ("Mostrar contraseña") y `aria-pressed`. El Figma solo trae el ícono de "oculta" (`visibility_off`, Material Symbols Rounded); el de "visible" es su par de la misma familia (`visibility`, licencia Apache 2.0), dibujado a mano con el mismo gris y comparado lado a lado: mismo contorno (y=4 a 19), centro y grosor.
- **Rojo de error `danger` (`#B42318`).** El Figma no define un rojo. Contraste de ~6.5:1 sobre blanco y ~5.8:1 sobre el fondo gris. Es más vivo que el granate, así el borde de error no se confunde con el de foco. Con error, los inputs llevan `aria-invalid`, `aria-describedby` hacia el mensaje (`role="alert"`) y borde rojo hasta el próximo envío.
- **Desviación del Figma: tilde blanca en "Recordarme".** El Figma solo dice "granate al marcar". Una caja granate lisa no se lee claramente como marcada, así que se agregó una tilde blanca encima.
- **Dos duraciones de sesión según "Recordarme".** La action `login` lee `remember` y solo `"on"` cuenta como marcado.
  - **Marcado:** cookie persistente con `Max-Age` de 30 días (Next agrega también un `Expires` equivalente) y JWT que vence a los 30 días.
  - **Sin marcar:** cookie de sesión del navegador, sin `Max-Age` ni `Expires`, y JWT que vence a las 24 horas. Algunos navegadores restauran las cookies de sesión al reabrirse; el vencimiento del JWT asegura que el token muera igual.
  - `iat` y `exp` salen del mismo instante, así que `exp − iat` es exactamente la duración. `verifySession` y el proxy no cambiaron: siguen validando firma y vencimiento.
- **Avisos de `next/image` corregidos en el origen.** Next avisa "width or height modified" cuando solo uno de los dos tamaños renderizados (enteros) difiere de su atributo. Las flechas medían 19.798×20, así que siempre avisaban; ahora usan una caja de 20×20 con `object-contain` y el dibujo sigue en 19.798×20. Los íconos de la barra y el escudo del login usan `loading="eager"`, porque pueden ser el elemento más grande al cargar (LCP).

### Planeadas (todavía no implementadas)


### Estructura prevista

```
src/
  app/                  # rutas, loading.tsx, error.tsx, not-found.tsx
    (app)/              # pantallas con sesión: layout con la barra, home/, movimientos/
    actions/            # Server Actions (login, logout)
    login/              # fuera del grupo (app): sin barra de navegación
  components/           # CardView, MovementRow/MovementList, MovementFilters, SearchInput, BottomNav, Icon
  lib/                  # cliente de Prisma, sesión (JWT y cookie), DAL, formatos, mapa de tipos
  server/               # servicios de acceso a datos (movements.ts: tarjeta y movimientos)
  proxy.ts              # redirecciones según la sesión (solo comodidad)
  generated/prisma/     # cliente generado (ignorado por Git)
public/
  icons/                # SVG exportados del Figma
prisma/
  schema.prisma
  migrations/
```

## Problemas conocidos

**`prisma migrate` falla con `P1001: Can't reach database server`** aunque el puerto 5432 responda y el driver `pg` conecte.

- **Causa observada:** la red anuncia IPv6 pero no lo enruta hacia el puerto 5432 de Neon. El motor de migraciones de Prisma insiste en IPv6, mientras que `pg` prueba también IPv4 y conecta.
- **Solución:** desactivar IPv6 en el adaptador de red que se usa (en Windows, con PowerShell como administrador: `Disable-NetAdapterBinding -Name "Ethernet" -ComponentID ms_tcpip6`) o correr las migraciones desde otra red.
- **Para generar el SQL sin conexión:** `npx prisma migrate diff --from-schema <schema anterior> --to-schema prisma/schema.prisma --script` compara dos archivos de schema y no se conecta a la base. El schema anterior se saca con `git show HEAD:prisma/schema.prisma`. Aplicar la migración (`migrate deploy`) sí necesita conexión.
- **Alcance:** afecta solo al CLI de Prisma ejecutado desde esa máquina. La app desplegada se conecta desde los servidores de Vercel, y en desarrollo local la app usa `pg`, que conectó bien con IPv6 activo en las pruebas.

## Uso de herramientas de IA

**[Pendiente — completar con tus palabras]** Qué herramientas usaste, para qué partes y cómo revisaste lo que generaron. Declararlo en el README es mejor que dejar que lo descubran.

## Qué mejoraría con más tiempo

- Tests del servicio de movimientos y de las validaciones.
- Paginación o "cargar más" en la lista de movimientos.
- Búsqueda que ignore tildes: hoy "jose" no encuentra "José". Se resolvería con la extensión `unaccent` de Postgres o con una columna de nombre normalizado.
- Cachear el listado con Cache Components de Next 16, con invalidación.
- Límite de intentos en el login.
- Migrar a Prisma 8 cuando su documentación se estabilice.
- Integración continua (lint y build en cada pull request).
- Auditoría de accesibilidad.