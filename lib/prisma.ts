import { PrismaClient, Prisma } from '@/lib/generated/prisma'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient

// Robust initialization for different environments
function initializePrismaClient() {
  const clientOptions: Prisma.PrismaClientOptions = {
    log: process.env.NODE_ENV === 'development' 
      ? [
          { emit: 'stdout', level: 'query' },
          { emit: 'stdout', level: 'error' },
          { emit: 'stdout', level: 'info' },
          { emit: 'stdout', level: 'warn' }
        ]
      : [{ emit: 'stdout', level: 'error' }]
  }

  try {
    return new PrismaClient(clientOptions)
  } catch (error) {
    console.error('Failed to initialize Prisma Client:', error)
    throw error
  }
}

// Serverless-friendly initialization
if (typeof window === 'undefined') {
  if (process.env.NODE_ENV === 'production') {
    // Always create a new instance in production/serverless
    prisma = initializePrismaClient()
  } else {
    // Use global instance in development
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = initializePrismaClient()
    }
    prisma = globalForPrisma.prisma
  }
} else {
  // Fallback for client-side (should rarely happen)
  prisma = initializePrismaClient()
}

export default prisma
