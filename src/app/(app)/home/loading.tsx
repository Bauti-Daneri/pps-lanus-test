import { CardSkeleton } from "@/components/card-view";
import { MovementRowSkeleton } from "@/components/movement-row";

// Esqueleto con las mismas medidas que la Home real, para que no salte al cargar.
export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex animate-pulse flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="h-[18px] w-10 rounded bg-border-2" />
          <div className="h-7 w-32 rounded bg-border-2" />
        </div>
        <div className="flex gap-4">
          <div className="size-6 rounded-full bg-border-2" />
          <div className="size-6 rounded-full bg-border-2" />
        </div>
      </div>

      <CardSkeleton />

      <div className="flex flex-col gap-6">
        <div className="h-6 w-48 rounded bg-border-2" />
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <MovementRowSkeleton key={i} />
          ))}
        </ul>
      </div>
    </div>
  );
}
