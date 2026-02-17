// src/lib/prisma.ts
import { PrismaClient } from "../generated/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Minimal options object for local SQLite
export const prisma = new PrismaClient();
