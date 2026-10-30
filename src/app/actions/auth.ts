"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = { error: string } | undefined;

const INVALID_CREDENTIALS: LoginState = { error: "Credenciales inválidas" };

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

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

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
