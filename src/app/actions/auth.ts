"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// `kind` le dice al formulario si el problema son los datos ingresados
// (marca los campos) o el servicio (no los marca).
export type LoginState =
  | { error: string; kind: "credentials" | "unavailable" }
  | undefined;

const INVALID_CREDENTIALS: LoginState = {
  error: "Credenciales inválidas",
  kind: "credentials",
};
// Mismo texto para cualquier email: no revela si existe.
const SERVICE_UNAVAILABLE: LoginState = {
  error: "No pudimos iniciar sesión. Probá de nuevo en unos minutos.",
  kind: "unavailable",
};

// Hash bcrypt real (costo 10, igual que el seed) de un valor aleatorio
// descartado. Se compara contra él cuando el email no existe, para que esa
// respuesta tarde lo mismo que una contraseña incorrecta.
const DUMMY_PASSWORD_HASH =
  "$2b$10$PFJ2yWTg/NrM3ECV8YL7SuWvdGdlbSrk4DOLBoPVO1TvMtHW8VqPG";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
// bcrypt solo usa los primeros 72 bytes de la contraseña.
const MAX_PASSWORD_BYTES = 72;

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const rawEmail = formData.get("email");
  const password = formData.get("password");

  if (typeof rawEmail !== "string" || typeof password !== "string") {
    return INVALID_CREDENTIALS;
  }

  const email = rawEmail.trim().toLowerCase();
  if (
    !EMAIL_PATTERN.test(email) ||
    email.length > MAX_EMAIL_LENGTH ||
    password.length === 0 ||
    Buffer.byteLength(password) > MAX_PASSWORD_BYTES
  ) {
    return INVALID_CREDENTIALS;
  }

  // Solo la consulta va en el try: bcrypt (que iguala los tiempos),
  // createSession y sobre todo redirect, que lanza una excepción interna de
  // Next, quedan afuera.
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, passwordHash: true },
    });
  } catch (error) {
    // Sin error.message: puede incluir los argumentos (el email) o el host.
    const { name, code, meta } = error as {
      name?: string;
      code?: string;
      meta?: { driverAdapterError?: { cause?: { kind?: string } } };
    };
    console.error("login: falló la consulta a la base", {
      name,
      code,
      kind: meta?.driverAdapterError?.cause?.kind,
    });
    return SERVICE_UNAVAILABLE;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
  );
  if (!user || !passwordMatches) {
    return INVALID_CREDENTIALS;
  }

  // El checkbox sin `value` envía "on"; cualquier otro valor o su ausencia es
  // "no marcado".
  const remember = formData.get("remember") === "on";
  await createSession(user.id, remember);
  redirect("/home");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
