import { BottomNav } from "@/components/bottom-nav";

// Columna de 414 px (el ancho del Figma) para las pantallas con sesión. El
// padding inferior (86 de la barra + 24) evita que la barra tape la última fila.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-[414px] flex-1 flex-col gap-6 px-6 pb-[110px] pt-12">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
