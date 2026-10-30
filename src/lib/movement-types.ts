import type { MovementType } from "@/generated/prisma/enums";

type MovementTypeStyle = {
  label: string;
  // Etiqueta de la pestaña de filtro en /movimientos.
  filterLabel: string;
  icon: { src: string; width: number; height: number };
  // Clases extra para el ícono (p. ej. girarlo).
  iconClassName?: string;
  tintClassName: string;
  amountClassName: string;
};

// Único lugar donde se decide cómo se ve cada tipo de movimiento. Al ser un
// Record sobre el enum, TypeScript exige una entrada por cada tipo.
export const MOVEMENT_TYPES: Record<MovementType, MovementTypeStyle> = {
  SUS: {
    label: "Pago de suscripción",
    filterLabel: "Suscripción",
    icon: { src: "/icons/subscriptions.svg", width: 18, height: 20 },
    tintClassName: "bg-info-tint",
    amountClassName: "text-info",
  },
  CASH_IN: {
    label: "Pago recibido",
    filterLabel: "Recibido",
    icon: { src: "/icons/arrow-down.svg", width: 19.798, height: 20 },
    tintClassName: "bg-granate-tint",
    amountClassName: "text-granate",
  },
  CASH_OUT: {
    label: "Pago enviado",
    filterLabel: "Enviado",
    // El asset exportado del Figma apunta hacia abajo; en el diseño se ve
    // girado 180° (hacia arriba).
    icon: { src: "/icons/arrow-up.svg", width: 19.798, height: 20 },
    iconClassName: "rotate-180",
    tintClassName: "bg-warning-tint",
    amountClassName: "text-warning",
  },
};
