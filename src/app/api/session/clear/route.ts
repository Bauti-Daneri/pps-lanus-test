import { redirect } from "next/navigation";
import { deleteSession } from "@/lib/session";

// Destino de getCurrentUser cuando el JWT apunta a un usuario que ya no existe.
// El logout normal es la Server Action `logout`, no esta ruta.
export async function GET() {
  await deleteSession();
  redirect("/login");
}
