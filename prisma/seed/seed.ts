import { PrismaClient } from "@prisma-generated";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedTaxonomy } from "./taxonomy.seed";
import { seedClassifieds } from "./classified.seed";
import { seedImages } from "./images.seed";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  // Optional: add logging if helpful during seeding
  // log: ["query", "info", "warn", "error"],
});

async function main() {
  // await prisma.$executeRaw`TRUNCATE TABLE "makes" RESTART IDENTITY CASCADE;`; // Clear existing data
  // await seedTaxonomy(prisma);

  // await seedClassifieds(prisma);

  await seedImages(prisma);
  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });