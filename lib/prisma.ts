// lib/prisma.ts
import pkg from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL as string;

const { PrismaClient } = pkg;

// In Prisma 7, you can pass the string directly.
// If your URL starts with mysql://, the adapter handles it.
const adapter = new PrismaMariaDb(databaseUrl);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
