import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Solo comodidad: redirige antes de renderizar según si hay un JWT válido en la
// cookie. No consulta la base. La verificación real está en src/lib/dal.ts,
// que se llama donde se leen los datos.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (pathname === "/login") {
    return session
      ? NextResponse.redirect(new URL("/home", request.url))
      : NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Excluye los assets de Next y cualquier ruta con extensión (favicon, svg...).
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
