import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const FALLBACK_DATABASE_URL =
  'postgresql://postgres.wbrmnevzjdzfczacdypb:MIPUg26m0a0sAAop@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true'

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || FALLBACK_DATABASE_URL,
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
