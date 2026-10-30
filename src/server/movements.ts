import "server-only";
import { prisma } from "@/lib/prisma";
import { MovementType, type Prisma } from "@/generated/prisma/client";
import { MAX_QUERY_LENGTH } from "@/lib/search";

// Todas las funciones reciben el userId de quien llama, que lo obtiene de
// verifySession() en src/lib/dal.ts. Nunca de un dato enviado por el cliente.

const cardSelect = {
  brand: true,
  last4: true,
  holderName: true,
  expMonth: true,
  expYear: true,
  currency: true,
  balanceCents: true,
} satisfies Prisma.CardSelect;

const movementSelect = {
  id: true,
  type: true,
  name: true,
  amountCents: true,
  occurredAt: true,
} satisfies Prisma.MovementSelect;

// Desempata por id para que el orden sea estable si dos fechas coinciden.
const newestFirst = [
  { occurredAt: "desc" },
  { id: "desc" },
] satisfies Prisma.MovementOrderByWithRelationInput[];

export type CardSummary = Prisma.CardGetPayload<{ select: typeof cardSelect }>;
export type MovementItem = Prisma.MovementGetPayload<{
  select: typeof movementSelect;
}>;

export async function getCardForUser(
  userId: string,
): Promise<CardSummary | null> {
  return prisma.card.findUnique({ where: { userId }, select: cardSelect });
}

export async function getRecentMovements(
  userId: string,
  limit = 5,
): Promise<MovementItem[]> {
  return prisma.movement.findMany({
    where: { userId },
    select: movementSelect,
    orderBy: newestFirst,
    take: limit,
  });
}

export async function searchMovements(
  userId: string,
  { q, type }: { q?: string; type?: string },
): Promise<MovementItem[]> {
  const query = q?.trim().slice(0, MAX_QUERY_LENGTH);
  const where: Prisma.MovementWhereInput = { userId };

  if (query) {
    where.name = { contains: escapeLikePattern(query), mode: "insensitive" };
  }
  if (isMovementType(type)) {
    where.type = type;
  }

  return prisma.movement.findMany({
    where,
    select: movementSelect,
    orderBy: newestFirst,
  });
}

// Prisma traduce `contains` a ILIKE '%valor%' sin escapar los comodines, así
// que "%" o "_" matchearían todo. Se escapan con "\", el escape por defecto de
// Postgres, para que se busquen como texto literal.
function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function isMovementType(value: string | undefined): value is MovementType {
  return Object.values(MovementType).includes(value as MovementType);
}
