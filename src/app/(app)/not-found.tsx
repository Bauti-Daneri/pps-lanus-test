import Link from "next/link";

// Lo muestra notFound() en las páginas del grupo (app), hoy el detalle de un
// movimiento. Un movimiento ajeno y uno inexistente terminan acá por igual.
export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-border-1 bg-surface-3 p-6 text-center">
      {/* Un not-found dentro de un route group no admite `export const
          metadata` (solo el de la raíz); React 19 lleva este <title> al <head>. */}
      <title>Movimiento no encontrado</title>
      <h1 className="font-display text-title font-semibold">No encontramos ese movimiento</h1>
      <p className="text-detail font-medium text-text-medium">
        Puede que el enlace esté incompleto o que el movimiento no exista.
      </p>
      <Link href="/movimientos" className="text-body font-semibold text-granate underline">
        Ir a movimientos
      </Link>
    </div>
  );
}
