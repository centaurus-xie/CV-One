import { PrismaClient } from "@prisma/client";

declare global {
  var __cvOnePrisma__: PrismaClient | undefined;
}

export const prisma = globalThis.__cvOnePrisma__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__cvOnePrisma__ = prisma;
}
