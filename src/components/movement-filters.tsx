import Link from "next/link";
import type { MovementType } from "@/generated/prisma/enums";
import { MOVEMENT_TYPES } from "@/lib/movement-types";
import { movementsQueryString } from "@/lib/search";

// "Todos" más una pestaña por tipo, en el orden del mapa central.
const TABS: { label: string; type?: MovementType }[] = [
  { label: "Todos" },
  ...(Object.keys(MOVEMENT_TYPES) as MovementType[]).map((type) => ({
    label: MOVEMENT_TYPES[type].filterLabel,
    type,
  })),
];

// El tipo que filtra de verdad: un `type` ausente o inválido equivale a
// "Todos", igual que en searchMovements, que lo ignora.
export function activeFilterType(type: string | undefined) {
  return TABS.find((tab) => tab.type !== undefined && tab.type === type)?.type;
}

export function MovementFilters({ q, type }: { q?: string; type?: string }) {
  const active = activeFilterType(type);

  return (
    <nav
      aria-label="Filtrar por tipo"
      className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {TABS.map((tab) => {
        const isActive = tab.type === active;
        return (
          <Link
            key={tab.label}
            href={`/movimientos${movementsQueryString({ q: q?.trim(), type: tab.type })}`}
            scroll={false}
            aria-current={isActive ? "true" : undefined}
            // Borde transparente en las inactivas: misma medida que la activa,
            // así la fila no salta al cambiar de pestaña.
            className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-body font-semibold ${
              isActive
                ? "border-granate bg-granate-tint text-granate"
                : "border-transparent text-text-medium"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
