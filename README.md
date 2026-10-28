# GranaBank — Challenge técnico

Web app de billetera para el club, siguiendo el [diseño de Figma](https://www.figma.com/design/GXEt9rIWDil8nQN8ewOrVD/Challenge-t%C3%A9cnico) del challenge: inicio de sesión, home con la tarjeta y los últimos movimientos, y una pantalla de movimientos con búsqueda y filtros rápidos.

- **Deploy:** https://pps-lanus-test.vercel.app
- **Repositorio:** https://github.com/Bauti-Daneri/pps-lanus-test

> **Estado: en desarrollo.** Hoy está resuelta la infraestructura (repo, deploy, base de datos y migración inicial). Lo que falta está marcado como `[Pendiente]` en cada sección.

## Estado del proyecto

- [x] Repo en GitHub y deploy automático en Vercel en cada push a `main`
- [x] Base PostgreSQL en Neon (región São Paulo)
- [x] Prisma 7 con el modelo `User` y la migración inicial
- [ ] Seed con el usuario de prueba y contraseña hasheada
- [ ] Login y sesión
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
   ```

   - `DATABASE_URL`: conexión *pooled*, la que usa la app.
   - `DIRECT_URL`: conexión directa, la que usan las migraciones.
   - Con una base local, las dos pueden ser la misma URL.

3. Instalar dependencias:

   ```bash
   npm install
   ```

4. Aplicar las migraciones:

   ```bash
   npx prisma migrate dev
   ```

   En producción se usa `npx prisma migrate deploy`.

5. Levantar el servidor de desarrollo y abrir http://localhost:3000:

   ```bash
   npm run dev
   ```

**[Pendiente]** Seed de datos: `npx prisma db seed`.

### Usuario de prueba

Según la consigna del challenge:

- Email: `soygranate@clublanus.com`
- Contraseña: `GRANATE1@`

**[Pendiente]** Se cargará con el seed.

### Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |

## Decisiones técnicas

### Tomadas

- **Un solo proyecto Next.js para frontend y backend.** Route handlers y Server Components, sin servidor aparte. Evita un segundo deploy, CORS y configuración duplicada, y la consigna lo permite.
- **Prisma 7 fijado, no la 8.** La versión 8 reorganizó hace poco su CLI y su documentación; elegí la versión con documentación y ejemplos estables. Migrar a la 8 queda como mejora.
- **Dos cadenas de conexión a Neon.** La *pooled* para la app, porque en un entorno serverless se abren muchas conexiones cortas; la directa para las migraciones, porque el pooler puede interferir con operaciones de esquema.
- **Cliente de Prisma generado fuera de Git.** Vive en `src/generated/prisma`, está en `.gitignore` y se genera en el `postinstall`, también en Vercel.
- **Autenticación implementada a mano.** Se desactivó el servicio de auth gestionado que ofrece Neon para entender y poder explicar el flujo de sesión.

### Planeadas (todavía no implementadas)

- Contraseñas con `bcrypt` y sesión con JWT firmado en una cookie `httpOnly`.
- La sesión se verifica donde se leen los datos, no solo en el middleware.
- Toda consulta de tarjetas y movimientos filtra por el usuario de la sesión, nunca por un id enviado desde el cliente.
- Dinero guardado en centavos (enteros), nunca como `float`.
- Capas: route handler → servicio → ORM.
- Búsqueda y filtros en el servidor, con parámetros en la URL (`?q=`), para que sobrevivan a un refresh.

### Estructura prevista

```
src/
  app/                  # rutas, loading.tsx, error.tsx, not-found.tsx
  components/           # UI reutilizable y componentes de movimientos
  lib/                  # cliente de Prisma, validaciones, sesión
  server/               # servicios de acceso a datos
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