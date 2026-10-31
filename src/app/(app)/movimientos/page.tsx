import Link from "next/link";
import { MovementFilters, activeFilterType } from "@/components/movement-filters";
import { MovementList } from "@/components/movement-row";
import {
  MovementSearchProvider,
  PendingFade,
  SearchInput,
} from "@/components/movement-search";
import { verifySession } from "@/lib/dal";
import { firstParam } from "@/lib/search";
import { searchMovements } from "@/server/movements";

export default async function MovimientosPage({
  searchParams,
}: PageProps<"/movimientos">) {
  const { userId } = await verifySession();
  const params = await searchParams;
  const q = firstParam(params.q);
  const type = firstParam(params.type);

  // El servicio valida type, recorta q y escapa los comodines.
  const movements = await searchMovements(userId, { q, type });
  const isFiltered = Boolean(q?.trim()) || activeFilterType(type) !== undefined;

  return (
    <MovementSearchProvider>
      <h1 className="font-display text-display font-semibold">Movimientos</h1>
      <SearchInput />
      <MovementFilters q={q} type={type} />
      <PendingFade>
        {movements.length === 0 && isFiltered ? (
          <FilteredEmpty />
        ) : (
          <MovementList movements={movements} query={{ q, type }} />
        )}
      </PendingFade>
    </MovementSearchProvider>
  );
}

function FilteredEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border-1 bg-surface-3 p-6 text-center">
      <p className="text-body font-semibold">No encontramos movimientos</p>
      <p className="text-detail font-medium text-text-medium">
        Probá con otro nombre o filtro
      </p>
      <Link href="/movimientos" className="text-body font-semibold text-granate underline">
        Limpiar filtros
      </Link>
    </div>
  );
}
