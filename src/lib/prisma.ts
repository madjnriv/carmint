import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makeClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  // Create a connection pool (recommended for production efficiency)
  const pool = new Pool({ connectionString });

  // Instantiate the adapter with the pool
  const adapter = new PrismaPg(pool);

  // Return PrismaClient with adapter and your desired logging levels
  return new PrismaClient({
    adapter,
    log: ["error", "info", "warn"],
  });
}

export const prisma = globalForPrisma.prisma || makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

