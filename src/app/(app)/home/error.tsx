"use client";

import { useEffect } from "react";

// `retry` (estable desde Next 16.3) vuelve a pedir los datos y re-renderiza;
// `reset` solo re-renderiza sin volver a pedirlos.
export default function HomeError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-4 rounded-3xl border border-border-1 bg-surface-3 p-6 text-center"
    >
      <p className="font-display text-title font-semibold">No pudimos cargar tus datos</p>
      <button
        type="button"
        onClick={() => retry()}
        className="cursor-pointer rounded-xl bg-granate px-6 py-3 text-body font-semibold text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
