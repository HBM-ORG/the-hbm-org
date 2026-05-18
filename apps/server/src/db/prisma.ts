import { PrismaClient } from "@prisma/client";

/**
 * Single PrismaClient per Node process. Multiple `new PrismaClient()` instances (one per
 * service module) each open a full pool and exhaust MySQL max_connections quickly.
 *
 * In development, attach to `globalThis` so tsx/nodemon reloads reuse one client.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma
  ?? new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
