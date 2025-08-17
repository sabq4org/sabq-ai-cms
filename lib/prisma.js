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

export { prisma };
export default prisma
