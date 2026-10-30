"use client";

import {
  createContext,
  use,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
  type TransitionStartFunction,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MAX_QUERY_LENGTH } from "@/lib/search";
import { Icon } from "./icon";

const DEBOUNCE_MS = 300;

// El input y la lista no son vecinos (las pestañas quedan en el medio), así
// que comparten la transición por contexto: el input la inicia y la lista
// baja su opacidad mientras está pendiente.
type SearchTransition = {
  isPending: boolean;
  startTransition: TransitionStartFunction;
};

const SearchTransitionContext = createContext<SearchTransition | null>(null);

function useSearchTransition() {
  const context = use(SearchTransitionContext);
  if (!context) {
    throw new Error("Falta <MovementSearchProvider> alrededor del buscador");
  }
  return context;
}

export function MovementSearchProvider({ children }: { children: ReactNode }) {
  const [isPending, startTransition] = useTransition();
  return (
    <SearchTransitionContext value={{ isPending, startTransition }}>
      {children}
    </SearchTransitionContext>
  );
}

export function PendingFade({ children }: { children: ReactNode }) {
  const { isPending } = useSearchTransition();
  return (
    <div
      aria-busy={isPending}
      className={`transition-opacity ${isPending ? "opacity-50" : ""}`}
    >
      {children}
    </div>
  );
}

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startTransition } = useSearchTransition();
  const urlQuery = searchParams.get("q") ?? "";
  const urlType = searchParams.get("type");

  const [value, setValue] = useState(urlQuery);
  // Último q (recortado) que pidió este input, o que adoptó de la URL.
  const [requested, setRequested] = useState(urlQuery.trim());
  // q de la URL en el render anterior, para detectar cuándo cambió.
  const [seenUrlQuery, setSeenUrlQuery] = useState(urlQuery);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // URL -> input. Se ajusta durante el render (sin efectos), así que no hay
  // bucle: solo corre cuando el q de la URL cambió, y no vuelve a escribir la
  // URL. Si el q nuevo es el que pidió este mismo input, no se toca `value`:
  // el usuario pudo seguir escribiendo mientras llegaba esa búsqueda. Solo se
  // adopta un q que vino de afuera ("Limpiar filtros", botón atrás).
  if (urlQuery !== seenUrlQuery) {
    setSeenUrlQuery(urlQuery);
    if (urlQuery.trim() !== requested) {
      setValue(urlQuery);
      setRequested(urlQuery.trim());
    }
  }

  useEffect(() => {
    const pending = timer;
    return () => clearTimeout(pending.current);
  }, []);

  // Input -> URL.
  function search(raw: string) {
    clearTimeout(timer.current);
    const query = raw.trim();
    // La URL actual (no la de este render) conserva un `type` elegido durante
    // los últimos 300 ms.
    const params = new URLSearchParams(window.location.search);
    if (query === (params.get("q") ?? "").trim()) return;

    if (query) params.set("q", query);
    else params.delete("q");
    setRequested(query);

    const qs = params.toString();
    // replace: escribir no agrega entradas al historial.
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    // Sin JS, el form hace un GET normal con q (y type), así que igual busca.
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        search(value);
      }}
      className="flex items-center gap-1.5 rounded-xl border border-border-2 bg-surface-3 px-3.5 py-2 focus-within:border-granate"
    >
      <Icon src="/icons/search-small.svg" width={18} height={18} box={18} />
      <input
        type="text"
        name="q"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => search(next), DEBOUNCE_MS);
        }}
        maxLength={MAX_QUERY_LENGTH}
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Search..."
        aria-label="Buscar movimientos"
        className="min-w-0 flex-1 bg-transparent font-display text-body text-text-primary outline-none placeholder:text-text-medium"
      />
      {urlType && <input type="hidden" name="type" value={urlType} />}
    </form>
  );
}
