import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prismaVal: PrismaClient | undefined
}

export const prisma = globalForPrisma.prismaVal ?? new PrismaClient()


// Force HMR
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaVal = prisma
// Force HMR Update

// Force HMR Update 2
