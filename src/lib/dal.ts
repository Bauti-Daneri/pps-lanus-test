import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Verificación real de la sesión: se llama donde se leen los datos, no se
// confía solo en el proxy. `cache` evita repetir el trabajo en un mismo render.
export const verifySession = cache(async () => {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
});

export const getCurrentUser = cache(async () => {
  const { userId } = await verifySession();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true },
  });
  if (!user) {
    // El JWT es válido pero el usuario ya no existe. Un Server Component no
    // puede borrar cookies, así que lo hace el route handler.
    redirect("/api/session/clear");
  }
  return user;
});
