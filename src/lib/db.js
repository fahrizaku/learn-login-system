import { PrismaClient } from "@prisma/client";

// Deklarasi variabel global untuk Prisma Client
globalThis.prisma = globalThis.prisma || undefined;

// Inisialisasi Prisma Client
const db = globalThis.prisma || new PrismaClient();

// Cegah pembuatan instance baru di lingkungan development
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

export { db };
