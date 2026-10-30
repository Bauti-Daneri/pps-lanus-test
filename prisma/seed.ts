import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  CardBrand,
  MovementType,
  PrismaClient,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Falta la variable de entorno DATABASE_URL");
}

// El seed solo hace consultas comunes (no cambia el esquema), así que usa la
// misma conexión con pooler que la app.
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const TEST_USER = {
  email: "soygranate@clublanus.com",
  name: "Granate",
  password: "GRANATE1@",
};

// Montos en centavos.
const TEST_CARD = {
  brand: CardBrand.MASTERCARD,
  last4: "1234",
  holderName: "Soy Granate",
  expMonth: 2,
  expYear: 2030,
  currency: "USD",
  balanceCents: 97885,
};

// De más nuevo a más viejo.
const TEST_MOVEMENTS = [
  { name: "Adobe", type: MovementType.SUS, amountCents: 12500 },
  { name: "Ronaldo", type: MovementType.CASH_IN, amountCents: 9500 },
  { name: "Figma", type: MovementType.SUS, amountCents: 12500 },
  { name: "Juan Perez", type: MovementType.CASH_OUT, amountCents: 9500 },
  { name: "Martin Bozzini", type: MovementType.CASH_IN, amountCents: 9500 },
  { name: "José Suárez", type: MovementType.CASH_IN, amountCents: 9500 },
  { name: "Juan Rodríguez", type: MovementType.CASH_OUT, amountCents: 9500 },
  { name: "Julio César", type: MovementType.CASH_IN, amountCents: 9500 },
  { name: "Mariano Martínez", type: MovementType.CASH_OUT, amountCents: 9500 },
  { name: "Juan David", type: MovementType.CASH_IN, amountCents: 9500 },
];

const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  // El hash es lento a propósito: se calcula antes de abrir la transacción
  // para no tenerla abierta mientras tanto.
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

  // El más nuevo es hoy a las 12:00 UTC y cada uno de los siguientes, un día
  // antes, para que "últimos movimientos" siempre se vea reciente.
  const newest = new Date();
  newest.setUTCHours(12, 0, 0, 0);

  // Todo o nada: borrar y recrear los datos del usuario dentro de una
  // transacción hace que correr el seed varias veces no duplique nada.
  const { user, movementCount } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.upsert({
      where: { email: TEST_USER.email },
      update: { name: TEST_USER.name, passwordHash },
      create: { email: TEST_USER.email, name: TEST_USER.name, passwordHash },
    });

    await tx.card.deleteMany({ where: { userId: user.id } });
    await tx.movement.deleteMany({ where: { userId: user.id } });

    await tx.card.create({ data: { ...TEST_CARD, userId: user.id } });
    const { count } = await tx.movement.createMany({
      data: TEST_MOVEMENTS.map((movement, index) => ({
        ...movement,
        userId: user.id,
        occurredAt: new Date(newest.getTime() - index * DAY_MS),
      })),
    });

    return { user, movementCount: count };
  });

  console.log(
    `Usuario de prueba listo: ${user.email} (1 tarjeta, ${movementCount} movimientos)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
