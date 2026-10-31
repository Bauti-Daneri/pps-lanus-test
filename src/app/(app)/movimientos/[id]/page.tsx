import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/icon";
import { verifySession } from "@/lib/dal";
import { formatAmount, formatDateTime } from "@/lib/format";
import { MOVEMENT_TYPES } from "@/lib/movement-types";
import { firstParam, movementsQueryString } from "@/lib/search";
import { getMovementForUser } from "@/server/movements";

// Sin diseño en el Figma: usa los tokens y componentes existentes.
export default async function MovementDetailPage({
  params,
  searchParams,
}: PageProps<"/movimientos/[id]">) {
  const { userId } = await verifySession();
  const [{ id }, query] = await Promise.all([params, searchParams]);

  // Ajeno o inexistente dan el mismo null, y el mismo not-found.
  const movement = await getMovementForUser(userId, id);
  if (!movement) notFound();

  const style = MOVEMENT_TYPES[movement.type];
  const { date, time } = formatDateTime(movement.occurredAt);
  // Desde Home vuelve a /home; si no, a /movimientos con los filtros con los
  // que se entró. `from` solo se compara, nunca se usa para armar el link.
  const fromHome = firstParam(query.from) === "home";
  const back = fromHome
    ? { href: "/home", label: "← Volver al inicio" }
    : {
        href: `/movimientos${movementsQueryString({
          q: firstParam(query.q),
          type: firstParam(query.type),
        })}`,
        label: "← Volver a movimientos",
      };

  return (
    <>
      <Link href={back.href} className="self-start text-body font-semibold text-granate">
        {back.label}
      </Link>
      <h1 className="font-display text-display font-semibold">Detalle del movimiento</h1>

      <section
        aria-label="Movimiento"
        className="flex flex-col items-start gap-3 rounded-2xl border border-border-1 bg-surface-3 p-6"
      >
        <span
          className={`flex size-14 items-center justify-center rounded-2xl ${style.tintClassName}`}
        >
          <Icon {...style.icon} box={24} className={style.iconClassName} />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-title font-semibold">{movement.name}</p>
          <p className="text-body font-medium text-text-medium">{style.label}</p>
        </div>
        <p className={`text-display font-semibold ${style.amountClassName}`}>
          {formatAmount(movement.amountCents)}
        </p>
      </section>

      <dl className="divide-y divide-border-1 rounded-2xl border border-border-1 bg-surface-3 px-6">
        <DetailRow label="Tipo">{style.filterLabel}</DetailRow>
        <DetailRow label="Fecha">
          <time dateTime={movement.occurredAt.toISOString()}>{date}</time>
        </DetailRow>
        <DetailRow label="Hora">{time}</DetailRow>
      </dl>
    </>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <dt className="text-body font-medium text-text-medium">{label}</dt>
      <dd className="text-right text-body font-semibold">{children}</dd>
    </div>
  );
}
