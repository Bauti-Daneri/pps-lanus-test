import { verifySession } from "@/lib/dal";

// Pendiente (tramo 4b): búsqueda y filtros. Por ahora solo existe para que la
// lupa y la barra de navegación no lleven a un 404.
export default async function MovimientosPage() {
  await verifySession();

  return (
    <>
      <h1 className="font-display text-display font-semibold">Movimientos</h1>
      <p className="text-body font-medium text-text-medium">Próximamente</p>
    </>
  );
}
