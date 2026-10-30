import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("Falta la variable de entorno SESSION_SECRET");
}
if (secret.length < 32) {
  throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
}
const key = new TextEncoder().encode(secret);

export const SESSION_COOKIE_NAME = "session";
// "Recordarme" marcado: cookie persistente y JWT de 30 días.
const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
// Sin marcar: cookie de sesión del navegador y JWT de 24 horas, para que el
// token venza aunque el navegador restaure la cookie al reabrirse.
const SESSION_SECONDS = 24 * 60 * 60;

export type Session = { userId: string };

// Guarda en la cookie un JWT firmado que solo lleva el id del usuario (en
// `sub`). El resto de los datos se leen de la base cuando se necesitan.
export async function createSession(userId: string, remember: boolean) {
  const duration = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
  // Un solo instante para iat y exp: exp - iat es exactamente `duration`.
  const issuedAt = Math.floor(Date.now() / 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + duration)
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Sin maxAge la cookie es de sesión (el navegador la borra al cerrarse).
    // Con maxAge, Next agrega también un Expires equivalente.
    ...(remember && { maxAge: REMEMBER_SECONDS }),
  });
}

// Devuelve null si el token falta, está vencido, mal firmado o usa otro
// algoritmo. No consulta la base, así que también sirve en el proxy.
export async function verifySessionToken(
  token: string | undefined,
): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return typeof payload.sub === "string" ? { userId: payload.sub } : null;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
