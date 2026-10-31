# GranaBank — Challenge técnico

Web app de billetera para el club, siguiendo el [diseño de Figma](https://www.figma.com/design/GXEt9rIWDil8nQN8ewOrVD/Challenge-t%C3%A9cnico) del challenge.
Inicio de sesión, home con la tarjeta y los últimos movimientos, y una pantalla de movimientos con búsqueda y filtros.

- **Deploy:** https://pps-lanus-test.vercel.app
- **Repositorio:** https://github.com/Bauti-Daneri/pps-lanus-test
- **Usuario de prueba:** `soygranate@clublanus.com` / `GRANATE1@` (lo crea el seed; en la base se guarda solo el hash bcrypt)

## Funcionalidades

- **Login** (`/login`) con sesión y "Recordarme"; **Home** (`/home`) con saludo, tarjeta con saldo y últimos 5 movimientos.
- **Movimientos** (`/movimientos`) con búsqueda por nombre y filtros por tipo.
- **Detalle de movimiento** (`/movimientos/[id]`): no tiene diseño en el Figma, usa los tokens existentes.
- Todas las pantallas con datos tienen estados de carga, error (con reintento) y vacío.

## Stack

Next.js 16 (App Router), React 19 y TypeScript; Tailwind CSS 4 con los tokens del Figma; PostgreSQL en Neon con Prisma 7 y `@prisma/adapter-pg`; deploy en Vercel.

## Cómo correrlo

Requisitos: Node.js 20.9 o superior y una base PostgreSQL. Para las URLs, creá un proyecto gratis en [Neon](https://neon.com) (cadena *pooled* y directa) o usá un Postgres local.

1. Clonar: `git clone https://github.com/Bauti-Daneri/pps-lanus-test.git` y entrar a la carpeta: `cd pps-lanus-test`.
2. Crear `.env` en la raíz **antes de instalar** (el `postinstall` corre `prisma generate`):

   ```env
   DATABASE_URL="postgresql://USUARIO:CLAVE@HOST-pooler/neondb?sslmode=verify-full"
   DIRECT_URL="postgresql://USUARIO:CLAVE@HOST/neondb?sslmode=require"
   SESSION_SECRET="CADENA_ALEATORIA_DE_32_O_MAS_CARACTERES"
   ```

   `DATABASE_URL` es la *pooled* que usa la app (`verify-full` explícito); `DIRECT_URL` es la directa, en `require`, y la usan las migraciones. `SESSION_SECRET` firma los JWT (32+ caracteres): `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
3. Instalar dependencias: `npm install`
4. Aplicar las migraciones: `npx prisma migrate deploy`
5. Cargar el usuario de prueba, su tarjeta y sus movimientos: `npx prisma db seed` (idempotente: no duplica datos).
6. Levantar con `npm run dev` y abrir http://localhost:3000.

## Decisiones técnicas

1. **Un solo proyecto Next.js para front y back:** un solo deploy y sin CORS; se separaría con varios clientes o equipos.
2. **Dos cadenas de conexión a Neon:** la *pooled* (con el pooler de Neon) para la app y la directa para las migraciones.
3. **Autenticación a mano:** JWT en cookie `httpOnly` con solo el id de usuario, y "Recordarme" decide si dura 30 días o 24 horas; contra: no se puede revocar antes de que venza.
4. **Mensaje genérico en el login y hash ficticio cuando el email no existe**, para no revelar qué emails están registrados ni por el mensaje ni por el tiempo de respuesta.
5. **La verificación real de la sesión está en el DAL** (`src/lib/dal.ts`), donde se leen los datos; el proxy (`src/proxy.ts`) solo redirige por comodidad.
6. **Montos como enteros en centavos, siempre positivos.** Evita los errores de representación de los decimales. Un `CHECK` en la base exige que sean positivos, y el tipo del movimiento decide el signo, el texto, el ícono y el color desde un solo mapa.
7. **Saldo guardado en la tarjeta.** `Card.balanceCents` se guarda tal cual en lugar de sumar movimientos: el diseño muestra un saldo que no sale de los movimientos de ejemplo, y leerlo es una sola fila. Los movimientos son de solo lectura (vienen del seed): el diseño no incluye ningún flujo para crearlos. Contra: si se agregara ese flujo, habría que actualizar el saldo en la misma transacción para que no se desincronicen.
8. **Búsqueda y filtros en la URL (`?q=` y `?type=`), resueltos en el servidor:** sobreviven al refresh, se comparten y funciona el botón atrás; se escapan los comodines de `ILIKE` y la búsqueda se limita a 50 caracteres.
9. **El servicio filtra siempre por el `userId` de la sesión.** `src/server/movements.ts` recibe el `userId` de `verifySession()` y nunca de un dato del cliente. El detalle de un movimiento busca por `id` y por `userId` a la vez, así que uno ajeno y uno inexistente se ven igual (no se revela si existe).
10. **Errores de la base en el login:** se muestra un mensaje propio en vez de una página de error, con un timeout de conexión de 8 s para que el error llegue antes del límite de Vercel.

## Problema conocido

`prisma migrate` puede fallar con `P1001` si la red no enruta IPv6 hacia Neon.
Afecta solo al CLI de Prisma desde esa máquina; el deploy no está afectado.

## Uso de herramientas de IA

Usé **Claude Code** (el agente dentro de VS Code) para escribir la mayor parte del código bajo mi dirección, y **Claude** (chat) como asesor: para planificar, revisar los planes del agente y explicarme las decisiones técnicas.

Trabajé por tramos: en cada uno el agente proponía un plan que yo revisaba y aprobaba antes de que escribiera código. Probé el resultado de cada tramo en el navegador y, ya desplegado, en producción (login, cookies, búsqueda, filtros, estados de error), y resolví los problemas de entorno (IPv6, la red y la configuración del deploy en Vercel). Elegí JWT para la sesión porque ya lo había usado en otro proyecto, y detecté que el login no manejaba los errores de la base y pedí corregirlo. El resto de las decisiones técnicas las propuso la herramienta y las acepté después de pedir explicaciones.

No escribí el código línea por línea: revisé la estructura, el tamaño de los archivos y el comportamiento. Las reglas que le di al agente están en `CLAUDE.md` y `AGENTS.md`.

## Qué mejoraría con más tiempo

- Tests del servicio de movimientos y de las validaciones.
- Paginación en la lista de movimientos.
- Alta de movimientos, actualizando el saldo en la misma transacción.
- Búsqueda que ignore tildes (hoy "jose" no encuentra "José").
- Caché del listado con invalidación.
- Límite de intentos en el login.
- Integración continua (lint y build en cada pull request).
- Base separada para desarrollo y producción (hoy comparten la misma).
- Sesiones revocables (tabla de sesiones o lista de revocación).
