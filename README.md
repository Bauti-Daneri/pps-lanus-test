# GranaBank — Challenge técnico

Web app de billetera para el club, siguiendo el [diseño de Figma](https://www.figma.com/design/GXEt9rIWDil8nQN8ewOrVD/Challenge-t%C3%A9cnico) del challenge: inicio de sesión, home con la tarjeta y los últimos movimientos, y una pantalla de movimientos con búsqueda y filtros rápidos.

- **Deploy:** https://pps-lanus-test.vercel.app
- **Repositorio:** https://github.com/Bauti-Daneri/pps-lanus-test

> **Estado: en desarrollo.** Hoy están resueltos la infraestructura (repo, deploy, base de datos y migración inicial) y el login con sesión, todavía sin el estilo del Figma. Lo que falta está marcado como `[Pendiente]` en cada sección.

## Estado del proyecto

- [x] Repo en GitHub y deploy automático en Vercel en cada push a `main`
- [x] Base PostgreSQL en Neon (región São Paulo)
- [x] Prisma 7 con el modelo `User` y la migración inicial
- [X] Seed con el usuario de prueba y contraseña hasheada
- [x] Login y sesión: login, logout, `/home` protegida y redirecciones del proxy (probado en local; en Vercel falta configurar `SESSION_SECRET`)
- [ ] Home: tarjeta y últimos movimientos
- [ ] Movimientos: búsqueda por nombre o servicio y filtros rápidos
- [ ] Estados de carga, error y vacío
- [ ] Fidelidad al Figma y responsive

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend y backend | Next.js 16 (App Router), React 19, TypeScript |
| Estilos | Tailwind CSS 4 |
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
   DATABASE_URL="postgresql://USUARIO:CLAVE@HOST-pooler/neondb?sslmode=require"
   DIRECT_URL="postgresql://USUARIO:CLAVE@HOST/neondb?sslmode=require"
   SESSION_SECRET="CADENA_ALEATORIA_DE_32_O_MAS_CARACTERES"
   ```

   - `DATABASE_URL`: conexión *pooled*, la que usa la app.
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
   npx prisma migrate dev
   ```

   En producción se usa `npx prisma migrate deploy`.

5. Cargar el usuario de prueba:

   ```bash
   npx prisma db seed
   ```

   Ejecuta `prisma/seed.ts` con `tsx` (registrado en `migrations.seed` de `prisma.config.ts`) y usa `DATABASE_URL`. Es idempotente: hace `upsert` por email, así que correrlo de nuevo no duplica el usuario.

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
| `/login` | Formulario de ingreso. Con sesión activa, el proxy redirige a `/home`. |
| `/home` | Protegida. Muestra el nombre del usuario y el botón para cerrar sesión. |
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
- **Sesión sin estado con JWT en cookie.** `src/lib/session.ts` firma un JWT con `jose` (HS256, `SESSION_SECRET`, vence a los 7 días) y lo guarda en la cookie `session`: `httpOnly`, `Secure` solo en producción, `SameSite=Lax`, `path=/` y la misma expiración que el JWT. La verificación exige `algorithms: ["HS256"]` explícito. El archivo importa `server-only` para que el build falle si alguien lo importa desde el navegador.
- **El JWT lleva solo el id del usuario.** Va en `sub`. El nombre y cualquier otro dato se leen de la base con ese id, así no quedan datos viejos en la cookie y un usuario borrado deja de tener acceso aunque su JWT siga vigente.
- **Login y logout como Server Actions.** `src/app/actions/auth.ts`. El formulario usa `useActionState` para mostrar el error y deshabilitar el botón mientras envía. Los campos se validan dentro de la acción, no solo en el HTML.
- **Un único mensaje de error: "Credenciales inválidas".** Se usa para email inexistente, contraseña incorrecta y datos mal formados. Si el email no existe, igual se corre `bcrypt.compare` contra un hash precalculado de costo 10, para que la respuesta tarde lo mismo y no se pueda averiguar qué emails están registrados midiendo tiempos.
- **El proxy es solo comodidad.** `src/proxy.ts` (Next 16 renombró `middleware` a `proxy`) verifica la firma del JWT, sin consultar la base, y redirige: sin sesión a `/login`, y con sesión de `/login` a `/home`. No excluye las rutas de assets de Next ni las que tienen extensión. La verificación real está en `src/lib/dal.ts` (`verifySession`, `getCurrentUser`), que se llama donde se leen los datos.
- **Limpieza de sesiones huérfanas por route handler.** Si el JWT es válido pero el usuario ya no existe, `/home` redirige a `/api/session/clear`, que borra la cookie y manda a `/login`. Hace falta ese paso porque en Next 16 un Server Component puede leer cookies pero no borrarlas.

### Planeadas (todavía no implementadas)

- Toda consulta de tarjetas y movimientos filtra por el usuario de la sesión, nunca por un id enviado desde el cliente.
- Dinero guardado en centavos (enteros), nunca como `float`.
- Capas: route handler → servicio → ORM.
- Búsqueda y filtros en el servidor, con parámetros en la URL (`?q=`), para que sobrevivan a un refresh.

### Estructura prevista

```
src/
  app/                  # rutas, loading.tsx, error.tsx, not-found.tsx
    actions/            # Server Actions (login, logout)
  components/           # UI reutilizable y componentes de movimientos
  lib/                  # cliente de Prisma, sesión (JWT y cookie), DAL
  server/               # servicios de acceso a datos
  proxy.ts              # redirecciones según la sesión (solo comodidad)
  generated/prisma/     # cliente generado (ignorado por Git)
prisma/
  schema.prisma
  migrations/
```

## Problemas conocidos

**`prisma migrate` falla con `P1001: Can't reach database server`** aunque el puerto 5432 responda y el driver `pg` conecte.

- **Causa observada:** la red anuncia IPv6 pero no lo enruta hacia el puerto 5432 de Neon. El motor de migraciones de Prisma insiste en IPv6, mientras que `pg` prueba también IPv4 y conecta.
- **Solución:** desactivar IPv6 en el adaptador de red que se usa (en Windows, con PowerShell como administrador: `Disable-NetAdapterBinding -Name "Ethernet" -ComponentID ms_tcpip6`) o correr las migraciones desde otra red.
- **Alcance:** afecta solo al CLI de Prisma ejecutado desde esa máquina. La app desplegada se conecta desde los servidores de Vercel, y en desarrollo local la app usa `pg`, que conectó bien con IPv6 activo en las pruebas.

## Uso de herramientas de IA

**[Pendiente — completar con tus palabras]** Qué herramientas usaste, para qué partes y cómo revisaste lo que generaron. Declararlo en el README es mejor que dejar que lo descubran.

## Qué mejoraría con más tiempo

- Tests del servicio de movimientos y de las validaciones.
- Paginación o "cargar más" en la lista de movimientos.
- Cachear el listado con Cache Components de Next 16, con invalidación.
- Límite de intentos en el login.
- Migrar a Prisma 8 cuando su documentación se estabilice.
- Integración continua (lint y build en cada pull request).
- Auditoría de accesibilidad.