import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["warn", "error"],
  });

globalForPrisma.prisma = db;

// Wraps a Prisma query with one automatic retry to handle Neon cold-start
// (P1001 = can't reach server — database was auto-suspended).
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (err?.code === "P1001" || err?.code === "P1002") {
      await new Promise((r) => setTimeout(r, 2000));
      return fn();
    }
    throw err;
  }
}

export const prisma = db;
