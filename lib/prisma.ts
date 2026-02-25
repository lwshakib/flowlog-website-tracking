/**
 * @file lib/prisma.ts
 * @description Database client configuration using Prisma.
 * Implements a singleton pattern to prevent multiple instances of PrismaClient
 * in development, and configures the PostgreSQL adapter.
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// The connection string for the PostgreSQL database
const connectionString = `${process.env.DATABASE_URL}`;

// Initialize the database adapter
const adapter = new PrismaPg({ connectionString });

/**
 * Global object to hold the Prisma instance in development.
 * This prevents exhaustion of the database connection pool.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * The exported Prisma instance.
 * Uses the existing global instance or creates a new one with the PG adapter.
 */
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
