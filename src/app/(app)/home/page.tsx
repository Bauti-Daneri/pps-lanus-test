import Link from "next/link";
import { CardView } from "@/components/card-view";
import { Icon } from "@/components/icon";
import { MovementList } from "@/components/movement-row";
import { getCurrentUser, verifySession } from "@/lib/dal";
import { getCardForUser, getRecentMovements } from "@/server/movements";

export default async function HomePage() {
  const { userId } = await verifySession();
  // getCurrentUser redirige a /api/session/clear si el usuario ya no existe.
  const [user, card, movements] = await Promise.all([
    getCurrentUser(),
    getCardForUser(userId),
    getRecentMovements(userId, 5),
  ]);

  return (
    <>
      <header className="flex items-center justify-between">
        <div className="flex flex-col">
          <p className="text-body font-medium text-text-medium">Hola</p>
          <h1 className="font-display text-display font-semibold">{user.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/movimientos" aria-label="Buscar movimientos">
            <Icon src="/icons/search.svg" width={24} height={24} box={24} />
          </Link>
          <button type="button" aria-label="Notificaciones" className="cursor-pointer">
            <Icon src="/icons/bell.svg" width={18.5789} height={21.5798} box={24} />
          </button>
        </div>
      </header>

      <CardView card={card} />

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-title font-semibold">Últimos movimientos</h2>
        <MovementList movements={movements} />
      </section>
    </>
  );
}
