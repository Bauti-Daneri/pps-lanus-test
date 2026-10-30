import type { MovementItem } from "@/server/movements";
import { formatAmount } from "@/lib/format";
import { MOVEMENT_TYPES } from "@/lib/movement-types";
import { Icon } from "./icon";

export function MovementRow({ movement }: { movement: MovementItem }) {
  const style = MOVEMENT_TYPES[movement.type];

  return (
    <li className="flex h-[76px] items-center gap-4 rounded-2xl border border-border-1 bg-surface-3 p-4">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${style.tintClassName}`}
      >
        <Icon {...style.icon} box={24} className={style.iconClassName} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-body font-semibold">{movement.name}</p>
        <p className="truncate text-detail font-medium text-text-medium">{style.label}</p>
      </div>
      <p className={`shrink-0 text-body font-semibold ${style.amountClassName}`}>
        {formatAmount(movement.amountCents)}
      </p>
    </li>
  );
}

// Misma caja que MovementRow, para los loading.tsx de Home y Movimientos.
export function MovementRowSkeleton() {
  return (
    <li className="flex h-[76px] items-center gap-4 rounded-2xl border border-border-1 bg-surface-3 p-4">
      <div className="size-11 shrink-0 rounded-xl bg-border-2" />
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="h-[18px] w-28 rounded bg-border-2" />
        <div className="h-[15px] w-20 rounded bg-border-2" />
      </div>
      <div className="h-[18px] w-12 rounded bg-border-2" />
    </li>
  );
}

export function MovementList({ movements }: { movements: MovementItem[] }) {
  if (movements.length === 0) {
    return (
      <p className="rounded-2xl border border-border-1 bg-surface-3 p-4 text-center text-body font-medium text-text-medium">
        Todavía no tenés movimientos.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {movements.map((movement) => (
        <MovementRow key={movement.id} movement={movement} />
      ))}
    </ul>
  );
}
