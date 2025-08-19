import { PrismaClient } from '@prisma/client'

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      log: ['error'],
    })
  }
  prisma = global.prisma
}

// دالة مساعدة متوافقة مع الاستيراد من TypeScript
export function getPrismaClient() {
  if (typeof window !== 'undefined') {
    throw new Error('PrismaClient cannot be used in browser environment')
  }
  return prisma
}

export { prisma }

export default prisma
