// Esqueleto con las mismas medidas que el detalle. Sin este archivo se vería
// el de la lista (movimientos/loading.tsx), que también envuelve a [id].
export default function MovementDetailLoading() {
  return (
    <div aria-busy="true" aria-label="Cargando" className="flex animate-pulse flex-col gap-6">
      <div className="h-[18px] w-44 rounded bg-border-2" />
      <div className="h-7 w-60 rounded bg-border-2" />

      <div className="flex flex-col items-start gap-3 rounded-2xl border border-border-1 bg-surface-3 p-6">
        <div className="size-14 rounded-2xl bg-border-2" />
        <div className="flex flex-col gap-0.5">
          <div className="h-6 w-32 rounded bg-border-2" />
          <div className="h-[18px] w-36 rounded bg-border-2" />
        </div>
        <div className="h-[30px] w-20 rounded bg-border-2" />
      </div>

      <div className="divide-y divide-border-1 rounded-2xl border border-border-1 bg-surface-3 px-6">
        {["w-24", "w-40", "w-14"].map((width) => (
          <div key={width} className="flex items-center justify-between gap-4 py-4">
            <div className="h-[18px] w-14 rounded bg-border-2" />
            <div className={`h-[18px] ${width} rounded bg-border-2`} />
          </div>
        ))}
      </div>
    </div>
  );
}
