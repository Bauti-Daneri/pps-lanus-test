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

      <div className="h-[190px] w-full max-w-[348px] rounded-3xl bg-border-2" />

      <div className="flex flex-col gap-6">
        <div className="h-6 w-48 rounded bg-border-2" />
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <li
              key={i}
              className="flex h-[76px] items-center gap-4 rounded-2xl border border-border-1 bg-surface-3 p-4"
            >
              <div className="size-11 shrink-0 rounded-xl bg-border-2" />
              <div className="flex flex-1 flex-col gap-0.5">
                <div className="h-[18px] w-28 rounded bg-border-2" />
                <div className="h-[15px] w-20 rounded bg-border-2" />
              </div>
              <div className="h-[18px] w-12 rounded bg-border-2" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
