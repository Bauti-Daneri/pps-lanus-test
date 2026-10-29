import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

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

async function main() {
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);

  const user = await prisma.user.upsert({
    where: { email: TEST_USER.email },
    update: { name: TEST_USER.name, passwordHash },
    create: { email: TEST_USER.email, name: TEST_USER.name, passwordHash },
  });

  console.log(`Usuario de prueba listo: ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
