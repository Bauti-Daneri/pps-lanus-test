// Largo máximo de la búsqueda de movimientos. Lo usan el servicio (recorta) y
// el input (maxLength), para que no puedan quedar distintos.
export const MAX_QUERY_LENGTH = 50;

// `from` solo admite "home": marca que al detalle se entró desde Home.
export type MovementsQuery = { q?: string; type?: string; from?: "home" };

// "?q=...&type=..." para volver a /movimientos con los mismos filtros (o ""
// si no hay). Con URLSearchParams, que escapa los valores.
export function movementsQueryString({ q, type, from }: MovementsQuery) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type) params.set("type", type);
  if (from) params.set("from", from);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

// Un parámetro repetido (?q=a&q=b) llega como array: se usa el primero.
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
