import { MovementRowSkeleton } from "@/components/movement-row";

// Esqueleto con las mismas medidas que la pantalla real: título, buscador,
// pestañas y 6 filas.
export default function MovimientosLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex animate-pulse flex-col gap-6">
      <div className="h-7 w-40 rounded bg-border-2" />
      <div className="h-9 rounded-xl border border-border-2 bg-surface-3" />
      <div className="flex gap-1 overflow-hidden">
        {[66, 108, 94, 86].map((width) => (
          <div key={width} className="h-9 shrink-0 rounded-full bg-border-2" style={{ width }} />
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <MovementRowSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
