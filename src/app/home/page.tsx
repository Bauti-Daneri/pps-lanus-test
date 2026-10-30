import { logout } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/dal";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Hola, {user.name}</h1>
      <form action={logout}>
        <button
          type="submit"
          className="rounded border border-zinc-300 px-4 py-2"
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
