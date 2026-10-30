import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Sin límite, pg espera lo que tarde el sistema operativo en abandonar una
// conexión que no responde (~20 s o más). Con 8 s el error llega antes del
// límite de duración de la función en Vercel y se puede mostrar un mensaje.
const CONNECTION_TIMEOUT_MS = 8000;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    }),
  });
}

// En desarrollo el hot reload re-evalúa los módulos; guardar la instancia en
// globalThis evita abrir un pool de conexiones nuevo en cada recarga.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
